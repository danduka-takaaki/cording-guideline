# Global Site Monorepo (Astro Edition)

Astroフレームワークを採用した、多言語・多拠点Webサイト構築プロジェクトです。

> **v2.0 Breaking Change:** 従来のファイル上書き（Overlay）方式から、コンポーネントベースのモダンな開発フローへ移行しました。

---

## クイックスタート

### 前提条件

- Node.js v18.14.1以上
- npm v9以上

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (HMR対応)
npm run dev

# 本番ビルド (dist/ に出力)
npm run build
```

**開発サーバーURL:**

| サイト | URL |
|-------|-----|
| ルート | http://localhost:4321 |
| JP | http://localhost:4321/jp/ |
| US | http://localhost:4321/us/ |

---

## ディレクトリ構造

```text
/
├── astro.config.mjs          # Astro設定
├── package.json
├── src/
│   ├── components/           # 共通UIコンポーネント
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   └── Header.astro
│   ├── layouts/              # ページレイアウト
│   │   ├── BaseLayout.astro  # HTML骨格
│   │   └── PageLayout.astro  # 共通レイアウト
│   ├── pages/                # ファイルベースルーティング
│   │   ├── index.astro       # ルート (リダイレクト等)
│   │   ├── jp/               # 日本向けページ
│   │   └── us/               # 米国向けページ
│   └── styles/               # FLOCSS構成SCSS
│       ├── foundation/       # Reset, Variables, Mixin
│       ├── layout/           # Header, Footer, Main
│       ├── object/           # Component, Project, Utility
│       ├── theme-jp.scss     # JP用エントリーポイント
│       └── theme-us.scss     # US用エントリーポイント
└── public/                   # 静的アセット (そのままdist/へコピー)
    ├── img/
    │   ├── common/
    │   ├── jp/
    │   └── us/
    └── favicon.ico
```

---

## ドキュメント一覧

| ドキュメント | 内容 |
|-------------|------|
| [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) | HTML/CSS/JS コーディング規約 (FLOCSS/BEM) |
| [DEVELOPER_MANUAL.md](./DEVELOPER_MANUAL.md) | Astroでの開発手順・実装ガイド |
| [CICD_DESIGN.md](./CICD_DESIGN.md) | CI/CDパイプライン設計 |
| [CHANGELOG.md](./CHANGELOG.md) | 変更履歴 |

---

## 基本ルール（概要）

### ファイル規約

| 項目 | 規約 |
|------|------|
| 文字コード | UTF-8 (BOMなし) |
| 改行コード | LF |
| インデント | スペース2つ |
| ファイル名 | 小文字 + kebab-case (`main-visual.jpg`) |

### 技術スタック

| カテゴリ | 採用技術 |
|----------|---------|
| フレームワーク | Astro |
| CSS設計 | FLOCSS + BEM |
| スタイル | SCSS |
| 言語 | ES6+ |

> **詳細なコーディング規約は [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) を参照してください。**

---

## Git運用

### コミットプレフィックス

| プレフィックス | 用途 |
|--------------|------|
| `feat:` | 新機能追加 |
| `fix:` | バグ修正 |
| `update:` | 機能修正 (バグ以外) |
| `style:` | スタイル調整 |
| `refactor:` | リファクタリング |
| `docs:` | ドキュメント修正 |

### ブランチ運用

- `main` への直接コミット禁止
- トピックブランチ → Pull Request でマージ

---

## v1.x からの移行

| 項目 | v1.x (旧) | v2.0 (新) |
|------|-----------|-----------|
| ビルド方式 | cpxによるファイル上書き | Astro標準SSG |
| HTML | 直接編集 | `.astro` コンポーネント |
| 国別対応 | ディレクトリ上書き | `pages/jp/`, `pages/us/` ルーティング |
| CSS変数切替 | ビルド時結合 | テーマファイル (`theme-*.scss`) |

