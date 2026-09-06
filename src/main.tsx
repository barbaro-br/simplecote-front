import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import { App } from './App.tsx'
import { iniciarSentry } from './shared/observability/sentry'
import { FallbackErro } from './shared/observability/FallbackErro'

iniciarSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackErro />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
