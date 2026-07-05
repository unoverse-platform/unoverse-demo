import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// This host embeds NO Unoverse SDK (the app streams in via the server's ui:// resource,
// SDK included). The react→preact/compat aliases exist only for react-oidc-context
// (authored for React); runtime deps are just preact + oidc + the standard MCP client.
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
    dedupe: ["preact"],
  },
  // Build target: a self-mounting IIFE (no hashes), embeddable via <script src>.
  // Emits unoverse-demo.js + unoverse-demo.css (the login/gate chrome uses Tailwind;
  // the SDK's own app styling is self-contained in its Shadow DOM).
  build: {
    lib: {
      entry: "src/main.jsx",
      name: "UnoverseDemo",
      formats: ["iife"],
      fileName: () => "unoverse-demo.js",
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: "unoverse-demo.[ext]",
      },
    },
  },
  server: {
    port: 3007,
    host: "0.0.0.0",
  },
});
