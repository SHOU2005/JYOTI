import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: {
      '/tts-proxy': {
        target: 'https://translate.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tts-proxy/, '/translate_tts'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Google blocks requests that include a non-Google Referer/Origin
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('x-forwarded-for');
            proxyReq.setHeader(
              'User-Agent',
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );
          });
        },
      },
    },
  },
})
