import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Download, Key, Lifebuoy, Lock, LockOpen, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { dataBr, dataHoraBr, moeda } from '@/shared/format/formatters'
import { ROTULO_PAPEL } from '@/shared/domain/papel'
import { MetricaCard } from './MetricaCard'
import {
  baixarRelatorio,
  useComprador,
  useCotacoesDaLoja,
  useDefinirPrazo,
  useEntrarComoSuporte,
  useExcluirComprador,
  useReativarComprador,
  useReenviarVerificacao,
  useResetarSenhaAdmin,
  useSuspenderComprador,
} from './backoffice.api'
import { prazoLabel, rotuloStatus, type AdminComprador, type NivelPrazo } from './backoffice.schema'

const CLASSE_STATUS: Record<string, string> = {
  TESTE: 'bg-muted text-muted-foreground',
  ATIVA: 'bg-success/10 text-success-foreground',
  INADIMPLENTE: 'bg-destructive/10 text-destructive',
  CANCELADA: 'bg-muted text-muted-foreground',
}

const ROTULO_STATUS_COTACAO: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ABERTA: 'Aberta',
  ENCERRADA: 'Encerrada',
  PEDIDOS_GERADOS: 'Pedidos gerados',
  CANCELADA: 'Cancelada',
}

const CLASSE_STATUS_COTACAO: Record<string, string> = {
  RASCUNHO: 'bg-muted text-muted-foreground',
  ABERTA: 'bg-primary/10 text-primary',
  ENCERRADA: 'bg-warning/10 text-warning',
  PEDIDOS_GERADOS: 'bg-success/10 text-success',
  CANCELADA: 'bg-destructive/10 text-destructive',
}

const CLASSE_PRAZO_TEXTO: Record<NivelPrazo, string> = {
  ok: 'text-muted-foreground',
  atencao: 'text-warning',
  vencido: 'text-destructive',
}

type Acao =
  | { tipo: 'suspender' }
  | { tipo: 'reativar' }
  | { tipo: 'resetar'; admin: AdminComprador }
  | { tipo: 'suporte' }
  | { tipo: 'excluir' }
  | null

function mensagemDeErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

export function CompradorDetalhePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { entrarComoSuporte: trocarSessao } = useAuth()
  const { data: comprador, isLoading, error } = useComprador(id)
  const cotacoes = useCotacoesDaLoja(id)
  const suspender = useSuspenderComprador(id)
  const reativar = useReativarComprador(id)
  const resetarSenha = useResetarSenhaAdmin(id)
  const entrarComoSuporte = useEntrarComoSuporte()
  const excluir = useExcluirComprador(id)
  const definirPrazo = useDefinirPrazo(id)
  const reenviarVerificacao = useReenviarVerificacao(id)

  const [acao, setAcao] = useState<Acao>(null)
  const [motivo, setMotivo] = useState('')
  const [slugDigitado, setSlugDigitado] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [baixando, setBaixando] = useState(false)
  const [dataPrazo, setDataPrazo] = useState('')
  const [erroPrazo, setErroPrazo] = useState<string | null>(null)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando comprador…</p>
  if (error || !comprador) return <p className="p-6 text-destructive">Erro ao carregar comprador: {error?.message}</p>

  const slug = comprador.slug

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErro(mensagemDeErro(e))
  }

  async function confirmarSuspender() {
    try {
      await suspender.mutateAsync()
      setAcao(null)
    } catch (e) {
      tratarErro(e)
    }
  }

  async function confirmarReativar() {
    try {
      await reativar.mutateAsync()
      setAcao(null)
    } catch (e) {
      tratarErro(e)
    }
  }

  async function confirmarResetar(admin: AdminComprador) {
    setErro(null)
    try {
      await resetarSenha.mutateAsync(admin.id)
      setAcao(null)
      toast.success(`E-mail de recuperação enviado para ${admin.email}.`)
    } catch (e) {
      tratarErro(e)
    }
  }

  async function confirmarReenviar() {
    try {
      await reenviarVerificacao.mutateAsync()
      toast.success('E-mail de verificação reenviado')
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(mensagemDeErro(e))
    }
  }

  async function confirmarSuporte() {
    setErro(null)
    try {
      const { token } = await entrarComoSuporte.mutateAsync({ id, motivo })
      trocarSessao(token)
      navigate('/admin')
    } catch (e) {
      tratarErro(e)
    }
  }

  async function confirmarExcluir() {
    setErro(null)
    try {
      await excluir.mutateAsync()
      navigate('/backoffice/lojas', { replace: true })
      toast.success('Loja excluída.')
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(mensagemDeErro(e))
      setAcao(null)
    }
  }

  async function baixar() {
    setBaixando(true)
    try {
      const resultado = await baixarRelatorio(id, slug)
      if (resultado === 'assincrono') {
        toast.info('O relatório está sendo gerado e será enviado quando pronto.')
      } else {
        toast.success('Relatório baixado.')
      }
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(mensagemDeErro(e))
    } finally {
      setBaixando(false)
    }
  }

  function aplicarPrazo(expiraEm: string | null) {
    setErroPrazo(null)
    definirPrazo.mutate(expiraEm, {
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        setErroPrazo(mensagemDeErro(e))
      },
    })
  }

  function estenderPrazo(dias: number) {
    aplicarPrazo(new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString())
  }

  function definirPrazoPorData() {
    if (!dataPrazo) return
    aplicarPrazo(new Date(`${dataPrazo}T00:00:00Z`).toISOString())
  }

  function removerPrazo() {
    aplicarPrazo(null)
  }

  const slugConfere = slugDigitado.trim() === comprador.slug
  const prazo = prazoLabel(comprador.trialExpiraEm)

  return (
    <PageContainer maxWidth="4xl" className="space-y-6">
      <div>
        <Link to="/backoffice/lojas" className="text-sm text-muted-foreground hover:text-foreground">
          ← Compradores
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">{comprador.nome}</h1>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CLASSE_STATUS[comprador.statusAssinatura] ?? 'bg-muted text-muted-foreground'}`}
          >
            {rotuloStatus(comprador.statusAssinatura)}
          </span>
          {comprador.suspenso && (
            <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              Suspensa
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{comprador.slug}</p>
      </div>

      {erro && (
        <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
          {erro}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricaCard rotulo="Valor total comprado" valor={moeda(comprador.valorTotalComprado)} />
        <MetricaCard
          rotulo="Cotações"
          valor={comprador.cotacoes}
          extra={
            comprador.cotacoesPorStatus ? (
              <div className="flex flex-wrap gap-1">
                {Object.entries(comprador.cotacoesPorStatus).map(([status, total]) => (
                  <span
                    key={status}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CLASSE_STATUS_COTACAO[status] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {ROTULO_STATUS_COTACAO[status] ?? status} · {total}
                  </span>
                ))}
              </div>
            ) : null
          }
        />
        <MetricaCard rotulo="Primeira cotação" valor={comprador.primeiraCotacaoEm ? dataBr(comprador.primeiraCotacaoEm) : '—'} />
        <MetricaCard rotulo="Última atividade" valor={comprador.ultimaAtividadeEm ? dataHoraBr(comprador.ultimaAtividadeEm) : '—'} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Prazo de teste</h2>
        <div className="space-y-4">
          <p className={`text-sm font-medium ${CLASSE_PRAZO_TEXTO[prazo.nivel]}`}>{prazo.texto}</p>

          {erroPrazo && (
            <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
              {erroPrazo}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <Button variant="outline" size="sm" disabled={definirPrazo.isPending} onClick={() => estenderPrazo(7)}>
              +7 dias
            </Button>
            <Button variant="outline" size="sm" disabled={definirPrazo.isPending} onClick={() => estenderPrazo(30)}>
              +30 dias
            </Button>
            <div className="flex items-end gap-2">
              <Input
                aria-label="Escolher data do prazo"
                type="date"
                value={dataPrazo}
                onChange={(e) => setDataPrazo(e.target.value)}
                className="w-auto"
              />
              <Button variant="outline" size="sm" disabled={!dataPrazo || definirPrazo.isPending} onClick={definirPrazoPorData}>
                Definir
              </Button>
            </div>
            <Button variant="ghost" size="sm" disabled={definirPrazo.isPending} onClick={removerPrazo}>
              Remover prazo
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold ui-uppercase">Cotações</h2>
          <Button variant="outline" disabled={baixando} onClick={baixar}>
            <Download className="mr-2 size-4" />
            {baixando ? 'Baixando…' : 'Baixar relatório (CSV)'}
          </Button>
        </div>

        {cotacoes.isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Carregando cotações…</p>
        ) : cotacoes.error ? (
          <p className="py-6 text-sm text-destructive">Erro ao carregar cotações: {cotacoes.error.message}</p>
        ) : !cotacoes.data?.length ? (
          <p className="py-6 text-sm text-muted-foreground">Nenhuma cotação para esta loja.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium ui-uppercase">Título</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Status</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Itens</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Participantes</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Valor comprado</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Criada</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Encerrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cotacoes.data.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{c.titulo}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.qtdItens}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.qtdParticipantes}</td>
                    <td className="px-4 py-3 text-muted-foreground">{moeda(c.valorComprado)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dataBr(c.criadoEm)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.encerradoEm ? dataBr(c.encerradoEm) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Administradores</h2>
        {!comprador.admins.length ? (
          <p className="text-sm text-muted-foreground">Nenhum administrador.</p>
        ) : (
          <ul className="divide-y divide-border">
            {comprador.admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between gap-3 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{admin.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin.email} · {ROTULO_PAPEL[admin.papel]}
                  </p>
                  {admin.emailVerificado ? (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      E-mail verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Não verificado
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!admin.emailVerificado && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reenviarVerificacao.isPending}
                      onClick={confirmarReenviar}
                    >
                      {reenviarVerificacao.isPending ? 'Reenviando…' : 'Reenviar verificação'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setAcao({ tipo: 'resetar', admin })}>
                    <Key className="mr-2 size-4" />
                    Resetar senha
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Ações</h2>
        <div className="flex flex-wrap gap-2">
          {comprador.suspenso ? (
            <Button variant="outline" disabled={reativar.isPending} onClick={() => setAcao({ tipo: 'reativar' })}>
              <LockOpen className="mr-2 size-4" />
              Reativar
            </Button>
          ) : (
            <Button variant="destructive" disabled={suspender.isPending} onClick={() => setAcao({ tipo: 'suspender' })}>
              <Lock className="mr-2 size-4" />
              Suspender
            </Button>
          )}
          <Button variant="outline" onClick={() => setAcao({ tipo: 'suporte' })}>
            <Lifebuoy className="mr-2 size-4" />
            Entrar como suporte
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 border-destructive/40 p-6">
        <div>
          <h2 className="text-lg font-semibold text-destructive ui-uppercase">Zona de perigo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Excluir a loja permanentemente apaga todos os dados (cotações, produtos, empresas,
            representantes) sem período de carência. Esta ação não pode ser desfeita.
          </p>
        </div>
        <Button
          variant="destructive"
          disabled={excluir.isPending}
          onClick={() => {
            setSlugDigitado('')
            setErro(null)
            setAcao({ tipo: 'excluir' })
          }}
        >
          <Trash className="mr-2 size-4" />
          Excluir loja permanentemente
        </Button>
      </Card>

      {acao?.tipo === 'suspender' && (
        <ConfirmarDialog
          titulo="Suspender conta"
          descricao={`${comprador.nome} deixará de acessar o painel até ser reativada.`}
          rotuloConfirmar="Suspender"
          pendente={suspender.isPending}
          onConfirmar={confirmarSuspender}
          onCancelar={() => setAcao(null)}
        />
      )}

      {acao?.tipo === 'reativar' && (
        <ConfirmarDialog
          titulo="Reativar conta"
          descricao={`${comprador.nome} voltará a acessar o painel.`}
          rotuloConfirmar="Reativar"
          pendente={reativar.isPending}
          onConfirmar={confirmarReativar}
          onCancelar={() => setAcao(null)}
        />
      )}

      {acao?.tipo === 'resetar' && (
        <ConfirmarDialog
          titulo="Resetar senha do administrador"
          descricao={`O fluxo de recuperação de senha será disparado para ${acao.admin.email}.`}
          rotuloConfirmar="Enviar recuperação"
          pendente={resetarSenha.isPending}
          onConfirmar={() => confirmarResetar(acao.admin)}
          onCancelar={() => setAcao(null)}
        />
      )}

      {acao?.tipo === 'suporte' && (
        <Dialog open onClose={() => setAcao(null)} title="Entrar como suporte">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="motivo-suporte" className="text-sm font-medium ui-uppercase">
                Motivo
              </label>
              <textarea
                id="motivo-suporte"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo do suporte…"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Obrigatório — fica registrado na auditoria.</p>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="ghost" onClick={() => setAcao(null)}>
                Cancelar
              </Button>
              <Button disabled={!motivo.trim() || entrarComoSuporte.isPending} onClick={confirmarSuporte}>
                {entrarComoSuporte.isPending ? 'Entrando…' : 'Entrar'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {acao?.tipo === 'excluir' && (
        <Dialog open onClose={() => setAcao(null)} title="Excluir loja permanentemente">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta ação apaga todos os dados da loja, sem período de carência. Não há como desfazer.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="confirmar-excluir" className="text-sm font-medium ui-uppercase">
                Digite <strong>{comprador.slug}</strong> para confirmar
              </label>
              <Input
                id="confirmar-excluir"
                value={slugDigitado}
                onChange={(e) => setSlugDigitado(e.target.value)}
                autoComplete="off"
                placeholder={comprador.slug}
              />
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="ghost" onClick={() => setAcao(null)} disabled={excluir.isPending}>
                Cancelar
              </Button>
              <Button variant="destructive" disabled={!slugConfere || excluir.isPending} onClick={confirmarExcluir}>
                {excluir.isPending ? 'Excluindo…' : 'Excluir definitivamente'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </PageContainer>
  )
}
