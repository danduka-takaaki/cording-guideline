# CI/CD パイプライン設計

Astroプロジェクトのビルド・デプロイパイプライン設計。

---

## 1. ビルド戦略

従来の「ファイル結合・上書きプロセス」は廃止。Astro標準のビルドコマンドで全言語の静的ファイルを生成する。

### 1.1 ビルドコマンド

```bash
npm run build
```

### 1.2 出力構造 (`dist/`)

```text
dist/
├── index.html            # ルートページ
├── jp/
│   ├── index.html        # JPトップ
│   └── about/
│       └── index.html
├── us/
│   └── index.html        # USトップ
├── _astro/               # ハッシュ化されたJS/CSSアセット
└── img/                  # public/img からコピー
```

---

## 2. GitHub Actions ワークフロー

### 2.1 設定ファイル

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy Global Site

on:
  push:
    branches: ["main"]
    paths:
      - "src/**"
      - "public/**"
      - "package.json"
      - "astro.config.mjs"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@v5
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rltgoDzvO --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USER }}
          TARGET: ${{ secrets.DEPLOY_PATH }}
```

### 2.2 必要なSecrets

| Secret名 | 内容 |
|----------|------|
| `SSH_PRIVATE_KEY` | デプロイ用SSH秘密鍵 |
| `SERVER_HOST` | デプロイ先ホスト名/IP |
| `SERVER_USER` | SSHユーザー名 |
| `DEPLOY_PATH` | デプロイ先パス |

---

## 3. 代替デプロイ先

### Vercel

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: "--prod"
```

### Netlify

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2
  with:
    publish-dir: "./dist"
    production-deploy: true
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### AWS S3 + CloudFront

```yaml
- name: Deploy to S3
  uses: jakejarvis/s3-sync-action@master
  with:
    args: --delete
  env:
    AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    SOURCE_DIR: "dist"

- name: Invalidate CloudFront
  uses: chetan/invalidate-cloudfront-action@v2
  env:
    DISTRIBUTION: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
    PATHS: "/*"
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 4. 環境要件

### 4.1 ビルド環境

| 項目 | 要件 |
|------|------|
| Node.js | v18.14.1以上 |
| npm | v9以上 |

### 4.2 ホスティング環境

| 要件 | 詳細 |
|------|------|
| タイプ | 静的HTMLホスティング |
| サーバー例 | Nginx, Apache, S3, Netlify, Vercel |
| ルーティング | サブディレクトリ → `index.html` 解決 |

**Nginx設定例:**

```nginx
server {
    listen 80;
    root /var/www/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # キャッシュ設定
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 5. パイプライン最適化

### 5.1 キャッシュ活用

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 5.2 並列ビルド（複数環境）

```yaml
strategy:
  matrix:
    environment: [staging, production]
```

---

## 【用語補足】

| 用語 | 説明 |
|------|------|
| SSG | Static Site Generation。ビルド時にHTMLを生成 |
| CI/CD | Continuous Integration / Continuous Deployment |
| HMR | Hot Module Replacement。開発時の自動リロード |

