import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Barcode, Package, Plus } from '@phosphor-icons/react'
import { ApiError } from '@/shared/api/api-client'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import {
  Superficie,
  Lista,
  LinhaLista,
  Busca,
  BotaoPrimario,
  BotaoFantasma,
} from '@/shared/ui'
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
  import('@/shared/components/LeitorCodigoBarras').then((m) => ({ default: m.LeitorCodigoBarras })),
)

function Casca({ children }: { children: ReactNode }) {
  return (
    <div data-painel="dark" className="min-h-screen">
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <Casca>
      <div className="mx-auto max-w-md space-y-4 p-6">
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-10 animate-pulse rounded bg-white/10" />
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      </div>
    </Casca>
  )
}

const CLASSE_INPUT =
  'w-full rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] px-3 py-2 text-[13px] text-[var(--pnl-txt,#fff)] placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] focus:outline-none focus:ring-1 focus:ring-[var(--pnl-acento,#57bf8e)]/50'
const CLASSE_LABEL = 'text-[13px] font-medium text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]'

type FormularioNovoProdutoProps = {
  nome: string
  unidade: string
  qtdEmb: string
  quantidade: string
  onChangeNome: (v: string) => void
  onChangeUnidade: (v: string) => void
  onChangeQtdEmb: (v: string) => void
  onChangeQuantidade: (v: string) => void
}

function FormularioNovoProduto({
  nome,
  unidade,
  qtdEmb,
  quantidade,
  onChangeNome,
  onChangeUnidade,
  onChangeQtdEmb,
  onChangeQuantidade,
}: FormularioNovoProdutoProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor="novoNome" className={CLASSE_LABEL}>
          Nome
        </label>
        <input
          id="novoNome"
          type="text"
          value={nome}
          onChange={(e) => onChangeNome(e.target.value)}
          className={CLASSE_INPUT}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="novoUnidade" className={CLASSE_LABEL}>
            Unidade
          </label>
          <input
            id="novoUnidade"
            type="text"
            value={unidade}
            onChange={(e) => onChangeUnidade(e.target.value)}
            className={CLASSE_INPUT}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="novoQtdEmb" className={CLASSE_LABEL}>
            Qtd/Emb
          </label>
          <input
            id="novoQtdEmb"
            type="number"
            min={1}
            inputMode="numeric"
            value={qtdEmb}
            onChange={(e) => onChangeQtdEmb(e.target.value)}
            className={CLASSE_INPUT}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="quantidadeNovo" className={CLASSE_LABEL}>
          Quantidade
        </label>
        <input
          id="quantidadeNovo"
          type="number"
          min={1}
          inputMode="numeric"
          value={quantidade}
          onChange={(e) => onChangeQuantidade(e.target.value)}
          className={CLASSE_INPUT}
        />
      </div>
    </>
  )
}

function PainelForm({
  titulo,
  descricao,
  aoCancelar,
  rotuloCancelar = 'Cancelar',
  children,
}: {
  titulo: string
  descricao?: string
  aoCancelar: () => void
  rotuloCancelar?: string
  children: ReactNode
}) {
  return (
    <Superficie className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold text-[var(--pnl-txt,#fff)]">{titulo}</div>
          {descricao && (
            <div className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
              {descricao}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={aoCancelar}
          className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] hover:text-[var(--pnl-txt,#fff)]"
        >
          {rotuloCancelar}
        </button>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </Superficie>
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
  const [modoCadastro, setModoCadastro] = useState(false)
  const [gtinBipado, setGtinBipado] = useState<string | null>(null)
  const lookup = useLookupProdutoColaborador(token, gtinBipado ?? '')

  const [novoNome, setNovoNome] = useState('')
  const [novoUnidade, setNovoUnidade] = useState('Unidade')
  const [novoQtdEmb, setNovoQtdEmb] = useState('1')

  const filtrados = useMemo(() => {
    const s = busca.trim().toLowerCase()
    if (!s) return produtos.data ?? []
    return (produtos.data ?? []).filter(
      (p) => p.nome.toLowerCase().includes(s) || (p.codigoBarras ?? '').toLowerCase().includes(s),
    )
  }, [produtos.data, busca])

  if (estado.isLoading) return <Skeleton />

  if (estado.error || !estado.data) {
    return (
      <Casca>
        <div className="mx-auto max-w-md space-y-2 p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--pnl-txt,#fff)]">Link inválido</h1>
          <p className="text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            Este link de colaborador não é válido. Peça um novo ao comprador.
          </p>
        </div>
      </Casca>
    )
  }

  const { nomeLoja, cotacoesAbertas } = estado.data

  if (cotacoesAbertas.length === 0) {
    return (
      <Casca>
        <div className="mx-auto max-w-md space-y-2 p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--pnl-txt,#fff)]">{nomeLoja}</h1>
          <p className="text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            Nenhuma cotação aberta no momento.
          </p>
        </div>
      </Casca>
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

  function cancelarCadastro() {
    setModoCadastro(false)
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
        quantidade: qtd,
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
        quantidade: qtd,
      })
      toast.success('Item adicionado à cotação!')
      cancelarBipado()
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível cadastrar o item.')
    }
  }

  async function aoCadastrarManual() {
    const qtd = Number.parseInt(quantidade, 10)
    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro('Informe uma quantidade válida (mínimo 1).')
      return
    }
    const nome = novoNome.trim()
    if (!nome) {
      setErro('Informe o nome do produto.')
      return
    }
    const qtdEmb = Number.parseInt(novoQtdEmb, 10)
    if (!Number.isInteger(qtdEmb) || qtdEmb < 1) {
      setErro('Informe uma quantidade por embalagem válida (mínimo 1).')
      return
    }
    setErro(null)
    try {
      await cadastrarBipado.mutateAsync({
        cotacaoId: cotacaoAtualId,
        nome,
        unidade: novoUnidade,
        quantidadePorEmbalagem: qtdEmb,
        quantidade: qtd,
      })
      toast.success('Item adicionado à cotação!')
      cancelarCadastro()
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

  const alerta = erro && (
    <p role="alert" className="text-[13px] font-medium text-[var(--pnl-perigo,#ff6b6b)]">
      {erro}
    </p>
  )

  return (
    <Casca>
      <div className="mx-auto max-w-md space-y-4 px-4 pb-10 pt-6">
        <div
          data-testid="cabecalho-colaborador"
          className="sticky top-0 z-10 -mx-4 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)] px-4 pb-3 pt-4"
        >
          {cotacoesAbertas.length === 1 ? (
            <h1 className="text-xl font-semibold tracking-tight text-[var(--pnl-txt,#fff)]">
              {cotacoesAbertas[0].titulo}
            </h1>
          ) : (
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {cotacoesAbertas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCotacaoSelecionadaId(c.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    cotacaoAtualId === c.id
                      ? 'bg-[var(--pnl-acento,#57bf8e)]/15 text-[var(--pnl-acento-hi,#6fe6ac)] ring-1 ring-inset ring-[var(--pnl-acento,#57bf8e)]/30'
                      : 'bg-white/[0.06] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]',
                  )}
                >
                  {c.titulo}
                </button>
              ))}
            </div>
          )}
          <p className="mt-1 text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{nomeLoja}</p>
        </div>

        {!selecionado && !gtinBipado && !modoCadastro && (
          <>
            <BotaoFantasma
              type="button"
              className="h-10 w-full gap-2 text-[14px]"
              onClick={() => setModoBipador(true)}
            >
              <Barcode className="size-4" aria-hidden />
              Bipar código de barras
            </BotaoFantasma>

            <BotaoFantasma
              type="button"
              className="h-10 w-full gap-2 text-[14px]"
              onClick={() => setModoCadastro(true)}
            >
              <Plus className="size-4" aria-hidden />
              Cadastrar produto
            </BotaoFantasma>

            <Busca
              aria-label="Buscar produto"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou código de barras…"
            />

            <Superficie>
              {filtrados.length === 0 ? (
                <p className="py-10 text-center text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                  Nenhum produto encontrado.
                </p>
              ) : (
                <Lista>
                  {filtrados.map((p) => (
                    <LinhaLista
                      key={p.id}
                      onClick={() => selecionar(p)}
                      avatar={<Package className="size-4 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]" />}
                      titulo={p.nome}
                      meta={
                        (p.codigoBarras ? `${p.codigoBarras} · ` : '') +
                        (p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
                          ? 'Unidade'
                          : `${p.unidade} com ${p.quantidadePorEmbalagem}`)
                      }
                    />
                  ))}
                </Lista>
              )}
            </Superficie>
          </>
        )}

        {gtinBipado && (
          <PainelForm
            titulo="Código Lido"
            descricao={gtinBipado}
            aoCancelar={cancelarBipado}
          >
            {lookup.isLoading ? (
              <div className="py-8 text-center text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                Buscando produto…
              </div>
            ) : lookup.isSuccess && lookup.data ? (
              <>
                <div className="rounded-md bg-white/[0.04] p-3">
                  <div className="text-sm font-medium text-[var(--pnl-txt,#fff)]">
                    {lookup.data.nome}
                  </div>
                  {lookup.data.marca && (
                    <div className="mt-0.5 text-xs text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                      {lookup.data.marca}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="quantidadeBipado" className={CLASSE_LABEL}>
                    Quantidade
                  </label>
                  <input
                    id="quantidadeBipado"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className={CLASSE_INPUT}
                  />
                </div>
              </>
            ) : lookup.isSuccess && !lookup.data ? (
              <>
                <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
                  Produto não encontrado. Preencha os dados abaixo:
                </p>
                <FormularioNovoProduto
                  nome={novoNome}
                  unidade={novoUnidade}
                  qtdEmb={novoQtdEmb}
                  quantidade={quantidade}
                  onChangeNome={setNovoNome}
                  onChangeUnidade={setNovoUnidade}
                  onChangeQtdEmb={setNovoQtdEmb}
                  onChangeQuantidade={setQuantidade}
                />
              </>
            ) : null}

            {alerta}

            {!lookup.isLoading && (
              <BotaoPrimario
                type="button"
                className="h-10 w-full text-[14px]"
                disabled={cadastrarBipado.isPending}
                onClick={aoCadastrarBipado}
              >
                {cadastrarBipado.isPending ? 'Adicionando…' : 'Adicionar'}
              </BotaoPrimario>
            )}
          </PainelForm>
        )}

        {modoCadastro && !gtinBipado && (
          <PainelForm
            titulo="Cadastrar produto"
            descricao="Produto novo, fora do catálogo."
            aoCancelar={cancelarCadastro}
          >
            <FormularioNovoProduto
              nome={novoNome}
              unidade={novoUnidade}
              qtdEmb={novoQtdEmb}
              quantidade={quantidade}
              onChangeNome={setNovoNome}
              onChangeUnidade={setNovoUnidade}
              onChangeQtdEmb={setNovoQtdEmb}
              onChangeQuantidade={setQuantidade}
            />
            {alerta}
            <BotaoPrimario
              type="button"
              className="h-10 w-full text-[14px]"
              disabled={cadastrarBipado.isPending}
              onClick={aoCadastrarManual}
            >
              {cadastrarBipado.isPending ? 'Adicionando…' : 'Adicionar'}
            </BotaoPrimario>
          </PainelForm>
        )}

        {selecionado && !gtinBipado && (
          <PainelForm
            titulo={selecionado.nome}
            descricao={
              selecionado.unidade === 'Unidade' && selecionado.quantidadePorEmbalagem === 1
                ? 'Unidade'
                : `${selecionado.unidade} com ${selecionado.quantidadePorEmbalagem}`
            }
            rotuloCancelar="Trocar"
            aoCancelar={() => {
              setSelecionado(null)
              setErro(null)
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="quantidade" className={CLASSE_LABEL}>
                Quantidade
              </label>
              <input
                id="quantidade"
                type="number"
                min={1}
                inputMode="numeric"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className={CLASSE_INPUT}
              />
            </div>
            {alerta}
            <BotaoPrimario
              type="button"
              className="h-10 w-full text-[14px]"
              disabled={adicionar.isPending}
              onClick={aoAdicionar}
            >
              {adicionar.isPending ? 'Adicionando…' : 'Adicionar'}
            </BotaoPrimario>
          </PainelForm>
        )}
      </div>
    </Casca>
  )
}
