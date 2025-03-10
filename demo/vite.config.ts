import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    open: true,
    hmr: true,
    port: 3000,
  },
  resolve: {
    alias: {
      "quill-footnote": path.resolve(__dirname, "../src"),
    },
  },
  optimizeDeps: {
    include: ["quill"],
  },
});
