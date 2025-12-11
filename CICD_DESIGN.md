# CI/CD Pipeline Design Document: Global Site (Astro)

このドキュメントでは、Astro移行後のビルド・デプロイパイプラインについて記述する。

## 1. ビルド戦略

従来の「ファイル結合・上書きプロセス」は廃止され、Astro標準のビルドコマンド単体で全言語の静的ファイルを生成する構成に変更された。

### 1.1 ビルドコマンド
```bash
npm run build
```

### 1.2 出力成果物 (`dist/`)
コマンド実行後、`dist` ディレクトリに以下の構造でファイルが生成される。

```text
dist/
├── index.html        # ルートページ
├── jp/
│   ├── index.html    # JPトップ
│   └── about/
│       └── index.html
├── us/
│   └── index.html    # USトップ
├── _astro/           # ハッシュ化されたJS/CSSアセット (自動生成)
└── img/              # public/img からコピーされた画像
```

## 2. GitHub Actions ワークフロー設計

`.github/workflows/deploy.yml` の構成案。
Node.js環境で依存関係をインストールし、ビルドしてデプロイするシンプルなフローとなる。

```yaml
name: Deploy Global Site

on:
  push:
    branches: [ "main" ]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'astro.config.mjs'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        # package-lock.jsonに基づき厳密にインストール
        run: npm ci

      - name: Build Project
        run: npm run build

      - name: Deploy to Web Server
        uses: easingthemes/ssh-deploy@v4
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rltgoDzvO --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USER }}
          TARGET: ${{ secrets.DEPLOY_PATH }}
```

## 3. 環境・インフラ要件

* **ビルド環境:** Node.js v18.14.1以上が必須。
* **Webサーバー:** 静的HTMLホスティングが可能な環境（Nginx, Apache, S3, Netlify, Vercel等）。
    * 特殊なサーバーサイド処理は不要。
    * サブディレクトリ (`/jp/`, `/us/`) へのアクセスが正しく `index.html` にルーティングされる設定が必要（一般的なWebサーバーのデフォルト挙動）。
