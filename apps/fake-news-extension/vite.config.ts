import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Custom plugin to flatten HTML output
function flattenHtmlOutput() {
  return {
    name: 'flatten-html-output',
    generateBundle(options, bundle) {
      for (const file of Object.keys(bundle)) {
        if (file.endsWith('.html') && file.startsWith('src/')) {
          const asset = bundle[file];
          // Move to root
          bundle[file.replace(/^src\//, '')] = asset;
          delete bundle[file];
        }
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    flattenHtmlOutput(), 
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup.html"),
        options_page: path.resolve(__dirname, "src/options.html"),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      }
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
