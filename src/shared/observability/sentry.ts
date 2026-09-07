import * as Sentry from '@sentry/react'
import { SessaoExpiradaError } from '@/shared/api/api-client'

/**
 * Inicializa o Sentry apenas quando há DSN no build (`VITE_SENTRY_DSN`). Sem DSN
 * (dev/testes) é um no-op — nenhuma chamada de rede a serviço externo acontece.
 *
 * `beforeSend` descarta `SessaoExpiradaError` (transitório, já tratado com
 * redirect para `/login`). Nenhum dado pessoal (e-mail, token de link) é anexado:
 * não há `setUser`/`setTag` com PII e o `sendDefaultPii` permanece desligado.
 */
export function iniciarSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: 0,
    beforeSend(event, hint) {
      if (hint.originalException instanceof SessaoExpiradaError) {
        return null
      }
      return event
    },
  })
}

/**
 * Tag de inquilino nos eventos: apenas o id técnico do `Comprador` — nunca
 * nome, e-mail ou telefone (rule de "nenhum dado pessoal"). Inócuo sem DSN.
 */
export function definirCompradorTag(compradorId: string): void {
  Sentry.setTag('comprador', compradorId)
}

export function limparCompradorTag(): void {
  Sentry.setTag('comprador', '')
}
