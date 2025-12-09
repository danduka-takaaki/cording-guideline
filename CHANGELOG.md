# Changelog

このプロジェクトのすべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいています。

---

## [1.1.0] - 2025-12-09

### Added
- **HTML Overlay機能の追加**
  - `src/_shared/html/` - 共通HTMLテンプレート格納ディレクトリ
  - `src/locales/jp/html/` - JP用HTML上書きディレクトリ
  - `src/locales/us/html/` - US用HTML上書きディレクトリ
  - `src/_shared/html/index.html` - 共通トップページテンプレート
  - `src/locales/jp/html/index.html` - 日本語トップページ（上書き）

### Changed
- **package.json**
  - `_html:jp`, `_html:us` スクリプト追加
  - `build:jp`, `build:us` にHTML処理ステップを追加
  - description を "SCSS + HTML Edition" に更新

- **deploy.yml**
  - デバッグ用 `ls -R dist/` ステップを追加

---

## [1.0.0] - 2025-12-09

### Added
- **初期環境構築**
  - FLOCSS構成に基づくSCSSディレクトリ構造
  - モノレポ形式の多言語サイト対応

- **SCSS構成 (`src/_shared/scss/`)**
  - `foundation/` - `_reset.scss`, `_base.scss`, `_variables.scss`, `_mixin.scss`
  - `layout/` - `_header.scss`, `_footer.scss`, `_main.scss`, `_sidebar.scss`
  - `object/component/` - `_button.scss`, `_icon.scss`, `_input.scss`
  - `object/project/` - `_article.scss`, `_card.scss`, `_contact.scss`
  - `object/utility/` - `_utility.scss`
  - `style.scss` - エントリーポイント

- **国別SCSS**
  - `src/locales/jp/scss/foundation/_variables.scss` - 日本向け変数（フォント、カラー等）
  - `src/locales/us/scss/` - USサイト用ディレクトリ

- **ビルドシステム**
  - `package.json` - npm scripts によるビルドフロー定義
  - SCSS Overlay Strategy（共通→国別上書き）

- **CI/CD**
  - `.github/workflows/deploy.yml` - GitHub Actions デプロイ設定
  - `.gitignore` - 除外設定

### Fixed
- **Windows互換性対応**
  - `mkdir -p` → `mkdirp` パッケージに置換（クロスプラットフォーム対応）

- **Dart Sass 3.0 対応**
  - `darken()` → `color.adjust()` に更新（非推奨警告の解消）

- **JP変数定義の修正**
  - Overlay Strategy により国別 `_variables.scss` に全変数を定義

### Removed
- ルート直下の不要な `scss/` ディレクトリを削除

---

## テンプレート

新しいエントリを追加する際は、以下のテンプレートを使用してください。

```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- 新機能の追加

### Changed
- 既存機能の変更

### Fixed
- バグ修正

### Removed
- 削除された機能

### Security
- セキュリティに関する変更

### Deprecated
- 非推奨になった機能
```

---

## バージョニング規則

- **MAJOR (X.0.0)**: 破壊的変更（後方互換性のない変更）
- **MINOR (0.X.0)**: 機能追加（後方互換性あり）
- **PATCH (0.0.X)**: バグ修正（後方互換性あり）

