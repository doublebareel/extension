import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    // Inline so DevTools can map the injected content script back to the
    // original .ts/.tsx without having to fetch a separate .map file.
    sourcemap: "inline",
    // A content script is injected as a single IIFE, so it can't be
    // code-split — React/ReactDOM must be bundled in. The reported size is
    // also inflated by the inline sourcemap above (the real minified code is
    // ~220 kB), so the default 500 kB warning is a false alarm here.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: resolve(__dirname, "src/content/main.tsx"),
      output: {
        format: "iife",
        entryFileNames: "content.js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});