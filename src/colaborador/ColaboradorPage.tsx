import { lazy, Suspense, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, PackageOpen, ScanLine } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/api/api-client'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import {
  useAdicionarItemColaborador,
  useEstadoColaborador,
  useProdutosColaborador,
  useLookupProdutoColaborador,
  useCadastrarItemBipadoColaborador,
} from './colaborador.api'
import type { Produto } from './colaborador.schema'

// Lazy: @zxing/browser só é baixado quando o colaborador realmente abre a câmera.
const LeitorCodigoBarras = lazy(() =>
  import('./LeitorCodigoBarras').then((m) => ({ default: m.LeitorCodigoBarras })),
)

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
  const cadastrarBipado = useCadastrarItemBipadoColaborador(token)

  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState('1')
  const [erro, setErro] = useState<string | null>(null)
  const [cotacaoSelecionadaId, setCotacaoSelecionadaId] = useState<string | null>(null)

  const [modoBipador, setModoBipador] = useState(false)
  const [gtinBipado, setGtinBipado] = useState<string | null>(null)
  const lookup = useLookupProdutoColaborador(token, gtinBipado ?? '')

  // Form for not found product
  const [novoNome, setNovoNome] = useState('')
  const [novoUnidade, setNovoUnidade] = useState('Unidade')
  const [novoQtdEmb, setNovoQtdEmb] = useState('1')

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

  const { nomeLoja, cotacoesAbertas } = estado.data

  if (cotacoesAbertas.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-2 p-6 text-center">
        <h1 className="text-xl font-semibold">{nomeLoja}</h1>
        <p className="text-muted-foreground">
          Nenhuma cotação aberta no momento.
        </p>
      </div>
    )
  }

  const cotacaoAtualId = cotacaoSelecionadaId ?? cotacoesAbertas[0].id

  function selecionar(p: Produto) {
    setSelecionado(p)
    setQuantidade('1')
    setErro(null)
  }

  function cancelarBipado() {
    setGtinBipado(null)
    setNovoNome('')
    setNovoUnidade('Unidade')
    setNovoQtdEmb('1')
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
      await adicionar.mutateAsync({
        cotacaoId: cotacaoAtualId,
        produtoId: selecionado.id, 
        quantidade: qtd 
      })
      toast.success('Item adicionado à cotação!')
      setSelecionado(null)
      setBusca('')
      setQuantidade('1')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível adicionar o item.')
    }
  }

  async function aoCadastrarBipado() {
    if (!gtinBipado) return
    const qtd = Number.parseInt(quantidade, 10)
    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro('Informe uma quantidade válida (mínimo 1).')
      return
    }
    const isFound = lookup.data !== null
    const nome = isFound ? lookup.data!.nome : novoNome.trim()
    if (!nome) {
      setErro('Informe o nome do produto.')
      return
    }
    const qtdEmb = Number.parseInt(novoQtdEmb, 10)
    if (!isFound && (!Number.isInteger(qtdEmb) || qtdEmb < 1)) {
      setErro('Informe uma quantidade por embalagem válida (mínimo 1).')
      return
    }
    
    setErro(null)
    try {
      await cadastrarBipado.mutateAsync({
        cotacaoId: cotacaoAtualId,
        gtin: gtinBipado,
        nome,
        unidade: isFound ? 'Unidade' : novoUnidade,
        quantidadePorEmbalagem: isFound ? 1 : qtdEmb,
        quantidade: qtd
      })
      toast.success('Item adicionado à cotação!')
      cancelarBipado()
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível cadastrar o item.')
    }
  }

  if (modoBipador) {
    return (
      <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
        <LeitorCodigoBarras
          onRead={(gtin) => {
            setModoBipador(false)
            setGtinBipado(gtin)
            setQuantidade('1')
          }}
          onClose={() => setModoBipador(false)}
        />
      </Suspense>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-10 pt-6">
      <div className="space-y-3">
        <div>
          {cotacoesAbertas.length === 1 ? (
            <h1 className="text-xl font-semibold tracking-tight">{cotacoesAbertas[0].titulo}</h1>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cotacoesAbertas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCotacaoSelecionadaId(c.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    cotacaoAtualId === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {c.titulo}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">{nomeLoja}</p>
        </div>
      </div>

      {!selecionado && !gtinBipado && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => setModoBipador(true)}
          >
            <ScanLine className="size-4" />
            Bipar código de barras
          </Button>

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

      {gtinBipado && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground">Código Lido</div>
              <div className="text-xs text-muted-foreground">{gtinBipado}</div>
            </div>
            <button
              type="button"
              onClick={cancelarBipado}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>

          {lookup.isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Buscando produto…
            </div>
          ) : lookup.isSuccess && lookup.data ? (
            <div className="space-y-3 pt-2">
              <div className="rounded-md bg-muted/50 p-3">
                <div className="text-sm font-medium">{lookup.data.nome}</div>
                {lookup.data.marca && (
                  <div className="text-xs text-muted-foreground mt-0.5">{lookup.data.marca}</div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="quantidadeBipado" className="text-sm font-medium">Quantidade</label>
                <input
                  id="quantidadeBipado"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          ) : lookup.isSuccess && !lookup.data ? (
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Produto não encontrado. Preencha os dados abaixo:
              </p>
              <div className="space-y-2">
                <label htmlFor="novoNome" className="text-sm font-medium">Nome</label>
                <input
                  id="novoNome"
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="novoUnidade" className="text-sm font-medium">Unidade</label>
                  <input
                    id="novoUnidade"
                    type="text"
                    value={novoUnidade}
                    onChange={(e) => setNovoUnidade(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="novoQtdEmb" className="text-sm font-medium">Qtd/Emb</label>
                  <input
                    id="novoQtdEmb"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={novoQtdEmb}
                    onChange={(e) => setNovoQtdEmb(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="quantidadeNovo" className="text-sm font-medium">Quantidade</label>
                <input
                  id="quantidadeNovo"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          ) : null}

          {erro && (
            <p role="alert" className="text-[13px] font-medium text-destructive">
              {erro}
            </p>
          )}

          {!lookup.isLoading && (
            <Button
              type="button"
              className="w-full"
              disabled={cadastrarBipado.isPending}
              onClick={aoCadastrarBipado}
            >
              {cadastrarBipado.isPending ? 'Adicionando…' : 'Adicionar'}
            </Button>
          )}
        </div>
      )}

      {selecionado && !gtinBipado && (
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


