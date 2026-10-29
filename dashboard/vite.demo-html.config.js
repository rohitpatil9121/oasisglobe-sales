import { defineConfig, mergeConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import base from "./vite.config.js";

// One self-contained HTML file on sample data, for sending to clients:
//   VITE_DEMO=1 npx vite build --config vite.demo-html.config.js
export default mergeConfig(base, defineConfig({
  plugins: [viteSingleFile()],
  build: { outDir: "dist-demo", assetsInlineLimit: 100000000 },
}));
