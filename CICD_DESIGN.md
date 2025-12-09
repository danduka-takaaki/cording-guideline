# CI/CD Pipeline Design Document: Global Site Monorepo (SCSS + HTML Edition)

このドキュメントは、HTML/SCSS/JSを含む多言語Webサイトのビルド・デプロイ設計仕様書である。
Cursorはこの内容に基づき、ディレクトリ構築とビルドスクリプトの実装を行うこと。

## 1. アーキテクチャ概要

* **リポジトリ構成:** モノレポ (Monorepo)
* **CSS設計:** FLOCSSベースのSCSS構成
* **ビルド戦略:** Overlay Strategy (HTML/SCSS/Assets)
    1. **SCSS (Merge & Compile):**
       共通SCSS (`src/_shared/scss`) と国別SCSS (`src/locales/xx/scss`) を作業用ディレクトリ (`.tmp`) で結合・上書きし、そこからコンパイルを行う。これにより変数 (`_variables.scss`) の国別差し替えを可能にする。
    2. **HTML (Overlay):**
       共通HTML (`src/_shared/html`) をベースとし、国別HTML (`src/locales/xx/html`) で同名ファイルを上書きして `dist` ルートへ配置する。
    3. **Assets (Overlay):**
       画像やJSも同様に結合し、`dist` 配下へ配置する。

## 2. ディレクトリ構造仕様

以下のディレクトリ構造を厳守して作成すること。

```text
/project-root
├── package.json          # ビルド定義
├── .gitignore            # 除外設定
├── src/
│   ├── _shared/          # [共通資材]
│   │   ├── html/         # [HTML] 共通テンプレート (index.html, common.html)
│   │   ├── scss/         # [SCSS] FLOCSS構成
│   │   │   ├── style.scss            # エントリーポイント
│   │   │   ├── foundation/           # _variables.scss, _reset.scss
│   │   │   ├── layout/               # _header.scss, _footer.scss
│   │   │   └── object/
│   │   │       ├── component/        # _button.scss
│   │   │       ├── project/          # _card.scss
│   │   │       └── utility/
│   │   ├── js/
│   │   └── img/
│   └── locales/          # [国別資材] (差分のみ配置)
│       ├── jp/
│       │   ├── html/     # [HTML] JP独自または上書き用HTML
│       │   ├── scss/
│       │   │   └── foundation/
│       │   │       └── _variables.scss  # JP専用の変数定義
│       │   └── img/
│       └── us/
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD設定
```

## 3. 実装詳細

### 3.1. ビルドスクリプト (`package.json`)

`sass` パッケージを使用し、HTML、SCSS、静的アセットそれぞれに対してオーバーレイ（共通+独自の上書き）処理を実装する。

**`package.json` 実装要件:**

```json
{
  "name": "global-site-assets",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "rimraf dist .tmp",
    "prebuild": "npm run clean",

    "//_COMMENT": "--- Build Flows (Parallel Execution) ---",
    "build:jp": "npm run _prepare:jp && npm run _sass:jp && npm run _html:jp && npm run _assets:jp",
    "build:us": "npm run _prepare:us && npm run _sass:us && npm run _html:us && npm run _assets:us",
    "build:all": "npm-run-all -p build:jp build:us",

    "//_INTERNAL_JP": "--- Internal Steps (JP) ---",
    "_prepare:jp": "mkdir -p .tmp/jp && cpx \"src/_shared/scss/**/*\" .tmp/jp/scss && cpx \"src/locales/jp/scss/**/*\" .tmp/jp/scss",
    "_sass:jp": "mkdir -p dist/jp/css && sass .tmp/jp/scss/style.scss dist/jp/css/style.css --style compressed --no-source-map",
    "_html:jp": "cpx \"src/_shared/html/**/*\" dist/jp && cpx \"src/locales/jp/html/**/*\" dist/jp",
    "_assets:jp": "cpx \"src/_shared/{js,img}/**/*\" dist/jp && cpx \"src/locales/jp/{js,img}/**/*\" dist/jp",

    "//_INTERNAL_US": "--- Internal Steps (US) ---",
    "_prepare:us": "mkdir -p .tmp/us && cpx \"src/_shared/scss/**/*\" .tmp/us/scss && cpx \"src/locales/us/scss/**/*\" .tmp/us/scss",
    "_sass:us": "mkdir -p dist/us/css && sass .tmp/us/scss/style.scss dist/us/css/style.css --style compressed --no-source-map",
    "_html:us": "cpx \"src/_shared/html/**/*\" dist/us && cpx \"src/locales/us/html/**/*\" dist/us",
    "_assets:us": "cpx \"src/_shared/{js,img}/**/*\" dist/us && cpx \"src/locales/us/{js,img}/**/*\" dist/us"
  },
  "devDependencies": {
    "cpx": "^1.5.0",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.0",
    "sass": "^1.69.0"
  }
}
```

### 3.2. Git除外設定 (`.gitignore`)

一時ディレクトリ (`.tmp`) を必ず除外すること。

```text
node_modules/
dist/
.tmp/
.sass-cache/
.DS_Store
.env
```

### 3.3. CI/CDパイプライン (`.github/workflows/deploy.yml`)

GitHub Actionsを使用し、Webサーバーへデプロイする。

**`deploy.yml` の実装例:**

```yaml
name: Deploy Global Site

on:
  push:
    branches: [ "main" ]
    paths:
      - 'src/**'
      - 'package.json'

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
        run: npm install

      - name: Build all locales
        run: npm run build:all

      - name: List files (Debug)
        run: ls -R dist/

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

## 4. Cursorへの実行指示 (Prompt)

このドキュメントを読み込んだ後、以下の手順を実行してください。

1.  **ディレクトリ構築:**
    * `src` 配下のディレクトリ構造を作成してください（`html`ディレクトリも忘れずに）。
    * `src/_shared/html/index.html` (共通トップページ) を作成してください。
    * `src/_shared/scss` 配下はFLOCSS構成で空ファイルを作成し、`style.scss` でそれらを `@use` してください。
2.  **設定ファイル作成:** `package.json` と `.gitignore` を仕様に従って作成してください。
3.  **ワークフロー作成:** `.github/workflows/deploy.yml` を作成してください。
4.  **動作確認用ファイル:**
    * `src/locales/jp/html/index.html` を作成し、中身を「JP Top (Override)」として、HTMLの上書き動作が確認できるようにしてください。
    * `src/locales/jp/scss/foundation/_variables.scss` を作成し、共通設定とは違う変数を定義してください。
5.  **インストール:** ターミナルで `npm install` を実行するコマンドを提案してください。
