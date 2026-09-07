import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Key, Lifebuoy, Lock, LockOpen } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { dataBr, dataHoraBr } from '@/shared/format/formatters'
import { ROTULO_PAPEL } from '@/shared/domain/papel'
import {
  useComprador,
  useEntrarComoSuporte,
  useReativarComprador,
  useResetarSenhaAdmin,
  useSuspenderComprador,
} from './backoffice.api'
import { rotuloStatus, type AdminComprador } from './backoffice.schema'

const CLASSE_STATUS: Record<string, string> = {
  TESTE: 'bg-muted text-muted-foreground',
  ATIVA: 'bg-success/10 text-success-foreground',
  INADIMPLENTE: 'bg-destructive/10 text-destructive',
  CANCELADA: 'bg-muted text-muted-foreground',
}

type Acao =
  | { tipo: 'suspender' }
  | { tipo: 'reativar' }
  | { tipo: 'resetar'; admin: AdminComprador }
  | { tipo: 'suporte' }
  | null

function mensagemDeErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

export function CompradorDetalhePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { entrarComoSuporte: trocarSessao } = useAuth()
  const { data: comprador, isLoading, error } = useComprador(id)
  const suspender = useSuspenderComprador(id)
  const reativar = useReativarComprador(id)
  const resetarSenha = useResetarSenhaAdmin(id)
  const entrarComoSuporte = useEntrarComoSuporte()

  const [acao, setAcao] = useState<Acao>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando comprador…</p>
  if (error || !comprador) return <p className="p-6 text-destructive">Erro ao carregar comprador: {error?.message}</p>

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

  return (
    <PageContainer maxWidth="4xl" className="space-y-6">
      <div>
        <Link to="/backoffice" className="text-sm text-muted-foreground hover:text-foreground">
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
      </div>

      {erro && (
        <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
          {erro}
        </div>
      )}

      <Card className="space-y-3 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground ui-uppercase">Slug</p>
            <p className="text-sm">{comprador.slug}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground ui-uppercase">Criada em</p>
            <p className="text-sm">{dataBr(comprador.criadoEm)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground ui-uppercase">Último acesso</p>
            <p className="text-sm">{comprador.ultimoAcessoEm ? dataHoraBr(comprador.ultimoAcessoEm) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground ui-uppercase">Uso</p>
            <p className="text-sm">
              {comprador.cotacoes} cotações · {comprador.usuarios} usuários · {comprador.representantes} representantes
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
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

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Administradores</h2>
        {!comprador.admins.length ? (
          <p className="text-sm text-muted-foreground">Nenhum administrador.</p>
        ) : (
          <ul className="divide-y divide-border">
            {comprador.admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{admin.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin.email} · {ROTULO_PAPEL[admin.papel]}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAcao({ tipo: 'resetar', admin })}>
                  <Key className="mr-2 size-4" />
                  Resetar senha
                </Button>
              </li>
            ))}
          </ul>
        )}
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
    </PageContainer>
  )
}
