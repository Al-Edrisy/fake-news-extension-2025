// vite.config.ts
import { defineConfig } from "file:///Users/aledrisy/Desktop/news_cheeker/apps/fake-news-extension/node_modules/vite/dist/node/index.js";
import react from "file:///Users/aledrisy/Desktop/news_cheeker/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/Users/aledrisy/Desktop/news_cheeker/apps/fake-news-extension";
function flattenHtmlOutput() {
  return {
    name: "flatten-html-output",
    generateBundle(options, bundle) {
      for (const file of Object.keys(bundle)) {
        if (file.endsWith(".html") && file.startsWith("src/")) {
          const asset = bundle[file];
          bundle[file.replace(/^src\//, "")] = asset;
          delete bundle[file];
        }
      }
    }
  };
}
var vite_config_default = defineConfig({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    flattenHtmlOutput()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__vite_injected_original_dirname, "src/popup.html"),
        options_page: path.resolve(__vite_injected_original_dirname, "src/options.html")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    },
    outDir: "dist",
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxlZHJpc3kvRGVza3RvcC9uZXdzX2NoZWVrZXIvYXBwcy9mYWtlLW5ld3MtZXh0ZW5zaW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWxlZHJpc3kvRGVza3RvcC9uZXdzX2NoZWVrZXIvYXBwcy9mYWtlLW5ld3MtZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hbGVkcmlzeS9EZXNrdG9wL25ld3NfY2hlZWtlci9hcHBzL2Zha2UtbmV3cy1leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIEN1c3RvbSBwbHVnaW4gdG8gZmxhdHRlbiBIVE1MIG91dHB1dFxuZnVuY3Rpb24gZmxhdHRlbkh0bWxPdXRwdXQoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2ZsYXR0ZW4taHRtbC1vdXRwdXQnLFxuICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIE9iamVjdC5rZXlzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5odG1sJykgJiYgZmlsZS5zdGFydHNXaXRoKCdzcmMvJykpIHtcbiAgICAgICAgICBjb25zdCBhc3NldCA9IGJ1bmRsZVtmaWxlXTtcbiAgICAgICAgICAvLyBNb3ZlIHRvIHJvb3RcbiAgICAgICAgICBidW5kbGVbZmlsZS5yZXBsYWNlKC9ec3JjXFwvLywgJycpXSA9IGFzc2V0O1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZmlsZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZmxhdHRlbkh0bWxPdXRwdXQoKSwgXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBwb3B1cDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvcG9wdXAuaHRtbFwiKSxcbiAgICAgICAgb3B0aW9uc19wYWdlOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9vcHRpb25zLmh0bWxcIiksXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnW25hbWVdLmpzJyxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ1tuYW1lXS5bZXh0XScsXG4gICAgICB9XG4gICAgfSxcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlXLFNBQVMsb0JBQW9CO0FBQ3RZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsU0FBUyxvQkFBb0I7QUFDM0IsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZUFBZSxTQUFTLFFBQVE7QUFDOUIsaUJBQVcsUUFBUSxPQUFPLEtBQUssTUFBTSxHQUFHO0FBQ3RDLFlBQUksS0FBSyxTQUFTLE9BQU8sS0FBSyxLQUFLLFdBQVcsTUFBTSxHQUFHO0FBQ3JELGdCQUFNLFFBQVEsT0FBTyxJQUFJO0FBRXpCLGlCQUFPLEtBQUssUUFBUSxVQUFVLEVBQUUsQ0FBQyxJQUFJO0FBQ3JDLGlCQUFPLE9BQU8sSUFBSTtBQUFBLFFBQ3BCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sa0JBQWtCO0FBQUEsRUFDcEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLE9BQU8sS0FBSyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLFFBQy9DLGNBQWMsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLE1BQzFEO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxFQUNmO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
