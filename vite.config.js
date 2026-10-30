import { readFile } from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function ohifConfigOverrides(target, authorization) {
  return {
    name: 'ohif-config-overrides',
    configureServer(server) {
      server.middlewares.use('/ohif/app-config.js', async (_req, res) => {
        try {
          const [upstream, overrides] = await Promise.all([
            fetch(`${target}/ohif/app-config.js`, { headers: { Authorization: authorization } }).then((r) => r.text()),
            readFile(new URL('./dev/ohif-overrides.js', import.meta.url), 'utf8'),
          ])
          res.setHeader('Content-Type', 'application/javascript')
          res.end(`${upstream}\n${overrides}`)
        } catch (error) {
          res.statusCode = 502
          res.end(`// Orthanc unreachable: ${error.message}`)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.ORTHANC_URL || 'http://localhost:8042'
  const user = env.ORTHANC_USER || 'svaim'
  const password = env.ORTHANC_PASSWORD || 'svaim'
  const authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`

  const orthanc = { target, changeOrigin: true, headers: { Authorization: authorization } }
  const backend = {
    target: (env.BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, ''),
    changeOrigin: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  }

  return {
    plugins: [react(), ohifConfigOverrides(target, authorization)],
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'],
      proxy: {
        '/ohif': orthanc,
        '/dicom-web': orthanc,
        '/wado': orthanc,
        '/api': backend,
      },
    },
  }
})
