import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          // Without this, a missing backend produces a raw ECONNREFUSED
          // stack trace with no indication of what to do about it.
          proxy.on('error', (_err, _req, res) => {
            console.error(
              '\n[vite proxy] Could not reach the backend at http://localhost:4000.\n' +
              '  Run "npm run server" in another terminal, or just use "npm run dev" ' +
              'from the project root, which starts both together.\n',
            )
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ message: 'Backend is not running. Start it with "npm run server".' }))
            }
          })
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
