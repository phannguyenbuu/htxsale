import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function saleAdminSpaFallback() {
  const rewrite = (req, _res, next) => {
    const url = req.url || ''
    if (
      url === '/sale_admin' ||
      url.startsWith('/sale_admin/') ||
      url === '/sale_amin' ||
      url.startsWith('/sale_amin/')
    ) {
      req.url = '/index.html'
    }
    next()
  }

  return {
    name: 'sale-admin-spa-fallback',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), saleAdminSpaFallback()],
  base: command === 'serve' ? '/' : '/sale/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8008',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}))
