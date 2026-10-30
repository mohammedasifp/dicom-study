import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import '@fontsource-variable/inter'
import { theme } from './theme.js'
import './index.css'
import I18nProvider from './i18n/I18nProvider.jsx'
import NotificationProvider from './components/common/NotificationProvider.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nProvider>
        <NotificationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotificationProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
