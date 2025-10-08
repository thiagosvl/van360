import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/asaas": {
        target: "https://api-sandbox.asaas.com/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/asaas/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("➡ Proxy request para:", proxyReq.getHeader("host") + proxyReq.path);

            const asaasKey = proxyReq.getHeader("x-asaas-key");

            if (asaasKey) {
              proxyReq.setHeader("access_token", asaasKey);

              proxyReq.removeHeader("x-asaas-key");
            }
          });
        },
      },
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
