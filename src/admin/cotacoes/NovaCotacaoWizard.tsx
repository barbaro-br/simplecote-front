import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, CalendarCheck, ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { ItensSection } from './ItensSection'
import { RepresentantesModal } from './RepresentantesModal'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'
import { useCotacao, useConvidarEmpresas, useAbrir } from './cotacoes.api'

type Passo = 1 | 2 | 3

const PASSOS: { n: Passo; titulo: string; icon: typeof Package }[] = [
  { n: 1, titulo: 'Itens', icon: Package },
  { n: 2, titulo: 'Representantes', icon: Users },
  { n: 3, titulo: 'Prazo & revisar', icon: CalendarCheck },
]

export function NovaCotacaoWizard({ cotacaoId }: { cotacaoId: string }) {
  const navigate = useNavigate()
  const { data: cotacao } = useCotacao(cotacaoId)
  const convidar = useConvidarEmpresas(cotacaoId)
  const abrir = useAbrir(cotacaoId)

  const [passo, setPasso] = useState<Passo>(1)
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([])
  const [prazoIso, setPrazoIso] = useState<string | null>(null)
  const [representantesAberto, setRepresentantesAberto] = useState(false)
  const [prazoAberto, setPrazoAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const itens = cotacao?.itens ?? []

  function toggleEmpresa(id: string) {
    setEmpresasSelecionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErro(e instanceof ApiError ? e.message : 'Erro inesperado.')
  }

  async function aoAbrir() {
    if (!prazoIso) return
    setErro(null)
    try {
      if (empresasSelecionadas.length > 0) {
        await convidar.mutateAsync(empresasSelecionadas)
      }
      await abrir.mutateAsync({ prazo: prazoIso })
      navigate(`/admin/cotacoes/${cotacaoId}`)
    } catch (e) {
      tratarErro(e)
    }
  }

  const podeAbrir = itens.length >= 1 && empresasSelecionadas.length >= 1 && prazoIso !== null

  return (
    <PageContainer maxWidth="4xl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Montar cotação</h1>
        <button
          type="button"
          onClick={() => navigate(`/admin/cotacoes/${cotacaoId}`)}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          Montar direto na tela de detalhe
        </button>
      </div>

      <ol className="flex items-center gap-2">
        {PASSOS.map((p) => {
          const Icon = p.icon
          const ativo = passo === p.n
          const concluido = passo > p.n
          return (
            <li key={p.n} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  ativo
                    ? 'bg-primary/10 text-primary'
                    : concluido
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
                }`}
              >
                <Icon className="size-4" />
                <span>{p.titulo}</span>
              </div>
              {p.n < 3 && <div className="h-px w-6 bg-border" aria-hidden />}
            </li>
          )
        })}
      </ol>

      {erro && (
        <div role="alert" className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {erro}
        </div>
      )}

      {passo === 1 && (
        <Card className="p-4">
          <ItensSection cotacaoId={cotacaoId} itens={itens} editavel />
        </Card>
      )}

      {passo === 2 && (
        <Card className="space-y-4 p-6">
          <div className="text-sm text-muted-foreground">
            {empresasSelecionadas.length === 0
              ? 'Nenhuma empresa selecionada.'
              : `${empresasSelecionadas.length} ${empresasSelecionadas.length === 1 ? 'empresa selecionada' : 'empresas selecionadas'}.`}
          </div>
          <Button onClick={() => setRepresentantesAberto(true)}>
            <Users className="mr-2 size-4" />
            Selecionar empresas
          </Button>
          <RepresentantesModal
            cotacaoId={cotacaoId}
            status="RASCUNHO"
            open={representantesAberto}
            onClose={() => setRepresentantesAberto(false)}
            selecionadas={empresasSelecionadas}
            onToggle={toggleEmpresa}
          />
        </Card>
      )}

      {passo === 3 && (
        <Card className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            {itens.length} {itens.length === 1 ? 'item' : 'itens'} · {empresasSelecionadas.length}{' '}
            {empresasSelecionadas.length === 1 ? 'empresa' : 'empresas'} · expira{' '}
            {prazoIso ? dataHoraBr(prazoIso) : '—'}
          </p>
          <Button variant="outline" onClick={() => setPrazoAberto(true)}>
            <CalendarCheck className="mr-2 size-4" />
            {prazoIso ? 'Alterar prazo' : 'Escolher prazo'}
          </Button>
          {prazoAberto && (
            <AbrirCotacaoDialog
              onAbrir={(prazo) => {
                setPrazoIso(prazo)
                setPrazoAberto(false)
                setErro(null)
              }}
              onCancelar={() => setPrazoAberto(false)}
            />
          )}
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPasso((p) => Math.max(1, p - 1) as Passo)}
          disabled={passo === 1}
        >
          <ArrowLeft className="mr-2 size-4" />
          Voltar
        </Button>
        {passo < 3 ? (
          <Button onClick={() => setPasso((p) => Math.min(3, p + 1) as Passo)}>
            Avançar
            <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button onClick={aoAbrir} disabled={!podeAbrir}>
            Abrir
          </Button>
        )}
      </div>
    </PageContainer>
  )
}
