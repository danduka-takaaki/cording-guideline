# FLOCSS コーディングガイドライン

## 1. 基本方針

本プロジェクトでは、CSSの保守性・拡張性を担保するため、設計手法として **FLOCSS (Foundation Layout Object CSS)** を採用し、命名規則には **BEM (Block Element Modifier)** を用いる。

### 原則
* **予測可能であること:** クラス名から役割と影響範囲が推測できること。
* **再利用可能であること:** 特にComponentはどこに置いてもデザインが崩れないこと。
* **保守容易であること:** 新規追加や修正が、既存のスタイルに影響を与えないこと。

---

## 2. ディレクトリ構成

Sass(SCSS)ファイルは以下の構成で管理する。
`style.scss` で各ファイルを `@use` または `@import` して集約する。

```text
scss/
├── style.scss            // 全ファイルを統括するエントリーポイント
├── foundation/           // リセット、変数、Mixin、基本設定
│   ├── _base.scss        // body, html等の基本設定
│   ├── _reset.scss       // リセットCSS
│   ├── _variables.scss   // 色、フォント、ブレークポイント等の変数
│   └── _mixin.scss       // Mixin関数
├── layout/               // 共通のレイアウト枠
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _main.scss
│   └── _sidebar.scss
└── object/               // サイトを構成するオブジェクト
    ├── component/        // 再利用可能な最小単位のモジュール
    │   ├── _button.scss
    │   ├── _icon.scss
    │   └── _input.scss
    ├── project/          // コンテンツを構成する集合体
    │   ├── _article.scss
    │   ├── _card.scss
    │   └── _contact.scss
    └── utility/          // 調整用クラス
        └── _utility.scss
```

---

## 3. レイヤー定義と命名規則

各レイヤーに対応したプレフィックス（接頭辞）を必ず付与する。

| レイヤー | プレフィックス | 役割 | ルール |
| :--- | :--- | :--- | :--- |
| **Foundation** | なし | Reset CSS, 基本スタイル | 具体的なモジュールの定義は禁止 |
| **Layout** | `l-` | ヘッダー、メインエリア等の「枠」 | ページ共通の大きな枠組みに使用 |
| **Component** | `c-` | ボタン、アイコン等の「部品」 | **固有の幅(width)や余白(margin)を持たせない** |
| **Project** | `p-` | 記事一覧、カード等の「コンテンツ」 | Componentを内包しても良い |
| **Utility** | `u-` | `display: none`等の単機能 | `!important` の使用を許容する唯一の場所 |

### ステート（状態）管理
JavaScriptによる操作や状態変化を表す場合は `is-` プレフィックスを使用する。
`is-` クラス単体にはスタイルを当てず、必ずモジュールとセットで定義する。

```scss
/* Good */
.c-button.is-active { opacity: 1; }

/* Bad: 何のactiveかわからない */
.is-active { opacity: 1; }
```

### JavaScriptフック
スタイル用ではなく、JavaScriptから要素を取得するためだけのクラスには js- を付与する。
ルール: js- クラスにはCSSでスタイルを絶対に当てないこと。

---

## 4. BEM記法 ルール

クラス名は `Block__Element--Modifier` の形式で記述する。

* **Block:** 塊の親要素
* **Element:** 構成要素（`__` 区切り）
* **Modifier:** バリエーション・状態（`--` 区切り）

### 重要な制約

#### 1. Elementの連結禁止
Elementの中にElementがある場合でも、クラス名はBlockから直接つなぐ（スネークケース不可）。

```html
<div class="p-card__body__title">...</div>

<div class="p-card__body">
  <h3 class="p-card__title">...</h3>
</div>
```

#### 2. Modifierの適用
原則としてマルチクラスで適用する。

```scss
/* 推奨パターン */
.p-card {
  /* ... */
}
.p-card__title {
  /* ... */
}
```

---

## 5. CSS(SCSS)記述ルール

### ネスト（入れ子）の制限
* ネストは深くしすぎない（推奨：3階層まで）。
* `&`（アンパサンド）を使用してもよいが、検索性（grep）を考慮し、**クラス名のフルネーム記述を推奨・許容する**。

```scss
/* 推奨パターン */
.p-card {
  /* ... */
}
.p-card__title {
  /* ... */
}
```

### Componentの責務（重要）
* Component（c-）には、外部に影響する margin を設定しない。
* 余白は親要素である Project（p-）側でレイアウトするか、Utilityクラスで調整する。

```scss
/* Bad */
.c-button { margin-bottom: 20px; }

/* Good */
.p-form {
  .c-button { margin-bottom: 20px; }
}
```

### メディアクエリ
* モバイルファースト（max-width）で記述する。
* PC向けスタイルは、該当セレクタの直下にネストして（min-width）記述する。
```scss
.p-card {
  width: 100%;

  @include mq(pc) {
    width: 300px;
  }
}
```

---

## 6. アンチパターン（禁止事項）

1.  **IDセレクタの使用禁止**
    * 詳細度が高すぎるため、スタイル目的での `#header` 等の使用は禁止。
2.  **要素セレクタへの直接指定の制限**
    * `div`, `span`, `h2` などへの直接指定は `foundation/_base.scss` 以外では原則禁止。必ずクラスを使用する。
3.  **カスケードの乱用禁止**
    * `.l-main .p-card { ... }` のように、他のモジュールに依存した指定は避ける（詳細度設計が破綻するため）。
4.  **マジックナンバーの使用禁止**
    * 根拠のない `z-index: 9999` や `margin: 37px` などは避ける。

---

## 7. 運用フロー：ComponentかProjectか？

迷った際は以下の基準で判断する。

1.  **そのパーツを他のページや別のサイトに持っていっても使えるか？**
    * Yes → `component` (`c-`)
    * No  → `project` (`p-`)
2.  **判断に迷う場合**
    * とりあえず `project` に作成する。
    * 後で複数の場所で使いたくなった段階で `component` に格上げ（リファクタリング）する。
