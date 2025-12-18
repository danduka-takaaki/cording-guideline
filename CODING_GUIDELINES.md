# コーディングガイドライン

本プロジェクトにおけるHTML/CSS/JavaScriptのコーディング規約を定義する。

---

## 1. 共通ルール

### 1.1 ファイル形式

| 項目 | 規約 |
|------|------|
| 文字コード | UTF-8 (BOMなし) |
| 改行コード | LF |
| インデント | スペース2つ (Soft Tabs) |
| 行末空白 | 削除する |
| ファイル末尾 | 空行1つ |

### 1.2 命名規則

| 対象 | 形式 | 例 |
|------|------|-----|
| ファイル名 | kebab-case (小文字) | `main-visual.jpg`, `user-profile.astro` |
| CSS クラス | BEM (kebab-case) | `c-button__icon--large` |
| JS 変数/関数 | camelCase | `getUserData()`, `isActive` |
| JS 定数 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_WIDTH` |
| JS クラス | PascalCase | `UserSlider`, `ModalController` |

---

## 2. HTMLガイドライン

### 2.1 基本原則

#### セマンティックマークアップ

見た目ではなく**文書構造に基づいてタグを選択**する。

```html
<!-- ❌ Bad: レイアウト目的でbrを使用 -->
<p>テキスト<br><br><br>テキスト</p>

<!-- ✅ Good: 適切な要素で構造化 -->
<p>テキスト</p>
<p>テキスト</p>
```

| 要件 | 使用すべきタグ |
|------|--------------|
| 見出し | `<h1>`〜`<h6>` (順序通り) |
| ナビゲーション | `<nav>` |
| 記事 | `<article>` |
| セクション | `<section>` |
| ボタン機能 | `<button>` (ページ遷移以外) |

### 2.2 アクセシビリティ (a11y)

| 要素 | 必須対応 |
|------|---------|
| 画像 | `alt` 属性必須。装飾画像は `alt=""` |
| フォーム | `<label>` を関連付け |
| アイコンボタン | `aria-label` で説明 |

### 2.3 属性の記述順序

可読性のため、以下の順序で記述する。

1. `class`
2. `id`, `name`
3. `data-*`
4. `src`, `for`, `type`, `href`
5. `title`, `alt`
6. `aria-*`, `role`

```html
<a class="c-button" id="submitBtn" href="/contact" aria-label="お問い合わせ">
  送信
</a>
```

---

## 3. CSSガイドライン (FLOCSS / BEM)

### 3.1 設計方針

本プロジェクトでは以下を採用する。

| 手法 | 目的 |
|------|------|
| **FLOCSS** | レイヤー構造によるCSS設計 |
| **BEM** | クラス命名規則 |

#### 設計原則

- **予測可能:** クラス名から役割と影響範囲が推測できる
- **再利用可能:** Componentはどこに置いてもデザインが崩れない
- **保守容易:** 新規追加・修正が既存スタイルに影響しない

### 3.2 ディレクトリ構成

```text
styles/
├── foundation/           # リセット、変数、Mixin
│   ├── _base.scss
│   ├── _reset.scss
│   ├── _variables.scss
│   └── _mixin.scss
├── layout/               # ページ共通の大枠
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _main.scss
│   └── _sidebar.scss
├── object/
│   ├── component/        # 再利用可能な最小単位
│   │   ├── _button.scss
│   │   ├── _icon.scss
│   │   └── _input.scss
│   ├── project/          # コンテンツ構成単位
│   │   ├── _article.scss
│   │   ├── _card.scss
│   │   └── _contact.scss
│   └── utility/          # 単機能ヘルパー
│       └── _utility.scss
├── theme-jp.scss         # JP用エントリーポイント
└── theme-us.scss         # US用エントリーポイント
```

### 3.3 レイヤー定義とプレフィックス

| レイヤー | プレフィックス | 役割 | ルール |
|----------|---------------|------|--------|
| Foundation | なし | Reset, 基本スタイル | モジュール定義禁止 |
| Layout | `l-` | ヘッダー、メイン等の「枠」 | ページ共通の大枠のみ |
| Component | `c-` | ボタン、アイコン等の「部品」 | **width/margin禁止** |
| Project | `p-` | カード、記事一覧等 | Componentを内包可 |
| Utility | `u-` | 単機能クラス | `!important` 許容 |

#### 特別なプレフィックス

| プレフィックス | 用途 | ルール |
|--------------|------|--------|
| `is-` | 状態変化 | モジュールとセットで定義 |
| `js-` | JSフック | **スタイル禁止** |

```scss
// ✅ Good: モジュールとセット
.c-button.is-active { opacity: 1; }

// ❌ Bad: 単体定義
.is-active { opacity: 1; }
```

### 3.4 BEM記法

クラス名は `Block__Element--Modifier` 形式で記述する。

| 要素 | 記号 | 役割 |
|------|------|------|
| Block | - | 親要素 |
| Element | `__` | 構成要素 |
| Modifier | `--` | バリエーション |

#### Elementの連結禁止

```html
<!-- ❌ Bad: Element連結 -->
<div class="p-card__body__title">...</div>

<!-- ✅ Good: Blockから直接接続 -->
<div class="p-card__body">
  <h3 class="p-card__title">...</h3>
</div>
```

### 3.5 SCSS記述ルール

#### ネスト制限

- **最大3階層まで**
- クラス名フルネーム記述を推奨（検索性向上）

```scss
// ✅ 推奨パターン
.p-card {
  // ...
}
.p-card__title {
  // ...
}
```

#### Componentの責務

Componentには外部影響するmarginを設定しない。

```scss
// ❌ Bad
.c-button { margin-bottom: 20px; }

// ✅ Good: Project側でレイアウト
.p-form .c-button { margin-bottom: 20px; }
```

#### メディアクエリ

PCファーストで記述し、SP向けはネストで追加。

```scss
.p-card {
  width: 300px;

  @include mq(sp) {
    width: 100%;
  }
}
```

### 3.6 アンチパターン（禁止事項）

| 禁止事項 | 理由 |
|---------|------|
| IDセレクタ (`#header`) | 詳細度が高すぎる |
| 要素直接指定 (`div`, `h2`) | foundation以外では禁止 |
| カスケード乱用 (`.l-main .p-card`) | 詳細度破綻 |
| マジックナンバー (`z-index: 9999`) | 根拠不明 |

### 3.7 判断基準: Component vs Project

```text
そのパーツを他のページ/サイトに持っていけるか？
├── Yes → Component (c-)
└── No  → Project (p-)

迷った場合 → まずProject → 複数箇所で使用時にComponentへ昇格
```

---

## 4. JavaScriptガイドライン

### 4.1 基本構文

| ルール | 内容 |
|-------|------|
| 言語仕様 | ES6+ (ES2015以降) |
| 変数宣言 | `const` 基本、再代入時のみ `let` (`var` 禁止) |
| 文字列結合 | テンプレートリテラル (`` `${val}` ``) |

### 4.2 DOM操作の分離

スタイル用クラスをJSセレクタに使用しない。

```javascript
// ❌ Bad: スタイルクラスを使用
const btn = document.querySelector('.c-button');

// ✅ Good: JSフック専用クラス
const btn = document.querySelector('.js-submit-button');
```

---

## 5. 画像・アセット

### 5.1 推奨フォーマット

| 用途 | フォーマット |
|------|------------|
| 写真・複雑な画像 | WebP (フォールバック: JPG/PNG) |
| アイコン・ロゴ | SVG |

### 5.2 最適化

- `width`/`height` 属性を指定（CLS防止）

---

## 【用語補足】

| 用語 | 説明 |
|------|------|
| FLOCSS | Foundation Layout Object CSSの略。レイヤー構造によるCSS設計手法 |
| BEM | Block Element Modifierの略。CSSクラス命名規則 |
| kebab-case | 単語をハイフンで繋ぐ形式 (例: `my-component`) |
| camelCase | 2語目以降の頭文字を大文字にする形式 (例: `myVariable`) |
| PascalCase | 全単語の頭文字を大文字にする形式 (例: `MyClass`) |
| a11y | Accessibilityの略記 (a + 11文字 + y) |
| CLS | Cumulative Layout Shift。レイアウトシフト指標 |
| SSG | Static Site Generation。静的サイト生成 |
| HMR | Hot Module Replacement。ホットリロード機能 |


