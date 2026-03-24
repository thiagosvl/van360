/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import Prerender from "vite-plugin-prerender";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "unfactually-intercatenated-shannan.ngrok-free.dev"   // permite qualquer domínio gerado pelo ngrok
    ]
  },
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    // Habilitar Prerendering apenas no build de produção
    mode === 'production' && Prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/', '/login', '/cadastro'],
      postProcess(renderedRoute) {
        // Otimização básica no HTML gerado
        renderedRoute.html = renderedRoute.html
          .replace(/<script (.*?) src="\/src\/main.tsx"><\/script>/g, '<script $1 src="/assets/index-*.js"></script>')
          .replace(/(href|src)="\//g, '$1="./'); // Ajusta caminhos para serem relativos se necessário
        
        return renderedRoute;
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
