import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   watch: {
  //     ignored: ['api/*'],
  //     usePolling: true,
  //     cwd:'./'
  //   },
  //   proxy: {
  //     "/api": {
  //       target: "https://planit-api.vercel.app",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace("/api", ''),
  //       configure: (proxy, _options) => {
  //         proxy.on('error', (err, _req, _res) => {
  //           console.log('proxy error', err);
  //         });
  //         proxy.on('proxyReq', (proxyReq, req, _res) => {
  //           console.log('Sending Request to the Target:', req.method, req.url);
  //         });
  //         proxy.on('proxyRes', (proxyRes, req, _res) => {
  //           console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
  //         });
  //       },
  //     },
  //   },
  // },
  // optimizeDeps: {
  //   exclude: ['api/*'],
  // },
  plugins: [react()]
})
