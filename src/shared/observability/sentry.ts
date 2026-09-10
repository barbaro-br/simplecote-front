import * as Sentry from '@sentry/react'
import { SessaoExpiradaError } from '@/shared/api/api-client'

/**
 * Erros de AMBIENTE do cliente — não são bugs de código e a UI já degrada
 * sozinha quando eles acontecem:
 * - WebGL: `HeroFundo` tem pré-checagem + error boundary e cai no fundo
 *   estático (navegador antigo / GPU bloqueada / contexto perdido);
 * - ResizeObserver loop: aviso benigno do próprio browser, sem efeito visível.
 * Passavam como exceção não tratada e só faziam ruído no Sentry.
 */
const RUIDO_DE_AMBIENTE: RegExp[] = [
  /Error creating WebGL context/i,
  /THREE\.WebGLRenderer/i,
  /WebGL context (was )?lost/i,
  /ResizeObserver loop/i,
]

function mensagemDoEvento(event: Sentry.ErrorEvent, hint: Sentry.EventHint): string {
  const erro = hint.originalException
  if (erro instanceof Error && erro.message) return erro.message
  if (typeof erro === 'string') return erro
  const valor = event.exception?.values?.[0]
  return [valor?.type, valor?.value].filter(Boolean).join(': ')
}

/** `true` → o evento não deve ir pro Sentry. Exportada só para teste. */
export function deveDescartarEvento(event: Sentry.ErrorEvent, hint: Sentry.EventHint): boolean {
  if (hint.originalException instanceof SessaoExpiradaError) return true
  const mensagem = mensagemDoEvento(event, hint)
  return RUIDO_DE_AMBIENTE.some((re) => re.test(mensagem))
}

/**
 * Inicializa o Sentry apenas quando há DSN no build (`VITE_SENTRY_DSN`). Sem DSN
 * (dev/testes) é um no-op — nenhuma chamada de rede a serviço externo acontece.
 *
 * `beforeSend` descarta `SessaoExpiradaError` (transitório, já tratado com
 * redirect para `/login`) e o ruído de ambiente acima. Nenhum dado pessoal
 * (e-mail, token de link) é anexado: não há `setUser`/`setTag` com PII e o
 * `sendDefaultPii` permanece desligado.
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
      return deveDescartarEvento(event, hint) ? null : event
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
