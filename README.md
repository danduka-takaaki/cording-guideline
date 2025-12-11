# Global Site Monorepo (Astro Edition)

Astroフレームワークを採用した、多言語・多拠点Webサイト構築プロジェクトです。
v2.0より、従来のファイル上書き（Overlay）方式から、コンポーネントベースのモダンな開発フローへ移行しました。

## 1. 開発環境のセットアップ

### 前提条件
* Node.js v18.14.1以上
* npm v9以上

### インストール
リポジトリをクローンした後、以下のコマンドを実行してください。

```bash
npm install
```

### 開発コマンド

**ローカルサーバーの起動 (Dev Mode):**
以下のコマンドで開発サーバーが起動します。ファイルの変更は自動的に検知・反映されます（HMR）。

```bash
npm run dev
```

* **ローカルURL:** http://localhost:4321
* **JPトップ:** http://localhost:4321/jp/
* **USトップ:** http://localhost:4321/us/

### 本番ビルド
静的サイト生成（SSG）を行い、`dist/` ディレクトリに出力します。

```bash
npm run build
```

---

## 2. ディレクトリ構造

Astroの標準的な構成に加え、FLOCSSに基づくスタイル管理を行っています。

```text
/
├── package.json
├── astro.config.mjs      # Astro設定ファイル
├── src/
│   ├── components/       # [共通部品] ボタン、ヘッダー、カードなど
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   └── Header.astro
│   ├── layouts/          # [レイアウト] ページの枠組み
│   │   ├── BaseLayout.astro  # HTML全体の骨格
│   │   └── PageLayout.astro  # 共通レイアウト
│   ├── pages/            # [ルーティング] URLに対応するページファイル
│   │   ├── index.astro   # ルート (リダイレクト用など)
│   │   ├── jp/           # 日本向けページ群
│   │   │   └── index.astro
│   │   └── us/           # 米国向けページ群
│   │       └── index.astro
│   └── styles/           # [スタイル] FLOCSS構成のSCSS
│       ├── foundation/
│       ├── layout/
│       ├── object/
│       ├── theme-jp.scss # JP用エントリーポイント (変数を定義して共通を読み込む)
│       └── theme-us.scss # US用エントリーポイント
└── public/               # [静的アセット] 画像、faviconなど
    ├── img/
    │   ├── common/       # 共通画像
    │   ├── jp/           # JP専用画像
    │   └── us/           # US専用画像
    └── favicon.ico
```

---

## 3. アーキテクチャの変更点 (Migration Guide)

### 旧バージョン (v1.x) との違い
* **ビルド方式:** `cpx` によるファイルコピー・上書き（Overlay方式）は廃止されました。
* **HTML:** HTMLファイルを直接編集するのではなく、`.astro` コンポーネントを組み合わせてページを作成します。
* **国別対応:** ディレクトリによるファイル上書きではなく、`src/pages/jp/`, `src/pages/us/` というディレクトリによるルーティング分けで管理します。
* **CSS:** SCSS変数の切り替えは、各国のレイアウトファイルが読み込む「テーマファイル (`theme-jp.scss`等)」によって制御されます。

---

## 4. 全体共通ルール

### 4.1 文字コード・改行コード
* **文字コード:** `UTF-8` (BOMなし)
* **改行コード:** `LF` (UNIX標準)
* **インデント:** スペース2つ (Soft Tabs: 2)
* **末尾の空白:** 行末の不要なスペースは削除する。ファイルの末尾は空行を1つ入れる。

### 4.2 ファイル・ディレクトリ命名規則
* すべて **小文字 (lower case)** を使用する。
* 単語の区切りには **ハイフン (kebab-case)** を使用する（画像ファイル含む）。
    * Good: `company-logo.svg`, `main-visual.jpg`
    * Bad: `company_logo.svg`, `mainVisual.jpg`

---

## 5. HTMLガイドライン

### 5.1 基本原則
* **セマンティックなマークアップ:** 見た目ではなく文書構造に基づいてタグを選択する。
    * 見出しには `h1`〜`h6` を順序通りに使用する。
    * レイアウト目的で `br` タグを使用しない。
    * ボタン機能を持つ要素は `div` や `a` ではなく `<button>` を使用する（ページ遷移を除く）。

### 5.2 アクセシビリティ (a11y)
* **画像:** `img` タグには必ず `alt` 属性を記述する。装飾目的の画像は `alt=""`（空）とする。
* **フォーム:** フォーム部品には必ずラベル (`label`) を関連付ける。

### 5.3 属性の記述順序
可読性を高めるため、以下の順序で記述することを推奨する。

1. `class`
2. `id`, `name`
3. `data-*`
4. `src`, `for`, `type`, `href`
5. `title`, `alt`
6. `aria-*`, `role`

```html
<a class="c-button" id="submitBtn" href="/contact" aria-label="お問い合わせ">
  ...
</a>
```

### 5.4 コメント
主要なブロックの閉じタグには、対応するクラス名や役割をコメントとして記述する。

```html
<header class="l-header">
  ...
</header>
```

---

## 6. CSSガイドライン

### 6.1 設計手法・命名規則
* **設計手法:** **FLOCSS (Foundation Layout Object CSS)** を採用する。
* **命名規則:** **BEM (Block Element Modifier)** を用いる。
    * クラス名は `Block__Element--Modifier` の形式とする。
    * **Elementの連結禁止:** `Block__Element__Element` は不可。常にBlockを起点にする。

### 6.2 ディレクトリ構成 (SCSS)
`style.scss` をエントリーポイントとし、`@use` または `@import` で集約する。

```text
scss/
├── style.scss
├── foundation/  (Reset, Variable, Mixin)
├── layout/      (Header, Footer, Sidebar, Main)
└── object/
    ├── component/ (Button, Icon, Input)
    ├── project/   (Article, Card, Contact)
    └── utility/   (Margin, Text-align)
```

### 6.3 プレフィックス
各レイヤーに対応したプレフィックスを必ず付与する。

| レイヤー | プレフィックス | 役割 | ルール |
| :--- | :--- | :--- | :--- |
| **Foundation** | なし | Reset CSS, 基本スタイル | 具体的なモジュールの定義は禁止 |
| **Layout** | `l-` | ヘッダー、メインエリア等の「枠」 | ページ共通の大きな枠組みに使用 |
| **Component** | `c-` | ボタン、アイコン等の「部品」 | **固有の幅(width)や余白(margin)を持たせない** |
| **Project** | `p-` | 記事一覧、カード等の「コンテンツ」 | Componentを内包しても良い |
| **Utility** | `u-` | `display: none`等の単機能 | `!important` の使用を許容する唯一の場所 |

### 6.4 特別なプレフィックス
* **状態変化 (`is-`):** JavaScriptによる操作や状態変化を表す（例: `.is-active`）。
    * 必ずモジュールとセットで定義する（`is-` クラス単体にはスタイルを当てない）。
* **JSフック (`js-`):** JavaScriptから要素を取得するためだけに使用する。
    * **スタイルを絶対に当ててはいけない**。

### 6.5 禁止事項（アンチパターン）
1. **IDセレクタの使用禁止:** 詳細度が高すぎるため、スタイル目的での `#header` 等の使用は禁止。
2. **要素セレクタへの直接指定の制限:** `div`, `span` などへの直接指定は `foundation` 以外では原則禁止。
3. **マジックナンバーの使用禁止:** 根拠のない `z-index: 9999` や `margin: 37px` などは避ける。

---

## 7. JavaScriptガイドライン

### 7.1 基本構文
* **ES6+ (ES2015以降)** の構文を使用する。
* 変数宣言には `const` を基本とし、再代入が必要な場合のみ `let` を使用する (`var` は禁止)。
* 文字列結合にはテンプレートリテラル (`` `...${val}...` ``) を使用する。

### 7.2 命名規則
* **変数名・関数名:** キャメルケース (camelCase)
    * 例: `userInfo`, `getUserData()`
* **定数:** アッパースネークケース (UPPER_SNAKE_CASE)
    * 例: `API_BASE_URL`, `MAX_WIDTH`
* **クラス名:** パスカルケース (PascalCase)
    * 例: `UserSlider`

### 7.3 DOM操作の分離
* HTML要素をJavaScriptで取得する場合は、原則として `js-` プレフィックスがついたクラス、または `id` 属性を使用する。
* スタイル用のクラス（`p-card` や `c-button`）をJSのセレクタとして使用しないこと（デザイン変更時にJSが壊れるのを防ぐため）。

```javascript
/* Bad */
const btn = document.querySelector('.c-button');

/* Good */
const btn = document.querySelector('.js-submit-button');
```

---

## 8. 画像・アセットガイドライン

### 8.1 推奨フォーマット
* **写真・複雑な画像:** WebP (フォールバックとしてJPG/PNG)
* **アイコン・ロゴ・図版:** SVG

### 8.2 最適化
* 画像はアップロードまたはコミットする前に、TinyPNG等のツールを用いて圧縮を行う。
* `width` / `height` 属性をHTML側で指定し、レイアウトシフト (CLS) を防ぐ。

---

## 9. Git運用・その他

### 9.1 コミットメッセージ
変更内容がひと目でわかるプレフィックスを付けることを推奨する。

* `feat`: 新機能追加
* `fix`: バグ修正
* `update`: 機能修正（バグではない）
* `style`: スタイル調整（見た目の変更のみ）
* `refactor`: リファクタリング
* `docs`: ドキュメント修正

### 9.2 ブランチ運用
* 原則として `main` (または `master`) ブランチへの直接コミットは禁止。
* 作業ごとにトピックブランチを作成し、Pull Request (Merge Request) を通じてマージする。
