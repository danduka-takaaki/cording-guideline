# 開発者向け手順書 (Developer Manual)

このドキュメントでは、Astroフレームワークを用いた本プロジェクトの開発フローについて解説します。

---

## 1. ページの作成と編集

本プロジェクトは **ファイルベースルーティング** を採用しています。`src/pages/` 配下のディレクトリ構造がそのままURLになります。

### 1.1 新しいページの作成手順
例として、日本サイトに「会社概要 (about)」ページを追加する場合：

1. `src/pages/jp/about.astro` を作成します。
2. 共通レイアウトを読み込み、コンテンツを記述します。

```astro
---
// フロントマター: コンポーネントのインポートや変数を定義
import Layout from '../../layouts/PageLayout.astro';
import SectionTitle from '../../components/SectionTitle.astro';
---

<Layout title="会社概要 | Global Site" lang="ja" theme="jp">
  <main class="l-main">
    <div class="l-container">
      <SectionTitle text="私たちについて" />
      <p>ここにコンテンツが入ります。</p>
    </div>
  </main>
</Layout>
```

### 1.2 共通パーツ（コンポーネント）の利用
ヘッダー、フッター、ボタンなどの共通パーツは `src/components/` に定義されています。これらをインポートして使用することで、デザインの統一性を保ちます。

---

## 2. スタイルの管理 (SCSS/FLOCSS)

### 2.1 構成
スタイルファイルは `src/styles/` に集約されています。設計思想は従来通り **FLOCSS** を踏襲しています。

* `foundation/`: 変数、Mixin、リセット
* `layout/`: ヘッダー、フッター等の大枠
* `object/`: Component, Project, Utility

### 2.2 国別テーマの適用メカニズム
国ごとに色やフォントを変えるため、**テーマファイル** をエントリーポイントとして使用しています。

* **JPサイト:** `src/styles/theme-jp.scss`
* **USサイト:** `src/styles/theme-us.scss`

各テーマファイル内で変数を定義した後、共通のスタイルを `@use` で読み込んでいます。

**src/styles/theme-jp.scss の例:**
```scss
// 1. JP固有の変数を定義
$color-primary: #e60012;
$font-family-base: "Hiragino Kaku Gothic ProN", sans-serif;

// 2. 共通スタイルを読み込み (変数はここで渡されるか、ファイル順序により適用)
@use "foundation/base" with (
  $color-primary: $color-primary
);
@use "layout/header";
@use "object/component/button";
```

### 2.3 スタイルの修正フロー
* **全サイト共通のデザイン変更:** `src/styles/object/` 配下のファイルを修正します。
* **特定国のみ色を変えたい:** 該当する国の `theme-xx.scss` の変数定義を変更します。
* **特定国のみ全く違うデザインにしたい:** その国専用のページ (`src/pages/jp/special.astro`) に `<style>` タグで直接記述するか、専用のSCSSファイルを作成してインポートしてください。

---

## 3. 画像・アセットの扱い

画像ファイルは `public/` ディレクトリに配置します。

* **配置:** `public/img/common/logo.svg`
* **参照:** `<img src="/img/common/logo.svg" alt="Logo" />`

Astroのビルド時に `public/` 以下のファイルはそのまま `dist/` のルートにコピーされます。

---

## 4. トラブルシューティング

### Q. SCSSの変更が反映されない
AstroのHMR（ホットモジュールリプレースメント）は強力ですが、稀にSCSSの依存関係が複雑な場合に更新が遅れることがあります。その場合は開発サーバーを再起動してください。

### Q. 以前のような `_shared` からの上書きはできないの？
できません。v2.0からは「ファイルを上書きする」のではなく、「共通コンポーネントをimportし、必要ならPropsで挙動を変える」あるいは「別のコンポーネントを使う」ことで差分を表現します。
