# 開発マニュアル: 新規ページ作成・構築ガイド

本ドキュメントは、Astro環境下における具体的なページ作成手順をまとめたものです。
要件に応じて適切なパターンを選択してください。

---

## パターン1: キャンペーンLPの作成 (HTML/CSS/JS完結型)

既存のサイトデザイン（ヘッダー・フッター等）を使用せず、独自のデザインとスクリプトで構成されるランディングページ(LP)を作成する場合の手順です。

### ケース想定
- **URL:** `/jp/campaign/summer-2025/`
- **要件:** サイト共通のCSSやJSの影響を極力受けず、このページ専用のHTML/CSS/JSで構築したい。

### 手順

#### 1. ページファイルの作成
`src/pages/jp/campaign/summer-2025.astro` を作成します。
共通レイアウト（`PageLayout.astro`）は使用せず、このファイル内で `<html>` から記述することで、完全に独立したページを作ることができます。

```astro
---
// src/pages/jp/campaign/summer-2025.astro
// 必要であれば最小限の骨格だけ利用することも可能ですが、ここでは完全独自実装の例とします
import '../../../styles/foundation/_reset.scss'; // プロジェクトのリセットCSSのみ読み込む例
---

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>サマーキャンペーン2025</title>
  <meta name="description" content="キャンペーンLPの説明文">
</head>
<body>
  <div class="lp-wrapper">
    <header class="lp-header">
      <h1>Campaign Logo</h1>
    </header>

    <main>
      <section class="hero">
        <h2 class="js-animate-title">夏の特大セール</h2>
        <button id="cta-button">詳しく見る</button>
      </section>
    </main>

    <footer class="lp-footer">
      <small>&copy; 2025 Campaign</small>
    </footer>
  </div>

  <style lang="scss">
    // このページ専用のスタイル
    // Astroの<style>はデフォルトでスコープ化されるため、他のページに影響しません
    .lp-wrapper {
      background-color: #f0f0f0;
      color: #333;
      font-family: sans-serif;
    }
    
    .hero {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      h2 {
        font-size: 3rem;
        color: #ff6600;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s, transform 0.5s;

        &.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  </style>

  <script>
    // Astroは自動的にこのスクリプトをバンドル・最適化します
    const btn = document.getElementById('cta-button');
    btn?.addEventListener('click', () => {
      alert('キャンペーンにエントリーしました');
    });

    // アニメーション制御など
    const title = document.querySelector('.js-animate-title');
    if (title) {
      // 簡易的な表示アニメーション
      setTimeout(() => {
        title.classList.add('is-visible');
      }, 500);
    }
  </script>
</body>
</html>
```

### ポイント
* **スタイル:** `<style>` タグに記述したCSSは自動的にスコープ化（このページのみに適用）されます。グローバル汚染を気にする必要はありません。
* **スクリプト:** `<script>` タグもAstroによって処理されます。外部ライブラリ（jQueryやGSAPなど）を使いたい場合は `npm install` して `import` するか、CDNを `<head>` に記述します。

---

## パターン2: 小規模メディアサイトの構築 (ブログ/ニュース)

お知らせやブログなど、同じ構造のページが複数生成されるコンテンツの構築手順です。
Astroの **Content Collections** 機能を利用して管理します。

### ケース想定
- **URL一覧:** `/jp/news/` (一覧), `/jp/news/article-01/` (詳細)
- **データ:** Markdownファイルで管理

### 手順

#### 1. コンテンツディレクトリの準備
`src/content/news/` ディレクトリを作成し、記事ファイル（Markdown）を配置します。

**例: `src/content/news/2025-01-01-release.md`**
```markdown
---
title: "新機能リリースのお知らせ"
pubDate: 2025-01-01
description: "待望の新機能がついにリリースされました。"
image: "/img/news/release.jpg"
---

ここに本文が入ります。Markdownで記述可能です。

## 見出し
- リスト1
- リスト2
```

#### 2. 設定ファイルでスキーマ定義
`src/content/config.ts` を作成（または編集）し、データの型を定義します。

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'news': newsCollection,
};
```

#### 3. 動的詳細ページの作成
`src/pages/jp/news/[...slug].astro` を作成します。
`[...slug]` というファイル名は、動的なパスを生成するための記法です。

```astro
---
// src/pages/jp/news/[...slug].astro
import { getCollection } from 'astro:content';
import PageLayout from '../../../../layouts/PageLayout.astro';

// 1. ビルド時に全ての記事パスを生成する (SSGモードで必須)
export async function getStaticPaths() {
  const blogEntries = await getCollection('news');
  return blogEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

// 2. 記事データを取得
const { entry } = Astro.props;
const { Content } = await entry.render();
---

<PageLayout title={entry.data.title}>
  <article class="p-article">
    <header class="p-article__header">
      <h1>{entry.data.title}</h1>
      <time datetime={entry.data.pubDate.toISOString()}>
        {entry.data.pubDate.toLocaleDateString('ja-JP')}
      </time>
    </header>
    <div class="p-article__body">
      <Content />
    </div>
  </article>
</PageLayout>
```

#### 4. 一覧ページの作成
`src/pages/jp/news/index.astro` を作成します。

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../../../layouts/PageLayout.astro';

// 日付順にソートして取得
const allPosts = (await getCollection('news')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

<PageLayout title="ニュース一覧">
  <main class="l-main">
    <div class="l-container">
      <h2>News</h2>
      <ul class="p-news-list">
        {allPosts.map((post) => (
          <li>
            <a href={`/jp/news/${post.slug}/`}>
              <span class="date">{post.data.pubDate.toLocaleDateString('ja-JP')}</span>
              <span class="title">{post.data.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </main>
</PageLayout>
```

---

## パターン3: 標準的な静的ページの作成

「会社概要」や「お問い合わせ」など、サイトの共通デザインを踏襲したページを作成する基本パターンです。

### ケース想定
- **URL:** `/jp/about/`
- **要件:** ヘッダー・フッター等の共通パーツを使用する。

### 手順

#### 1. ページファイルの作成
`src/pages/jp/about.astro` を作成します。

#### 2. レイアウトとコンポーネントの読み込み
`src/layouts/PageLayout.astro` と、必要なコンポーネント（ボタン、見出し等）をインポートします。

```astro
---
// src/pages/jp/about.astro
import PageLayout from '../../layouts/PageLayout.astro';
import SectionTitle from '../../components/SectionTitle.astro';
import Button from '../../components/Button.astro';
---

<PageLayout 
  title="会社概要 | Global Site" 
  description="私たちの会社についてご紹介します。"
  lang="ja"
  theme="jp"
>
  <main class="l-main">
    <div class="l-main__inner">
      
      <SectionTitle text="Mission" />
      
      <p>私たちは世界をつなぐ架け橋となります。</p>

      <div class="u-mt-lg">
        <h3>会社データ</h3>
        <table class="c-table">
          <tbody>
            <tr>
              <th>社名</th>
              <td>Global Inc.</td>
            </tr>
            <tr>
              <th>設立</th>
              <td>2025年</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="u-text-center u-mt-xl">
        <Button text="お問い合わせはこちら" href="/jp/contact" variant="primary" />
      </div>

    </div>
  </main>
</PageLayout>
```

### 注意点
* **レイアウト:** `PageLayout` で囲むことで、自動的に `<head>` やヘッダー・フッターが適用されます。`theme="jp"` を指定することで、日本用のCSS変数がロードされます。
* **画像:** ページ固有の画像は `public/img/jp/about/` などに配置し、HTML上では `<img src="/img/jp/about/photo.jpg" alt="">` で参照します。

---

## 4. 共通: コンポーネントの新規作成

複数のページで使い回すパーツ（例：新しいデザインのカード、バナー）を作成する場合の手順です。

### 手順
1. `src/components/` 配下に `.astro` ファイルを作成します（例: `NewCard.astro`）。
2. HTMLと、必要な場合はScoped CSSを記述します。
3. `Props` インターフェースを定義すると、利用側で型チェックが効くため推奨されます。

**`src/components/NewCard.astro`**
```astro
---
// TypeScriptによるPropsの型定義
interface Props {
  title: string;
  imageSrc: string;
  link?: string;
}

const { title, imageSrc, link } = Astro.props;
---

<div class="c-new-card">
  <img src={imageSrc} alt="" class="c-new-card__img" />
  <h3 class="c-new-card__title">{title}</h3>
  {link && <a href={link} class="c-new-card__link">More</a>}
</div>

<style lang="scss">
  // コンポーネント単位のスタイル
  .c-new-card {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 8px;
    
    &__title {
      font-weight: bold;
      // CSS変数またはグローバルSCSS変数の利用が可能
      color: var(--color-primary); 
    }

    &__img {
        width: 100%;
        height: auto;
    }
  }
</style>
```
