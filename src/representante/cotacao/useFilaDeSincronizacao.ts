import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { CotacaoPorToken } from './cotacao-token.schema'
import {
  gravarEntrada,
  lerFila,
  limparFila,
  registrarFalha,
  removerEntrada,
  type Fila,
} from './fila-sincronizacao'

// Estado visual de uma célula (spec.md §9.1): 'enviando' e 'sincronizado' e
// 'falhou' (rede, com retry) e 'erro' (4xx definitivo, sem retry).
export type StatusCelula = 'enviando' | 'sincronizado' | 'falhou' | 'erro'

type PatchItem = { preco?: number; naoCotado?: boolean }

function patchDaEntrada(entrada: Fila[string]): PatchItem {
  return entrada.naoCotado ? { naoCotado: true } : { preco: entrada.preco }
}

const INTERVALO_RETRY_MS = 10_000

export function useFilaDeSincronizacao(token: string) {
  const [fila, setFila] = useState<Fila>(() => lerFila(token))
  const [statusPorItem, setStatusPorItem] = useState<Record<string, StatusCelula>>({})
  const [errosPorItem, setErrosPorItem] = useState<Record<string, string>>({})
  // Contador de versão por item (spec.md §10.2 / concorrência): uma edição nova
  // incrementa; um resultado (sucesso/erro) só vale se a versão não mudou.
  const versaoRef = useRef<Record<string, number>>({})

  const enviarUm = useCallback(
    async (itemCotacaoId: string, patch: PatchItem) => {
      const versao = versaoRef.current[itemCotacaoId] ?? 0
      setStatusPorItem((s) => ({ ...s, [itemCotacaoId]: 'enviando' }))
      try {
        await api.put<CotacaoPorToken>(`/public/cotacoes/${token}/lances`, {
          lances: [{ itemCotacaoId, ...patch }],
        })
        if (versao !== (versaoRef.current[itemCotacaoId] ?? 0)) return // resultado obsoleto
        setFila(removerEntrada(token, itemCotacaoId))
        setStatusPorItem((s) => ({ ...s, [itemCotacaoId]: 'sincronizado' }))
        setErrosPorItem((e) => {
          if (!(itemCotacaoId in e)) return e
          const { [itemCotacaoId]: _omit, ...resto } = e
          return resto
        })
      } catch (err) {
        if (versao !== (versaoRef.current[itemCotacaoId] ?? 0)) return
        if (err instanceof SessaoExpiradaError) return
        if (err instanceof ApiError) {
          // 4xx definitivo — tira da fila, mostra o ProblemDetail, sem retry.
          setFila(removerEntrada(token, itemCotacaoId))
          setStatusPorItem((s) => ({ ...s, [itemCotacaoId]: 'erro' }))
          setErrosPorItem((e) => ({ ...e, [itemCotacaoId]: err.message }))
        } else {
          // Falha de transporte — mantém na fila, incrementa tentativas.
          setFila(registrarFalha(token, itemCotacaoId))
          setStatusPorItem((s) => ({ ...s, [itemCotacaoId]: 'falhou' }))
        }
      }
    },
    [token],
  )

  const retryAgora = useCallback(() => {
    const atual = lerFila(token)
    for (const [itemId, entrada] of Object.entries(atual)) {
      void enviarUm(itemId, patchDaEntrada(entrada))
    }
  }, [token, enviarUm])

  // Chamado pelo ItemLanceCard quando o debounce assenta.
  const gravarEEnviar = useCallback(
    (itemCotacaoId: string, patch: PatchItem) => {
      versaoRef.current[itemCotacaoId] = (versaoRef.current[itemCotacaoId] ?? 0) + 1
      setFila(gravarEntrada(token, itemCotacaoId, patch))
      void enviarUm(itemCotacaoId, patch)
    },
    [token, enviarUm],
  )

  const limpar = useCallback(() => {
    limparFila(token)
    setFila({})
  }, [token])

  // Mount: fila não-vazia → uma tentativa imediata.
  useEffect(() => {
    if (Object.keys(lerFila(token)).length > 0) retryAgora()
    // só no mount / troca de token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Timer de 10s, ativo só com fila não-vazia.
  useEffect(() => {
    if (Object.keys(fila).length === 0) return
    const id = setInterval(retryAgora, INTERVALO_RETRY_MS)
    return () => clearInterval(id)
  }, [fila, retryAgora])

  // Evento 'online' do navegador → retry imediato.
  useEffect(() => {
    window.addEventListener('online', retryAgora)
    return () => window.removeEventListener('online', retryAgora)
  }, [retryAgora])

  return {
    fila,
    pendencias: Object.keys(fila).length,
    statusPorItem,
    errosPorItem,
    gravarEEnviar,
    retryAgora,
    limpar,
  }
}
