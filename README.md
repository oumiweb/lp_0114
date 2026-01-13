# Vite 静的サイト開発環境

このプロジェクトは、Vite を使用したモダンな静的サイト開発環境です。FLOCSS 準拠の CSS 設計と ES モジュールベースの JavaScript 開発をサポートしています。

## 📚 各種ガイドライン

- [コーディングガイドライン](./doc/coding-guidelines.md)
- [PR・issue ガイドライン](./doc/pr-issue-guidelines.md)

## 🚀 必要環境

このプロジェクトを動作させるには、以下の環境が**必須**です：

- **Node.js**: 20.19+ または 22.12+（必須）
- **yarn**: パッケージマネージャー（必須、npm は使用不可）

**⚠️ 注意**: Vite は Node.js 20.19+, 22.12+ のバージョンが必要です。一部のテンプレートではそれ以上のバージョンの Node.js を必要としますので、パッケージマネージャーが警告を出した場合はアップグレードしてください。

### インストール方法

#### Node.js のインストール

1. [Node.js 公式サイト](https://nodejs.org/)からインストーラーをダウンロード
2. **推奨バージョン（20.19+ または 22.12+）**をインストール
3. インストール確認：
   ```bash
   node --version
   # v20.19.0 以上 または v22.12.0 以上であることを確認
   ```

#### yarn のインストール

Node.js をインストール後、以下のコマンドで yarn をインストール：

```bash
npm install -g yarn
```

インストール確認：

```bash
yarn --version
# バージョンが表示されることを確認
```

**⚠️ 注意**: このプロジェクトでは `npm` は使用できません。必ず `yarn` を使用してください。

## 🛠️ 開発環境立ち上げ

```bash
# 依存関係インストール
yarn

# 開発サーバー起動
yarn dev
# → http://localhost:5173 でアクセス
```

## 📂 プロジェクト構成

```
vite-static-template/
├── src/                    # 開発用ソースファイル
│   ├── assets/
│   │   ├── images/         # コンテンツ画像（ビルド時ハッシュ付与）
│   │   ├── styles/         # SCSS（FLOCSS 構造）
│   │   └── js/             # JavaScript（ES モジュール）
│   ├── components/         # Handlebars 共通パーツ
│   ├── public/
│   │   └── images/         # 固定 URL 画像（OGP/favicon）
│   └── index.html          # メインページ
├── dist/                   # ビルド出力先
└── doc/                    # ドキュメント
```

## 💻 開発フロー

### HTML・コンポーネント開発

静的資材は `src` フォルダ内で作成します。

```html
<!-- CSS・JS の読み込み -->
<link rel="stylesheet" href="/assets/styles/style.scss" />
<script src="/assets/js/script.js" type="module"></script>
```

### Handlebars によるコンポーネント管理

共通パーツは `src/components` フォルダで作成し、再利用できます。

```html
<!-- src/index.html -->
{{> p-header}}

<main class="l-main">
  <h1>{{page.title}}</h1>
</main>

{{> p-footer}}
```

**参考**: [Handlebars 使い方](https://zenn.dev/tamon_kondo/articles/e6aceb1ea15f4b)

## 🖼️ 画像の格納先と読み込み方

画像の格納先は**用途によって 2 つのディレクトリを使い分けます**。

### 1. `/src/public/images/` - 固定 URL 画像

- **用途**: OGP 画像、favicon など
- **特徴**: URL が変わらない（ハッシュなし）

```html
<link rel="icon" href="/images/favicon.ico" /> <meta property="og:image" content="/images/ogp.png" />
```

### 2. `/src/assets/images/` - コンテンツ画像

- **用途**: サイト内コンテンツ画像
- **特徴**: ビルド時にハッシュ付与（キャッシュバスティング）

#### HTML での読み込み

```html
<img src="/assets/images/sample.png" alt="サンプル" width="800" height="600" loading="lazy" />
```

#### CSS での読み込み

```scss
.c-hero {
  background-image: url("/assets/images/bg_hero.jpg");
}
```

#### JavaScript での読み込み

```javascript
import heroImage from "/assets/images/hero.png";
const img = document.createElement("img");
img.src = heroImage;
```

### 画像ファイル命名規則

**`カテゴリ[_名前][_連番][_状態].拡張子`**

```
✅ 良い例
bg_sample.png
image_mv_01.webp
icon_arrow.svg

❌ 悪い例
BgSample.png        // 大文字
top/hero.png        // フォルダ分け
img01.jpg           // カテゴリなし
```

詳細: [画像ファイル命名規則参考記事](https://webnaut.jp/technology/20210910-3953/)

## 🎨 CSS 設計（FLOCSS）

このプロジェクトは FLOCSS 設計を採用しています。

```scss
// src/assets/styles/style.scss
@use "foundation"; // リセット、ベーススタイル
@use "global"; // 変数、関数、mixins
@use "layout/**"; // l-プレフィックス
@use "components/**"; // c-プレフィックス
@use "projects/**"; // p-プレフィックス
@use "utilities/**"; // u-プレフィックス
```

### BEM 命名規則

- **`l-`**: Layout（レイアウト）
- **`c-`**: Component（再利用可能コンポーネント）
- **`p-`**: Project（特定ページ専用）
- **`u-`**: Utility（単一目的クラス）

```html
<header class="p-header l-header">
  <nav class="p-header__nav">
    <a href="/" class="p-header__nav-item">ホーム</a>
  </nav>
</header>
```

## 📝 開発コマンド

```bash
# 開発サーバー起動
yarn dev

# ビルド（自動でformat実行）
yarn build

# プレビュー
yarn preview

# フォーマット（lint-fix + prettier-fix）
yarn format
```

### 個別実行

```bash
# Lint チェックのみ
yarn _lint

# Lint 自動修正
yarn _lint-fix

# Prettier チェックのみ
yarn _prettier

# Prettier 自動修正
yarn _prettier-fix
```

## 🚀 納品・サーバーアップ時の手順

納品時やサーバーアップ時は、以下の手順でビルドを実行し、**`dist`フォルダ内のファイル**をアップロードしてください。

### 手順

1. **ビルドを実行**

   ```bash
   yarn build
   ```

   - 自動でフォーマット（lint + prettier）が実行されます
   - `dist`フォルダにビルド成果物が出力されます

2. **ビルド成果物の確認**

   ```bash
   # distフォルダの内容を確認
   ls -la dist/
   ```

3. **サーバーにアップロード**
   - **`dist`フォルダ内のすべてのファイル**をサーバーにアップロードしてください
   - `src`フォルダやその他の開発用ファイルは**アップロード不要**です

### 注意事項

- ⚠️ **`src`フォルダはアップロードしないでください**（開発用ファイルのため）
- ✅ **`dist`フォルダ内のファイルのみ**をアップロードしてください
- ✅ ビルド後は`yarn preview`でローカル確認が可能です

## 🔧 トラブルシューティング

### SCSS 変更が反映されない

1. `bin/watch-scss-globs.js` が監視中か確認
2. Vite サーバーを再起動（`Ctrl+C` → `yarn dev`）

### JavaScript モジュールエラー

1. `script.js` の自動生成インポートを確認
2. ブラウザのコンソールでエラーを確認

## 🎯 コミット規約

```
<type>: <summary>

例:
add: 新規コンポーネント追加
fix: ヘッダーのレイアウト崩れ修正
update: スタイル調整
refactor: コード整理
```

## 📄 ライセンス

### 使用許諾

✅ **許可される使用**:

- 個人・法人での実案件使用（案件数無制限）
- クライアント案件での使用
- テンプレートの改変・カスタマイズ
- 成果物の商用利用

❌ **禁止される使用**:

- このテンプレート自体の再販売
- テンプレートの再配布（無料・有料問わず）
- スターターキットとしての公開

詳細は [LICENSE](./LICENSE) ファイルをご確認ください。

## 📖 詳細ドキュメント

より詳細な情報は各ドキュメントを参照してください：

- **コーディング規則**: [doc/coding-guidelines.md](./doc/coding-guidelines.md)
- **PR・issue**: [doc/pr-issue-guidelines.md](./doc/pr-issue-guidelines.md)

---

**それでは、良きコーディングライフを！！**
#   l p  
 