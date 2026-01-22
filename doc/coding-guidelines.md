# コーディングガイドライン

このドキュメントは、本プロジェクト（Vite静的サイト開発環境）におけるコーディング規約を定めたものです。

## プロジェクト環境

- **ビルドツール**: Vite 5.0.13
- **パッケージマネージャー**: **yarn のみ使用**（npm禁止）
- **CSS設計**: FLOCSS
- **テンプレートエンジン**: Handlebars
- **JavaScript**: ESモジュール (ES6+)

## HTML

### 基本ルール

- **セマンティックHTML**を使用する（`<header>`, `<nav>`, `<main>`, `<section>`, `<article>` など）
- **インデント**: 2スペース
- サイト内リソースへのパスは**ルート相対パス**（`/`で始まる）を使用
  - NG: `./images/sample.png`
  - OK: `/images/sample.png`
- 文字参照（`&copy;`など）は使用せず、UTF-8文字を直接記述
  - NG: `&copy;`
  - OK: `©`

### BEM/FLOCSS命名規則

クラス名は以下の接頭辞を使用し、BEM記法に従う：

- **`l-`**: Layout（レイアウト）
- **`c-`**: Component（再利用可能コンポーネント）
- **`p-`**: Project（特定ページ専用）
- **`u-`**: Utility（単一目的クラス）

```html
<!-- 良い例 -->
<header class="p-header l-header">
  <div class="l-inner">
    <nav class="p-header__nav">
      <a href="/" class="p-header__nav-item">ホーム</a>
    </nav>
  </div>
</header>

<button class="c-button c-button--primary">送信</button>

<!-- 悪い例: 省略形や接頭辞なし -->
<div class="btn">クリック</div>
<!-- NG: 省略、接頭辞なし -->
<div class="button-primary">送信</div>
<!-- NG: BEM記法違反 -->
```

### 画像タグ

```html
<!-- 必須属性: src, alt, width, height -->
<!-- WebPは全ブラウザ対応のため、直接使用可能 -->
<img src="/assets/images/sample.webp" alt="サンプル画像" width="800" height="600" loading="lazy" />

<!-- MVセクション: loading="lazy"不要、fetchpriority="high"推奨 -->
<img src="/assets/images/image_mv_01.webp" width="977" height="1800" alt="" fetchpriority="high" />

<!-- AVIF対応（AVIF非対応ブラウザは元画像にフォールバック） -->
<picture>
  <source srcset="/assets/images/sample.avif" type="image/avif" />
  <img src="/assets/images/sample.png" alt="サンプル" width="800" height="600" loading="lazy" />
</picture>
```

**画像属性のルール**:

- `width`と`height`: 必ず指定（CLS防止）
- `alt`: 装飾画像は空文字`""`、コンテンツ画像は適切な説明
- `loading="lazy"`: MV以外の画像に指定
- `fetchpriority="high"`: LCP画像（最初のMV画像など）に指定

### Handlebarsコンポーネント

共通パーツは`src/components/`に配置し、Handlebarsで読み込む：

```html
<!-- src/index.html -->
{{> p-header}}

<main class="l-main">
  <h1>{{page.title}}</h1>
</main>

{{> p-footer}}
```

コンポーネントファイル名は対応するクラス名と一致させる：

- `src/components/p-header.html` → `.p-header`
- `src/components/c-button.html` → `.c-button`

### アクセシビリティ

インタラクティブな要素には適切なアクセシビリティ属性を追加：

```html
<!-- ボタン -->
<button type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="drawer-menu">メニュー</button>

<!-- アコーディオン -->
<button type="button" aria-expanded="false" aria-controls="accordion-content" aria-label="事業内容を展開">事業内容</button>
<ul id="accordion-content" aria-hidden="true">
  <!-- コンテンツ -->
</ul>
```

**アクセシビリティ属性**:

- `aria-label`: ボタンの目的を説明
- `aria-expanded`: 開閉状態（`true`/`false`）
- `aria-controls`: 制御する要素のID
- `aria-hidden`: 要素の表示状態（`true`/`false`）

## CSS/SCSS

### FLOCSS階層構造

```scss
// src/assets/styles/style.scss
@use "foundation"; // リセット、ベーススタイル
@use "global"; // 変数、関数、mixins

// layoutディレクトリ内のファイルを直接インポート
@use "layouts/**";

// components と projects
@use "components/**";
@use "projects/**";

// utilityクラス（全てのファイル）をワイルドカードで読み込み
@use "utilities/**";
```

各ファイルでは`@use "../global" as *;`でグローバル変数とmixinsを読み込む：

```scss
@use "../global" as *;

.p-header {
  color: var(--color-text);

  @include mq("md") {
    padding: calc(20 * var(--to-rem));
  }
}
```

### 基本ルール

- **ネスト制限**:
  - ✅ 許可: 擬似要素・擬似クラス（`&:hover`, `&::before`, `&::after`, `&:nth-of-type()`など）
  - ✅ 許可: 擬似クラスセレクタ（`&.is-open`, `&:not([open])`など）
  - ✅ 許可: `@include mq()` メディアクエリ
  - ❌ 禁止: 子要素のセレクタ（`.parent span`など）のネスト
  - ❌ 禁止: `&__item` のようなBEM要素のネスト（`.parent__item`は別定義）
  - ❌ 禁止: セレクタのネスト（`.parent .child`など）
- **CSS Custom Properties**を使用
- **論理プロパティ**を優先（`margin-block-start`, `padding-inline`など）
- 単位は`calc(値 * var(--to-rem))`でrem変換
- インラインスタイル禁止

```scss
// ✅ 良い例
.c-card {
  padding: calc(20 * var(--to-rem)) calc(30 * var(--to-rem));
  margin-block-start: calc(40 * var(--to-rem));
  color: var(--color-text);
  background-color: var(--color-bg);

  // 擬似要素・擬似クラスはネスト可
  &:hover {
    background-color: var(--color-bg-hover);
  }

  &::before {
    content: "";
    display: block;
  }

  &:nth-of-type(1) {
    margin-block-start: 0;
  }

  // メディアクエリもネスト可
  @include mq("md") {
    padding: calc(30 * var(--to-rem)) calc(50 * var(--to-rem));
  }
}

// ✅ 子要素のセレクタは別定義（ネストしない）
.p-header__hamburger span {
  display: block;

  // 擬似要素・擬似クラスはネスト可
  &:nth-of-type(1) {
    top: -8px;
  }
}

// ✅ 擬似クラスセレクタと子要素の組み合わせも別定義
.p-header__hamburger.is-open span {
  &:nth-of-type(1) {
    top: 0;
    rotate: 45deg;
  }
}

// ❌ 悪い例
.card {
  // NG: 接頭辞なし
  padding: 20px; // NG: px直接指定
  margin-bottom: 40px; // NG: 論理プロパティ未使用

  .title {
    // NG: セレクタのネスト
    font-size: 18px;
  }

  &__item {
    // NG: BEM要素のネスト（フラットに書く）
    display: block;
  }
}

// ✅ BEM要素は別々に定義
.c-card {
  padding: calc(20 * var(--to-rem));
}

.c-card__item {
  display: block;
}
```

### BEMモディファイア

```scss
// Block
.c-button {
  padding: calc(14 * var(--to-rem)) calc(60 * var(--to-rem));
  background-color: var(--color-primary);
}

// Modifier
.c-button.c-button--large {
  padding: calc(20 * var(--to-rem)) calc(80 * var(--to-rem));
}

.c-button.c-button--outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
}

```

### レスポンシブ対応

ブレークポイントは`@include mq()`で指定（SPファースト）：

```scss
@use "../global" as *;

.c-section {
  padding-block: calc(40 * var(--to-rem));

  @include mq("md") {
    padding-block: calc(80 * var(--to-rem));
  }
}
```

**利用可能なブレークポイント**:

- `sm`: 600px以上
- `md`: 768px以上（デフォルト）
- `lg`: 1024px以上
- `xl`: 1440px以上

```scss
.p-header {
  height: var(--header-height);

  @include mq("md") {
    --header-height: 80px;
  }
}
```

### レイアウト

- **等間隔配置**: `gap`を使用
- **比率管理**: `aspect-ratio`を使用

```scss
.c-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: calc(30 * var(--to-rem));
}

.c-thumbnail {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

## JavaScript

### 基本ルール

- **ESモジュール**を使用（`import`/`export`）
- 変数宣言は`const`または`let`（**`var`禁止**）
- インデント: 2スペース
- 定数はファイル上部で定義

```javascript
// src/assets/js/script.js
import "./_drawer.js";
import "./_mv-slider.js";
import "./_viewport.js";
import "./_form-validation.js";
```

**モジュール構造**:

```javascript
// === 定数定義 ===
const BREAKPOINTS = {
  TABLET: 768,
};

const ANIMATION = {
  DURATION: 500,
};

// === ユーティリティ関数 ===
function throttle(callback, delay = 100) {
  // ...
}

// === 初期化 ===
document.addEventListener("DOMContentLoaded", function () {
  // 初期化処理
});
```

### 画像インポート

Vite環境では画像をインポートして使用：

```javascript
import heroImage from "/assets/images/hero.png";

const img = document.createElement("img");
img.src = heroImage;
img.alt = "ヒーロー画像";
```

### イベントリスナー

適切なクリーンアップを行う：

```javascript
const handleClick = () => {
  console.log("クリックされました");
};

button.addEventListener("click", handleClick);

// 必要に応じてクリーンアップ
// button.removeEventListener('click', handleClick);
```

### アクセシビリティ属性の動的更新

インタラクティブな要素の状態変更時に、アクセシビリティ属性も更新：

```javascript
// ドロワーを開く時
hamburger.setAttribute("aria-expanded", "true");
hamburger.setAttribute("aria-label", "メニューを閉じる");
drawer.setAttribute("aria-hidden", "false");

// ドロワーを閉じる時
hamburger.setAttribute("aria-expanded", "false");
hamburger.setAttribute("aria-label", "メニューを開く");
drawer.setAttribute("aria-hidden", "true");
```

## 画像管理

### 画像配置ルール

#### 1. `/src/public/images/` - 固定URL画像

- **用途**: OGP画像、favicon など
- **特徴**: URLが変わらない（ハッシュなし）

```
src/public/images/
  ├── ogp.png
  └── favicon.ico
```

#### 2. `/src/assets/images/` - コンテンツ画像

- **用途**: サイト内コンテンツ画像
- **特徴**: ビルド時にハッシュ付与（キャッシュバスティング）

```
src/assets/images/
  ├── bg_sample.png
  ├── image_mv_01.webp
  └── icon_arrow.svg
```

### ファイル命名規則

**`カテゴリ[_名前][_連番][_状態].拡張子`**

- **使用可能文字**: 英小文字・数字・ハイフン・アンダースコア
- **ページ別フォルダ非推奨**: すべて`images/`直下

```
✅ 良い例
bg_sample.png
image_mv_01.webp
icon_arrow.svg
thumbnail_product_01.jpg

❌ 悪い例
BgSample.png        // 大文字使用
image-mv-01.webp    // ハイフン使用（アンダースコア推奨）
top/hero.png        // フォルダ分け
img01.jpg           // カテゴリなし
```

[参考記事](https://webnaut.jp/technology/20210910-3953/)

## パフォーマンス最適化

### Google Fontsの最適化読み込み

FOUTを防ぐため、以下の方法で読み込み：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="preload"
  as="style"
  fetchpriority="high"
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Gotu&display=swap"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Gotu&display=swap"
  media="print"
  onload='this.media="all"'
/>
```

## 開発コマンド

### 必須: yarnを使用

```bash
# 依存関係インストール
yarn

# 開発サーバー起動
yarn dev  # → http://localhost:5173

# ビルド（自動でformat実行）
yarn build

# プレビュー
yarn preview

# フォーマット（lint-fix + prettier-fix）
yarn format
```

### フォーマット・Lint

コミット前に必ず実行：

```bash
# まとめて実行
yarn format

# 個別実行
yarn _lint        # チェックのみ
yarn _lint-fix    # 自動修正
yarn _prettier    # チェックのみ
yarn _prettier-fix # 自動修正
```

## 納品時の流れ

納品時やサーバーアップ時は、必ず以下の手順に従ってください。

### 1. ビルド前の確認

```bash
# フォーマットを実行（自動でlint + prettierが実行される）
yarn format

# エラーがないことを確認
yarn _lint
yarn _prettier
```

### 2. ビルド実行

```bash
# ビルドを実行（自動でformatも実行される）
yarn build
```

ビルドが成功すると、`dist`フォルダに以下の構造で成果物が出力されます：

```
dist/
├── assets/
│   ├── images/     # 画像ファイル（ハッシュ付与）
│   ├── js/         # JavaScriptファイル
│   └── style/      # CSSファイル
├── contact/        # ページファイル
├── index.html      # メインページ
└── ...
```

### 3. ビルド成果物の確認

```bash
# distフォルダの内容を確認
ls -la dist/

# ローカルでプレビュー（任意）
yarn preview
```

### 4. サーバーへのアップロード

**重要**: 以下のファイルのみをサーバーにアップロードしてください。

- ✅ **`dist`フォルダ内のすべてのファイル**
- ❌ **`src`フォルダはアップロード不要**（開発用ファイルのため）
- ❌ **`node_modules`、`.git`などはアップロード不要**

### 5. 納品チェックリスト

納品前に以下を確認してください：

- [ ] `yarn build`がエラーなく完了している
- [ ] `dist`フォルダに必要なファイルがすべて出力されている
- [ ] ローカルプレビュー（`yarn preview`）で表示が正常である
- [ ] 画像ファイルが正しく読み込まれている
- [ ] CSS/JavaScriptが正しく読み込まれている
- [ ] すべてのページが正常に表示される

### 注意事項

- ⚠️ **開発用ファイル（`src`フォルダ）は絶対にアップロードしないでください**
- ⚠️ **`dist`フォルダ内のファイルのみ**をアップロードしてください
- ✅ ビルド後は`yarn preview`でローカル確認が可能です
- ✅ ビルド時に自動でフォーマットが実行されるため、納品前の手動フォーマットは不要です

## その他のルール

### コミットメッセージ

```
<type>: <summary>

例:
add: 新規コンポーネント追加
fix: ヘッダーのレイアウト崩れ修正
update: スタイル調整
refactor: コード整理
```

### 禁止事項

- ❌ npm の使用（必ずyarnを使う）
- ❌ インラインスタイル（`style="..."`）
- ❌ SCSSのセレクタネスト（`.parent .child`）
- ❌ SCSSのBEM要素ネスト（`&__element`形式）
- ❌ `var`での変数宣言
- ❌ クラス名の省略（`.ttl` → `.title`）

### 推奨事項

- ✅ セマンティックHTML
- ✅ CSS Custom Properties
- ✅ 論理プロパティ（`margin-block-start`, `padding-inline`など）
- ✅ `loading="lazy"`（MV以外の画像）
- ✅ `fetchpriority="high"`（LCP画像）
- ✅ AVIF対応（`<picture>`要素で元画像にフォールバック）
- ✅ WebPは全ブラウザ対応のため直接使用可能
- ✅ ESモジュール
- ✅ アクセシビリティ属性（`aria-*`）
- ✅ CSS/フォントの非同期読み込み
- ✅ コミット前の`yarn format`実行

---

> **Note**: 本ガイドラインは静的サイト開発のベストプラクティスをまとめたものです。
> 不明点があれば、チームで議論して随時更新してください。
