import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, PackageOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/api/api-client'
import { toast } from 'sonner'
import {
  useAdicionarItemColaborador,
  useEstadoColaborador,
  useProdutosColaborador,
} from './colaborador.api'
import type { Produto } from './colaborador.schema'

function Skeleton() {
  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-10 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function ColaboradorPage() {
  const { token = '' } = useParams()
  const estado = useEstadoColaborador(token)
  const produtos = useProdutosColaborador(token)
  const adicionar = useAdicionarItemColaborador(token)

  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState('1')
  const [erro, setErro] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const s = busca.trim().toLowerCase()
    if (!s) return produtos.data ?? []
    return (produtos.data ?? []).filter(
      (p) =>
        p.nome.toLowerCase().includes(s) || (p.codigoBarras ?? '').toLowerCase().includes(s),
    )
  }, [produtos.data, busca])

  if (estado.isLoading) return <Skeleton />

  if (estado.error || !estado.data) {
    return (
      <div className="mx-auto max-w-md space-y-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Link inválido</h1>
        <p className="text-muted-foreground">
          Este link de colaborador não é válido. Peça um novo ao comprador.
        </p>
      </div>
    )
  }

  const { nomeLoja, cotacaoId, cotacaoTitulo } = estado.data

  if (!cotacaoId) {
    return (
      <div className="mx-auto max-w-md space-y-2 p-6 text-center">
        <h1 className="text-xl font-semibold">{nomeLoja}</h1>
        <p className="text-muted-foreground">
          Nenhuma cotação em rascunho no momento — fale com o comprador.
        </p>
      </div>
    )
  }

  function selecionar(p: Produto) {
    setSelecionado(p)
    setQuantidade('1')
    setErro(null)
  }

  async function aoAdicionar() {
    if (!selecionado) return
    const qtd = Number.parseInt(quantidade, 10)
    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro('Informe uma quantidade válida (mínimo 1).')
      return
    }
    setErro(null)
    try {
      await adicionar.mutateAsync({ produtoId: selecionado.id, quantidade: qtd })
      toast.success('Item adicionado à cotação!')
      setSelecionado(null)
      setBusca('')
      setQuantidade('1')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível adicionar o item.')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-10 pt-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{cotacaoTitulo}</h1>
        <p className="text-sm text-muted-foreground">{nomeLoja}</p>
      </div>

      {!selecionado && (
        <>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
              <Search className="size-4" />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar produto"
              placeholder="Buscar por nome ou código de barras…"
              className="w-full rounded-md border border-input bg-transparent py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <ul className="m-0 list-none space-y-1 p-0">
            {filtrados.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selecionar(p)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <PackageOpen className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{p.nome}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.codigoBarras ? `${p.codigoBarras} · ` : ''}
                      {p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
                        ? 'Unidade'
                        : `${p.unidade} com ${p.quantidadePorEmbalagem}`}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {filtrados.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </li>
            )}
          </ul>
        </>
      )}

      {selecionado && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground">{selecionado.nome}</div>
              <div className="text-xs text-muted-foreground">
                {selecionado.unidade === 'Unidade' && selecionado.quantidadePorEmbalagem === 1
                  ? 'Unidade'
                  : `${selecionado.unidade} com ${selecionado.quantidadePorEmbalagem}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelecionado(null)
                setErro(null)
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Trocar
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantidade" className="text-sm font-medium">
              Quantidade
            </label>
            <input
              id="quantidade"
              type="number"
              min={1}
              inputMode="numeric"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {erro && (
            <p role="alert" className="text-[13px] font-medium text-destructive">
              {erro}
            </p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={adicionar.isPending}
            onClick={aoAdicionar}
          >
            {adicionar.isPending ? 'Adicionando…' : 'Adicionar'}
          </Button>
        </div>
      )}
    </div>
  )
}
