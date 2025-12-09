# CI/CD Pipeline Design Document: Global Site Monorepo (SCSS Edition)

このドキュメントは、SCSSを採用した多言語Webサイトのビルド・デプロイ設計仕様書である。
Cursorはこの内容に基づき、ディレクトリ構築とビルドスクリプトの実装を行うこと。

## 1. アーキテクチャ概要

* **リポジトリ構成:** モノレポ (Monorepo)
* **CSS設計:** FLOCSSベースのSCSS構成
* **ビルド戦略:** SCSS Overlay Strategy
    1. **Merge (結合):** 共通SCSS (`_shared`) を作業用ディレクトリ (`.tmp`) に展開し、国別SCSS (`locales`) で上書きする。これにより `_variables.scss` 等の値を国ごとに差し替えることを可能にする。
    2. **Compile (変換):** `.tmp` 内の結合されたSCSSをコンパイルし、配信ディレクトリ (`dist`) にCSSを出力する。
    3. **Assets (静的資材):** JSや画像ファイルは `dist` へ直接マージコピーする。

## 2. ディレクトリ構造仕様

以下のディレクトリ構造を厳守して作成すること。SCSSディレクトリはFLOCSS構成を採用する。

```text
/project-root
├── package.json          # ビルド定義
├── .gitignore            # 除外設定
├── src/
│   ├── _shared/          # [共通資材]
│   │   ├── scss/
│   │   │   ├── style.scss            # エントリーポイント (@useの集約)
│   │   │   ├── foundation/           # _base.scss, _reset.scss, _variables.scss, _mixin.scss
│   │   │   ├── layout/               # _header.scss, _footer.scss, _main.scss, _sidebar.scss
│   │   │   └── object/
│   │   │       ├── component/        # _button.scss, _icon.scss, _input.scss
│   │   │       ├── project/          # _article.scss, _card.scss, _contact.scss
│   │   │       └── utility/          # _utility.scss
│   │   ├── js/
│   │   └── img/
│   └── locales/          # [国別資材] (差分のみ配置)
│       ├── jp/
│       │   ├── scss/
│       │   │   └── foundation/
│       │   │       └── _variables.scss  # 日本専用の変数定義（上書き用）
│       │   └── img/
│       └── us/
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD設定
```

## 3. 実装詳細

### 3.1. ビルドスクリプト (`package.json`)

`sass` パッケージを使用し、一時ディレクトリ(`.tmp`)を経由するビルドフローを実装する。

**`package.json` 実装要件:**

```json
{
  "name": "global-site-assets",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "rimraf dist .tmp",
    "prebuild": "npm run clean",

    "//_COMMENT": "--- Build Flows (Clean -> Prepare -> Sass -> Assets) ---",
    "build:jp": "npm run _prepare:jp && npm run _sass:jp && npm run _assets:jp",
    "build:us": "npm run _prepare:us && npm run _sass:us && npm run _assets:us",
    
    "build:all": "npm-run-all -p build:jp build:us",

    "//_INTERNAL_JP": "--- Internal Steps (JP) ---",
    "_prepare:jp": "mkdir -p .tmp/jp && cpx \"src/_shared/scss/**/*\" .tmp/jp/scss && cpx \"src/locales/jp/scss/**/*\" .tmp/jp/scss",
    "_sass:jp": "mkdir -p dist/jp/css && sass .tmp/jp/scss/style.scss dist/jp/css/style.css --style compressed --no-source-map",
    "_assets:jp": "cpx \"src/_shared/{js,img}/**/*\" dist/jp && cpx \"src/locales/jp/{js,img}/**/*\" dist/jp",

    "//_INTERNAL_US": "--- Internal Steps (US) ---",
    "_prepare:us": "mkdir -p .tmp/us && cpx \"src/_shared/scss/**/*\" .tmp/us/scss && cpx \"src/locales/us/scss/**/*\" .tmp/us/scss",
    "_sass:us": "mkdir -p dist/us/css && sass .tmp/us/scss/style.scss dist/us/css/style.css --style compressed --no-source-map",
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

**要件:**
* Node.js v18以上を使用（Sass互換性のため）
* `npm run build:all` 実行後に `dist/` ディレクトリをデプロイ対象とする

**`deploy.yml` の実装例:**

```yaml
name: Deploy Assets

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
    * `src/_shared/scss` 配下に、仕様書セクション2の階層通りにフォルダと空ファイルを作成してください。
    * `src/locales/jp/scss/foundation/_variables.scss` も作成してください。
    * `style.scss` には適切な `@use` 記述を行ってください。
2.  **設定ファイル作成:** `package.json` と `.gitignore` を作成してください。
3.  **ワークフロー作成:** `.github/workflows/deploy.yml` を作成してください。
4.  **インストール:** ターミナルで `npm install` を実行するコマンドを提案してください。