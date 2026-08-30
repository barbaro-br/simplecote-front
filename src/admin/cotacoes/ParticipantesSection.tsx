import { useState } from 'react'
import { MessageCircle, Mail } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { MenuAcoes } from '@/shared/components/ui/menu-acoes'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import type { ParticipanteStatus } from '@/shared/domain/tipos-base'
import type { ConviteStatus } from './cotacoes.schema'
import { useConvidarEmpresas, useParticipantes, useReenviarConvite } from './cotacoes.api'
import { montarMensagemConvite, urlWhatsApp, urlMailto } from './compartilhar-link'
import { InsightEmpresaCard } from '../analise/InsightEmpresaCard'
import { useInsightEmpresa } from '../analise/analise.api'
import { HoverCard } from '@/shared/components/ui/HoverCard'

const ROTULO_PARTICIPANTE: Record<ParticipanteStatus, string> = {
  CONVIDADO: 'Convidado',
  VISUALIZOU: 'Visualizou',
  RESPONDIDO: 'Respondeu',
}

function ConviteStatusBadge({ status }: { status: ConviteStatus | null }) {
  if (status === 'ENVIADO') {
    return <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">convite enviado</span>
  }
  if (status === 'FALHOU') {
    return <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">falha no envio</span>
  }
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">convite não enviado</span>
}

function EmpresaHoverCell({ empresaId, nome }: { empresaId: string; nome: string }) {
  const [enabled, setEnabled] = useState(false)
  
  const query = useInsightEmpresa(empresaId, { enabled })

  return (
    <div onMouseEnter={() => setEnabled(true)} onFocus={() => setEnabled(true)}>
      <HoverCard trigger={<span className="font-medium hover:underline cursor-default">{nome}</span>}>
        <InsightEmpresaCard insight={query.isPending ? null : query.isError ? 'erro' : query.data ?? null} />
      </HoverCard>
    </div>
  )
}

type Props = {
  cotacaoId: string
  titulo: string
  prazo: string | null
  /** Convidar só é permitido em RASCUNHO (o backend rejeita fora disso). */
  podeConvidar: boolean
}

export function ParticipantesSection({ cotacaoId, titulo, prazo, podeConvidar }: Props) {
  const participantes = useParticipantes(cotacaoId)
  const { data: empresas } = useEmpresas()
  const convidar = useConvidarEmpresas(cotacaoId)
  const reenviar = useReenviarConvite(cotacaoId)
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const idsJaConvidados = new Set((participantes.data ?? []).map((p) => p.empresaId))
  const disponiveis = (empresas ?? []).filter((e) => e.ativo && !idsJaConvidados.has(e.id))

  function toggle(id: string) {
    setSelecionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function aoConvidar() {
    if (!selecionadas.length) return
    setErro(null)
    try {
      await convidar.mutateAsync(selecionadas)
      setSelecionadas([])
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro ao convidar empresas.')
    }
  }

  async function copiarLink(link: string, participanteId: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(participanteId)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Participantes</CardTitle>
      </CardHeader>

      <div className="p-4 space-y-4">
        {podeConvidar && (
          <div className="space-y-3 rounded-md border p-3 bg-muted/20">
            <p className="text-sm font-medium text-muted-foreground">Convidar empresas</p>
            {!disponiveis.length ? (
              <p className="text-sm text-muted-foreground">Nenhuma empresa ativa disponível para convite.</p>
            ) : (
              <ul className="space-y-1">
                {disponiveis.map((e) => (
                  <li key={e.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selecionadas.includes(e.id)}
                        onChange={() => toggle(e.id)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      {e.nome}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <Button
              type="button"
              onClick={aoConvidar}
              disabled={!selecionadas.length || convidar.isPending}
            >
              {convidar.isPending ? 'Convidando…' : 'Convidar selecionadas'}
            </Button>
          </div>
        )}

        {erro && (
          <div role="alert" className="text-sm text-destructive">
            {erro}
          </div>
        )}
      </div>

      <div className="overflow-x-auto border-t">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Representante</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {participantes.isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  Carregando participantes…
                </td>
              </tr>
            ) : !participantes.data?.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma empresa convidada.
                </td>
              </tr>
            ) : (
              participantes.data.map((p) => {
                const msg = montarMensagemConvite({
                  representanteNome: p.representanteNome,
                  titulo,
                  empresaNome: p.empresaNome,
                  prazo,
                  link: p.linkMagico,
                })
                const whatsappUrl = urlWhatsApp(msg, p.whatsappRepresentante)
                const mailtoUrl = urlMailto(msg, `Cotação: ${titulo}`, p.emailRepresentante)

                return (
                  <tr key={p.participanteId} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2">
                      <EmpresaHoverCell empresaId={p.empresaId} nome={p.empresaNome} />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{p.representanteNome}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{ROTULO_PARTICIPANTE[p.participanteStatus]}</span>
                        <ConviteStatusBadge status={p.conviteStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1 items-center">
                        {copiado === p.participanteId && (
                          <span className="text-xs text-muted-foreground animate-in fade-in mr-2">Copiado!</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Enviar por WhatsApp"
                          onClick={() => window.open(whatsappUrl, '_blank')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Enviar por e-mail"
                          onClick={() => { window.location.href = mailtoUrl }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <MenuAcoes
                          items={[
                            {
                              label: 'Copiar link',
                              onSelect: () => copiarLink(p.linkMagico, p.participanteId),
                            },
                            {
                              label: 'Reenviar e-mail automático',
                              disabled: reenviar.isPending,
                              onSelect: () => reenviar.mutate(p.participanteId),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

