import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import autoprefixer from "autoprefixer";
import handlebars from "vite-plugin-handlebars";
import { viteSingleFile } from "vite-plugin-singlefile";
import sassGlobImports from "vite-plugin-sass-glob-import";

// サイトのルートを決定
const root = resolve(__dirname, "src");

export default defineConfig({
  root,
  base: "./",
  build: {
    minify: false,
    outDir: resolve(__dirname, "dist-client"),
    // 画像はbase64インライン化（file://でも表示できるように）
    assetsInlineLimit: 100 * 1024 * 1024, // 実質すべてインライン化
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
      },
    },
  },
  plugins: [
    sassGlobImports(),
    viteSingleFile(),
    handlebars({
      partialDirectory: [
        resolve(__dirname, "src/components/base"),
        resolve(__dirname, "src/components/common"),
        resolve(__dirname, "src/components/layout"),
        resolve(__dirname, "src/components/project"),
      ],
      helpers: {
        br: contents => {
          return contents ? contents.replace(/\r?\n/g, "<br>") : "";
        },
      },
      context: pagePath => {
        const metaData = JSON.parse(fs.readFileSync(resolve(__dirname, "src/data/meta.json"), "utf8"));
        const pageMeta = metaData[pagePath] || metaData["default"];
        return {
          page: pageMeta,
          brTxt: "これはテスト文章です。\nこれはテスト文章です。",
        };
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/assets/styles"),
      "@js": resolve(__dirname, "src/assets/js"),
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
