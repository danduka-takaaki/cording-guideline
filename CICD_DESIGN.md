# CI/CD Pipeline Design Document: Global Site Monorepo

このドキュメントは、HTML/SCSS/JSを含む多言語Webサイトのビルド・デプロイ設計仕様書である。
**自動コンパイル（Watchモード）**、**階層維持出力**、および**クロスプラットフォーム対応（Windows/Mac）**を要件に含む。
Cursorはこの内容に基づき、プロジェクト環境の構築を行うこと。

## 1. アーキテクチャ概要

* **リポジトリ構成:** モノレポ (Monorepo)
* **CSS設計:** FLOCSSベースのSCSS構成
* **ビルド戦略:** Overlay Strategy (オーバーレイ方式)
    1. **SCSS (Merge & Compile):**
       共通SCSS (`src/_shared/scss`) と国別SCSS (`src/locales/xx/scss`) を作業用ディレクトリ (`.tmp`) で結合・上書きし、そこからコンパイルを行う。これにより変数 (`_variables.scss`) の国別差し替えを可能にする。
    2. **HTML (Overlay):**
       共通HTML (`src/_shared/html`) をベースとし、国別HTML (`src/locales/xx/html`) で同名ファイルを上書きして `dist` ルートへ配置する。
    3. **Assets (Overlay):**
       画像やJSも同様に結合し、`dist` 配下へ配置する。

    * **開発時 (Watch):** `src` 内の変更を `cpx` (Watch) で `.tmp` へ同期し、並列で動く `sass` (Watch) が `.tmp` から `dist` へコンパイルする。
    * **本番時 (Build):** 一括で `.tmp` へ結合し、コンパイルして `dist` を生成する。
* **出力仕様:**
    * SCSSのディレクトリ階層構造を維持してCSSを出力する（例: `scss/page/top.scss` -> `css/page/top.css`）。

## 2. ディレクトリ構造仕様

```text
/project-root
├── package.json          # ビルド & Watchスクリプト
├── .gitignore
├── README.md             # 開発者向けドキュメント
├── src/
│   ├── _shared/          # [共通資材]
│   │   ├── html/         # index.html 等
│   │   ├── scss/         # FLOCSS構成
│   │   │   ├── style.scss            # メインエントリーポイント
│   │   │   ├── foundation/           # _variables.scss 等
│   │   │   ├── layout/
│   │   │   ├── object/
│   │   │   └── pages/                # [NEW] ページ個別CSS用
│   │   │       └── _dummy.scss
│   │   ├── js/
│   │   └── img/
│   └── locales/          # [国別資材] (差分のみ配置)
│       ├── jp/
│       │   ├── html/     # HTML上書き用
│       │   ├── scss/
│       │   │   └── foundation/
│       │   │       └── _variables.scss  # 変数上書き用
│       │   └── img/
│       └── us/
└── .github/
    └── workflows/
        └── deploy.yml
```

## 3. 実装詳細

### 3.1. ビルド & 監視スクリプト (`package.json`)

**要件:**
* `sass input:output` 構文による階層維持。
* `make-dir-cli` によるWindows対応。
* `npm-run-all` による並列処理。
* `engines` フィールドによるNode.jsバージョン指定。

```json
{
  "name": "global-site-assets",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "clean": "rimraf dist .tmp",
    "prebuild": "npm run clean",

    "//_COMMENT_BUILD": "--- Production Build (One-off) ---",
    "build:jp": "npm run _prepare:jp && npm run _sass:jp && npm run _html:jp && npm run _assets:jp",
    "build:us": "npm run _prepare:us && npm run _sass:us && npm run _html:us && npm run _assets:us",
    "build:all": "npm-run-all -p build:jp build:us",

    "//_COMMENT_WATCH": "--- Development Watch (Auto Compile) ---",
    "dev:jp": "npm run clean && npm-run-all -p _watch:copy:shared:jp _watch:copy:local:jp _watch:sass:jp _watch:html:jp",

    "//_INTERNAL_JP": "--- Internal Steps (JP) ---",
    "_prepare:jp": "make-dir .tmp/jp && cpx \"src/_shared/scss/**/*\" .tmp/jp/scss && cpx \"src/locales/jp/scss/**/*\" .tmp/jp/scss",
    "_sass:jp": "sass .tmp/jp/scss:dist/jp/css --style compressed --no-source-map",
    "_html:jp": "cpx \"src/_shared/html/**/*\" dist/jp && cpx \"src/locales/jp/html/**/*\" dist/jp",
    "_assets:jp": "cpx \"src/_shared/{js,img}/**/*\" dist/jp && cpx \"src/locales/jp/{js,img}/**/*\" dist/jp",

    "//_INTERNAL_WATCH_JP": "--- Watchers (JP) ---",
    "_watch:copy:shared:jp": "cpx \"src/_shared/scss/**/*\" .tmp/jp/scss -w",
    "_watch:copy:local:jp": "cpx \"src/locales/jp/scss/**/*\" .tmp/jp/scss -w",
    "_watch:sass:jp": "sass .tmp/jp/scss:dist/jp/css --watch --style expanded --source-map",
    "_watch:html:jp": "cpx \"src/{_shared,locales/jp}/html/**/*\" dist/jp -w",

    "//_INTERNAL_US": "--- Internal Steps (US) ---",
    "_prepare:us": "make-dir .tmp/us && cpx \"src/_shared/scss/**/*\" .tmp/us/scss && cpx \"src/locales/us/scss/**/*\" .tmp/us/scss",
    "_sass:us": "sass .tmp/us/scss:dist/us/css --style compressed --no-source-map",
    "_html:us": "cpx \"src/_shared/html/**/*\" dist/us && cpx \"src/locales/us/html/**/*\" dist/us",
    "_assets:us": "cpx \"src/_shared/{js,img}/**/*\" dist/us && cpx \"src/locales/us/{js,img}/**/*\" dist/us"
  },
  "devDependencies": {
    "cpx": "^1.5.0",
    "make-dir-cli": "^3.0.0",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.0",
    "sass": "^1.69.0"
  }
}
```

### 3.2. Git除外設定 (`.gitignore`)

```text
node_modules/
dist/
.tmp/
.sass-cache/
.DS_Store
.env
*.log
```

### 3.3. CI/CDパイプライン (`.github/workflows/deploy.yml`)

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

## 4. 開発者向けガイドライン (README要件)

プロジェクトルートに作成する `README.md` には、以下の内容を記述すること。

1.  **環境要件:** Node.js v18以上必須。
2.  **セットアップ:** `npm install`
3.  **開発コマンド:**
    * `npm run dev:jp`: 日本サイトの開発サーバー（Watchモード）起動。
    * 終了時は `Ctrl + C`。
4.  **SCSSの仕組み:**
    * 本プロジェクトは `.tmp` フォルダでファイルを結合してからコンパイルします。
    * エラーログが `.tmp/jp/scss/...` を指していても、修正するのは `src` 配下のファイルです。
    * 国別デザイン変更は `src/locales/jp/scss` に同名ファイルを作成して上書きします。

## 5. Cursorへの実行指示 (Prompt)

このドキュメントを読み込んだ後、以下の手順を実行してください。

1.  **ディレクトリ構築:**
    * `src` 配下を仕様通りに作成してください。
    * `src/_shared/html/index.html` (共通トップページ) を作成してください。
    * `src/_shared/scss` はFLOCSS構成で空ファイルを作成してください。`style.scss` でそれらを `@use` してください。
    * `src/_shared/scss/pages/top.scss` (テスト用) を作成してください。
2.  **設定ファイル作成:** `package.json`, `.gitignore` を作成してください。
3.  **ドキュメント作成:** セクション4の内容に基づき、開発メンバー向けの `README.md` を作成してください。
4.  **ワークフロー作成:** `.github/workflows/deploy.yml` を作成してください。
5.  **インストール:** ターミナルで `npm install` を実行するコマンドを提案してください。
