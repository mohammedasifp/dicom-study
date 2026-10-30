import { readFile } from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function ohifConfigOverrides(backendUrl) {
  return {
    name: 'ohif-config-overrides',
    configureServer(server) {
      server.middlewares.use('/ohif/app-config.js', async (req, res) => {
        try {
          const upstream = await fetch(`${backendUrl}/ohif/app-config.js`, {
            headers: { cookie: req.headers.cookie || '', 'ngrok-skip-browser-warning': 'true' },
          })
          if (!upstream.ok) {
            res.statusCode = upstream.status
            return res.end(`// Backend answered ${upstream.status}`)
          }
          const overrides = await readFile(new URL('./dev/ohif-overrides.js', import.meta.url), 'utf8')
          res.setHeader('Content-Type', 'application/javascript')
          res.end(`${await upstream.text()}\n${overrides}`)
        } catch (error) {
          res.statusCode = 502
          res.end(`// Backend unreachable: ${error.message}`)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = (env.BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '')
  const backend = {
    target: backendUrl,
    changeOrigin: true,
    xfwd: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  }

  return {
    plugins: [react(), ohifConfigOverrides(backendUrl)],
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'],
      proxy: {
        '/api': backend,
        '/ohif': backend,
        '/dicom-web': backend,
        '/wado': backend,
      },
    },
  }
})
