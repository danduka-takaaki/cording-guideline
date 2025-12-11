# 開発者マニュアル

Astroフレームワークを用いた本プロジェクトの開発手順を解説する。

---

## 1. ページ作成

### 1.1 ファイルベースルーティング

`src/pages/` 配下のディレクトリ構造がそのままURLになる。

| ファイルパス | URL |
|-------------|-----|
| `src/pages/index.astro` | `/` |
| `src/pages/jp/index.astro` | `/jp/` |
| `src/pages/jp/about.astro` | `/jp/about/` |
| `src/pages/us/products/list.astro` | `/us/products/list/` |

### 1.2 新規ページ作成例

日本サイトに「会社概要」ページを追加する場合：

**`src/pages/jp/about.astro`**

```astro
---
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

### 1.3 Astroコンポーネント構造

```astro
---
// フロントマター: サーバーサイドで実行
import Component from '../components/Component.astro';

const title = "ページタイトル";
const items = await fetch('/api/items').then(r => r.json());
---

<!-- テンプレート: HTMLとして出力 -->
<Component title={title} />

{items.map(item => <p>{item.name}</p>)}

<style>
  /* スコープ付きCSS: このコンポーネントのみ適用 */
  p { color: blue; }
</style>
```

---

## 2. コンポーネント開発

### 2.1 コンポーネントの配置

| ディレクトリ | 用途 |
|-------------|------|
| `src/components/` | 共通UIパーツ (Button, Card, Header等) |
| `src/layouts/` | ページレイアウト |

### 2.2 Props定義

```astro
---
// Props型定義 (TypeScript)
interface Props {
  text: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const { text, variant = 'primary', disabled = false } = Astro.props;
---

<button class={`c-button c-button--${variant}`} disabled={disabled}>
  {text}
</button>
```

### 2.3 Slotによるコンテンツ挿入

```astro
---
// Card.astro
---
<div class="p-card">
  <div class="p-card__header">
    <slot name="header" />
  </div>
  <div class="p-card__body">
    <slot />  <!-- デフォルトスロット -->
  </div>
</div>
```

**使用例:**

```astro
<Card>
  <h2 slot="header">タイトル</h2>
  <p>本文コンテンツ</p>
</Card>
```

---

## 3. スタイル管理

### 3.1 テーマファイル構成

国ごとにテーマファイルをエントリーポイントとして使用。

| サイト | ファイル |
|-------|---------|
| JP | `src/styles/theme-jp.scss` |
| US | `src/styles/theme-us.scss` |

### 3.2 テーマファイルの構造

**`src/styles/theme-jp.scss`**

```scss
// 1. JP固有の変数定義
$color-primary: #e60012;
$font-family-base: "Hiragino Kaku Gothic ProN", sans-serif;

// 2. 共通スタイル読み込み
@use "foundation/base" with (
  $color-primary: $color-primary
);
@use "layout/header";
@use "object/component/button";
```

### 3.3 スタイル修正フロー

| 変更内容 | 編集箇所 |
|---------|---------|
| 全サイト共通 | `src/styles/object/` 配下 |
| 特定国の色/フォント | 該当国の `theme-*.scss` 変数 |
| 特定国の固有デザイン | ページ内 `<style>` または専用SCSS |

### 3.4 コンポーネント内スタイル

Astroの `<style>` はデフォルトでスコープ付き。

```astro
<div class="custom">スコープ付き</div>

<style>
  /* このコンポーネント内の .custom のみに適用 */
  .custom { color: red; }
</style>

<style is:global>
  /* グローバルに適用 (慎重に使用) */
  body { margin: 0; }
</style>
```

---

## 4. 画像・アセット

### 4.1 配置と参照

画像は `public/` ディレクトリに配置。

| 配置 | 参照 |
|------|------|
| `public/img/common/logo.svg` | `<img src="/img/common/logo.svg">` |
| `public/img/jp/hero.webp` | `<img src="/img/jp/hero.webp">` |

### 4.2 最適化画像の使用

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.png';
---

<!-- 自動最適化 -->
<Image src={heroImage} alt="ヒーロー画像" width={800} height={400} />
```

---

## 5. データ取得

### 5.1 ビルド時取得

```astro
---
// ビルド時に実行 (SSG)
const response = await fetch('https://api.example.com/data');
const data = await response.json();
---

<ul>
  {data.map(item => <li>{item.name}</li>)}
</ul>
```

### 5.2 Content Collections

`src/content/` 配下のMarkdown/MDXを型安全に管理。

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---

{posts.map(post => <a href={`/blog/${post.slug}`}>{post.data.title}</a>)}
```

---

## 6. トラブルシューティング

### SCSSの変更が反映されない

依存関係が複雑な場合、HMRが遅れることがある。

```bash
# 開発サーバーを再起動
Ctrl+C → npm run dev
```

### TypeScriptエラー

Props型定義が不足している場合に発生。

```astro
---
// 型定義を追加
interface Props {
  title: string;
}
const { title } = Astro.props;
---
```

### ビルドエラー: 動的インポート

SSGでは動的ルートに `getStaticPaths` が必要。

```astro
---
export async function getStaticPaths() {
  return [
    { params: { id: '1' } },
    { params: { id: '2' } },
  ];
}

const { id } = Astro.params;
---
```

---

## 7. v1.xからの移行ガイド

### 非推奨パターン

| 旧 (v1.x) | 新 (v2.0) |
|-----------|-----------|
| `_shared` からのファイル上書き | コンポーネントのimport + Props |
| HTMLファイル直接編集 | `.astro` コンポーネント |
| cpxによるビルド | `npm run build` |

### 移行手順

1. 既存HTMLを `.astro` に変換
2. 共通部分をコンポーネント化
3. 国別差分はPropsまたは別コンポーネントで対応
4. テーマファイルで変数切り替え

