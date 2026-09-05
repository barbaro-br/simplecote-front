import { useState, useMemo, useRef, useEffect } from 'react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { useRepresentantes } from '@/admin/representantes/representantes.api'
import {
  useParticipantes,
  useReenviarConvite,
  useConvidarEmpresas,
  useDesconvidarParticipante,
  useFinalizarParticipante,
  useReabrirParticipante,
} from './cotacoes.api'
import { Send, Mail, Phone, Search, X, Info, CheckCircle2, Loader2, Copy, MessageCircle, RotateCcw } from 'lucide-react'
import { ConfirmarDialog } from './ConfirmarDialog'
import { urlWhatsApp, urlMailto } from './compartilhar-link'
import { aplicarMascaraTelefone } from '@/shared/utils/telefone'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { toast } from 'sonner'

type Props = {
  cotacaoId: string
  status: string
  open: boolean
  onClose: () => void
  selecionadas: string[]
  onToggle: (empresaId: string) => void
}

const ROTULO_STATUS_RESPOSTA: Record<'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO', string> = {
  CONVIDADO: 'Convidado',
  VISUALIZOU: 'Enviado',
  RESPONDIDO: 'Finalizado',
}

const CLASSE_STATUS_RESPOSTA: Record<'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO', string> = {
  CONVIDADO: 'bg-muted text-muted-foreground border-transparent',
  VISUALIZOU: 'bg-warning/10 text-warning border-warning/30',
  RESPONDIDO: 'bg-success/10 text-success-foreground border-success/30',
}

export function RepresentantesModal({ cotacaoId, status, open, onClose, selecionadas, onToggle }: Props) {
  const participantes = useParticipantes(cotacaoId)
  const reenviar = useReenviarConvite(cotacaoId)
  const convidar = useConvidarEmpresas(cotacaoId)
  const finalizar = useFinalizarParticipante(cotacaoId)
  const reabrir = useReabrirParticipante(cotacaoId)
  const desconvidar = useDesconvidarParticipante(cotacaoId)
  const { data: empresas } = useEmpresas()
  const { data: reps } = useRepresentantes()
  const [loadingMailId, setLoadingMailId] = useState<string | null>(null)
  const [isEnviando, setIsEnviando] = useState(false)
  const [alvoDesconvidar, setAlvoDesconvidar] = useState<{ participanteId: string; nome: string; status?: string } | null>(null)

  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const isAberta = status !== 'RASCUNHO'
  const emAberta = status === 'ABERTA'
  const podeGerenciarResposta = status === 'ABERTA' || status === 'ENCERRADA'

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearch('')
    }
  }
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const lista = useMemo(() => {
    if (!empresas || !reps) return []
    return empresas.map(emp => {
      const rep = reps.find(r => r.empresaId === emp.id)
      const part = participantes.data?.find(p => p.empresaId === emp.id)
      return {
        id: emp.id,
        nome: emp.nome,
        repNome: rep?.nome,
        repEmail: rep?.email,
        repWhatsapp: rep?.whatsapp,
        part,
        isChecked: isAberta ? !!part : selecionadas.includes(emp.id)
      }
    }).sort((a, b) => {
      if (a.isChecked && !b.isChecked) return -1
      if (!a.isChecked && b.isChecked) return 1
      return a.nome.localeCompare(b.nome)
    })
  }, [empresas, reps, participantes.data, selecionadas, isAberta])

  const filtrados = useMemo(() => {
    if (!search) return lista

    const s = search.toLowerCase()
    return lista.filter(e =>
      e.nome.toLowerCase().includes(s) ||
      (e.repNome && e.repNome.toLowerCase().includes(s))
    )
  }, [lista, search])

  const totalSelecionados = lista.filter(l => l.isChecked).length
  const totalConvidados = lista.filter(l => l.part).length
  const naoEnviadoCount = lista.filter(l => l.part && l.part.conviteStatus !== 'ENVIADO').length

  const handleDispararTodosEmail = async () => {
    const pendentes = lista.filter(l => l.part && l.part.conviteStatus !== 'ENVIADO')
    if (pendentes.length === 0) return

    setIsEnviando(true)
    const toastId = toast.loading('Reenviando convites...')

    const results = await Promise.allSettled(
      pendentes.map(p => reenviar.mutateAsync(p.part!.participanteId))
    )

    setIsEnviando(false)

    const sucesso = results.filter(r => r.status === 'fulfilled').length
    const falha = results.filter(r => r.status === 'rejected').length

    if (falha === 0) {
      toast.success(`${sucesso} convite(s) reenviado(s) com sucesso!`, { id: toastId })
      onClose()
    } else if (sucesso === 0) {
      toast.error(`Falha ao reenviar ${falha} convite(s).`, { id: toastId })
    } else {
      toast.warning(`${sucesso} convite(s) reenviado(s), mas ${falha} falharam.`, { id: toastId })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-4xl w-[900px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Fixo */}
        <div className="p-4 px-6 border-b border-border/50 bg-background/50 backdrop-blur-md shrink-0 flex items-center justify-between rounded-t-xl z-20">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {isAberta ? 'Representantes Convidados' : 'Convidar Empresas'}
            </h2>
            <div className="text-[13px] text-muted-foreground/80 flex items-center gap-1.5 font-medium">
              {!isAberta ? (
                <>
                  <span className="bg-primary/10 text-primary px-2 rounded-sm">{totalSelecionados}</span>
                  {totalSelecionados === 1 ? 'selecionada' : 'selecionadas'}
                </>
              ) : (
                <>
                  <span className="bg-muted px-2 rounded-sm text-foreground">{totalConvidados}</span>
                  {totalConvidados === 1 ? 'empresa' : 'empresas'} na cotação
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Busca */}
        <div className="px-4 py-3 shrink-0 bg-background/30 backdrop-blur-sm z-10 flex gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar empresa ou representante..."
              className="w-full pl-10 pr-4 py-2 text-[13px] bg-muted/40 border border-transparent rounded-xl outline-none text-foreground placeholder:text-muted-foreground focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Lista de Representantes - Altura para ~4 itens e scroll no 5º */}
        <div className="overflow-y-auto min-h-0 max-h-[490px] bg-transparent p-4 pt-1 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/60 transition-colors">
          <ul className="m-0 space-y-2.5 pr-2">
            {filtrados.map((e) => {
              const conviteStatus = e.part?.conviteStatus
              const classeConvite = conviteStatus === 'ENVIADO'
                ? 'bg-success/10 text-success-foreground border-success/30'
                : conviteStatus === 'FALHOU'
                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                  : 'bg-muted text-muted-foreground border-transparent'

              return (
                <li
                  key={e.id}
                  onClick={() => {
                    if (!isAberta) onToggle(e.id)
                  }}
                  className={`
                    group flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-all shadow-sm
                    ${!isAberta ? 'cursor-pointer hover:bg-muted/50' : 'bg-background'}
                    ${e.isChecked && !isAberta ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' : 'border-border/60'}
                    ${e.isChecked && isAberta ? 'border-success/30 bg-success/5' : ''}
                  `}
                >

                  {/* Container Esquerdo (Checkbox, Nome, Representante) */}
                  <div className="flex items-center gap-4 min-w-[12rem] flex-1">
                    {/* Status Checkbox */}
                    {(!isAberta || emAberta) && (
                      <div className="shrink-0 flex items-center justify-center">
                        <input
                          type="checkbox"
                          aria-label={e.part ? `Desconvidar ${e.nome}` : `Convidar ${e.nome}`}
                          className={`size-5 accent-primary cursor-pointer border-muted-foreground/30 rounded ${!isAberta ? 'pointer-events-none' : ''}`}
                          checked={e.isChecked}
                          readOnly={!isAberta}
                          onClick={isAberta ? (ev) => ev.stopPropagation() : undefined}
                          onChange={isAberta ? () => {
                            if (emAberta) {
                              if (e.part) {
                                setAlvoDesconvidar({ participanteId: e.part.participanteId, nome: e.nome, status: e.part.participanteStatus })
                              } else {
                                convidar.mutateAsync([e.id]).then(() => toast.success('Empresa convidada com sucesso!')).catch(() => toast.error('Erro ao convidar empresa'))
                              }
                            }
                          } : undefined}
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className={`text-base uppercase ${e.isChecked ? 'font-bold text-foreground' : 'font-bold text-foreground/80'} truncate transition-colors`}>
                        {e.nome}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm text-muted-foreground truncate">
                          {e.part?.representanteNome || e.repNome || 'Representante'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Container Direito (Status, Reabrir/Fechar, Botões de Contato) */}
                  <div className="shrink-0 flex flex-wrap items-center gap-4">
                    {/* Status e Ações Próprias da Cotação Aberta */}
                    {isAberta && e.part && (
                      <div className="flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                        <span
                          title={e.part.conviteStatus === 'FALHOU' ? 'Falha no envio' : undefined}
                          className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border ${e.part.participanteStatus === 'CONVIDADO' ? classeConvite : CLASSE_STATUS_RESPOSTA[e.part.participanteStatus]
                            }`}
                        >
                          {e.part.participanteStatus === 'CONVIDADO' ? (e.part.conviteStatus === 'ENVIADO' ? 'Enviado' : 'Pendente') : ROTULO_STATUS_RESPOSTA[e.part.participanteStatus]}
                        </span>

                        {podeGerenciarResposta && (
                          e.part.participanteStatus === 'RESPONDIDO' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={reabrir.isPending}
                              // Tamanho fixo de 135px para evitar pulos no layout
                              className="h-8 text-xs px-3 rounded-full w-[135px] flex items-center justify-center transition-all"
                              onClick={async () => {
                                try {
                                  await reabrir.mutateAsync(e.part!.participanteId)
                                  toast.success('Resposta reaberta.')
                                } catch {
                                  toast.error('Erro ao reabrir participante')
                                }
                              }}
                            >
                              <RotateCcw className="size-3 mr-1.5" /> Reabrir
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={finalizar.isPending}
                              // Tamanho fixo de 135px para evitar pulos no layout
                              className="h-8 text-xs px-3 rounded-full w-[135px] flex items-center justify-center transition-all"
                              onClick={async () => {
                                try {
                                  await finalizar.mutateAsync(e.part!.participanteId)
                                  toast.success('Resposta finalizada em nome do participante.')
                                } catch {
                                  toast.error('Erro ao finalizar participante')
                                }
                              }}
                            >
                              <CheckCircle2 className="size-3 mr-1.5" /> Fechar cotação
                            </Button>
                          )
                        )}
                      </div>
                    )}

                    {/* Botões de Ação de Contato (Fora de cotação aberta) */}
                    {!isAberta && (e.repEmail || e.repWhatsapp) && (
                      <div className="flex items-center gap-2 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                        {e.repEmail && (
                          <a
                            href={urlMailto(
                              `Olá ${e.part?.representanteNome || e.repNome || 'Representante'}, aqui está o link da cotação.${e.part?.linkMagico ? ` Acesse: ${e.part.linkMagico}` : ''}`,
                              'Cotação — link de acesso',
                              e.repEmail,
                            )}
                            title={e.repEmail}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <Mail className="size-5" />
                          </a>
                        )}
                        {e.repWhatsapp && (
                          <button
                            type="button"
                            title={aplicarMascaraTelefone(e.repWhatsapp)}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              navigator.clipboard.writeText(aplicarMascaraTelefone(e.repWhatsapp!))
                              toast.success('Telefone copiado!')
                            }}
                          >
                            <Phone className="size-5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Botão Convidar Genérico */}
                    {isAberta && !emAberta && !e.part && (
                      <div className="flex items-center ml-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={convidar.isPending}
                          className="h-8 text-[12px] px-3 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                          onClick={async (ev) => {
                            ev.stopPropagation()
                            try {
                              await convidar.mutateAsync([e.id])
                              toast.success('Empresa convidada com sucesso!')
                            } catch {
                              toast.error('Erro ao convidar empresa')
                            }
                          }}
                        >
                          Convidar
                        </Button>
                      </div>
                    )}

                    {/* Ações Diretas na Linha (E-mail, WhatsApp, Copiar) */}
                    {isAberta && e.part && (
                      <div className="flex flex-row items-center gap-1.5 ml-2 text-muted-foreground/60 border-l border-border/50 pl-4">
                        <Tooltip content="Reenviar convite">
                          <button
                            type="button"
                            title="Reenviar convite"
                            disabled={loadingMailId === e.id}
                            className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={async (ev) => {
                              ev.stopPropagation()
                              setLoadingMailId(e.id)
                              try {
                                await reenviar.mutateAsync(e.part!.participanteId)
                                toast.success(`E-mail reenviado para ${e.nome}`)
                              } catch {
                                toast.error(`Falha ao reenviar e-mail para ${e.nome}`)
                              } finally {
                                setLoadingMailId(null)
                              }
                            }}
                          >
                            {loadingMailId === e.id ? <Loader2 className="size-5 animate-spin" /> : <Mail className="size-5" />}
                          </button>
                        </Tooltip>
                        {e.part.whatsappRepresentante && (
                          <Tooltip content="Enviar por WhatsApp">
                            <button
                              type="button"
                              title="Enviar por WhatsApp"
                              className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                const link = e.part!.linkMagico
                                const msg = `Olá ${e.part!.representanteNome || e.repNome || 'Representante'}, aqui está o link da cotação. Acesse: ${link}`
                                const url = urlWhatsApp(msg, e.part!.whatsappRepresentante)
                                window.open(url, '_blank')
                              }}
                            >
                              <MessageCircle className="size-5" />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip content="Copiar link">
                          <button
                            type="button"
                            title="Copiar link"
                            className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              navigator.clipboard.writeText(e.part!.linkMagico)
                              toast.success('Link copiado com sucesso!')
                            }}
                          >
                            <Copy className="size-5" />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}

            {filtrados.length === 0 && (
              <div className="py-12 text-center text-[13px] text-muted-foreground">
                Nenhuma empresa encontrada.
              </div>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-border/50 bg-background/50 backdrop-blur-md shrink-0 rounded-b-xl z-20">
          {isAberta ? (
            naoEnviadoCount > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">
                  <strong className="text-foreground">{naoEnviadoCount}</strong> {naoEnviadoCount === 1 ? 'convite pendente' : 'convites pendentes'}
                </span>
                <Button disabled={isEnviando} onClick={handleDispararTodosEmail} className="h-9 px-4 text-[13px] rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all">
                  {isEnviando ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  {isEnviando ? 'Enviando...' : 'Enviar Restantes'}
                </Button>
              </div>
            ) : (
              <div className="text-[13px] text-success-foreground font-medium py-1.5 flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Todos os convites foram enviados.
              </div>
            )
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground/80">
                <Info className="size-4 text-muted-foreground/50 shrink-0" />
                <span>Os convites serão disparados ao clicar em <strong className="text-foreground/90 font-medium">Abrir Cotação</strong>.</span>
              </div>
              <Button onClick={onClose} variant="default" className="h-9 px-6 rounded-full text-[13px] font-medium shadow-sm hover:shadow transition-all">
                Pronto
              </Button>
            </div>
          )}
        </div>
      </div>

      {alvoDesconvidar && (
        <ConfirmarDialog
          titulo={`Desconvidar ${alvoDesconvidar.nome}?`}
          descricao={alvoDesconvidar.status === 'RESPONDIDO'
            ? "A empresa perderá o acesso ao link e os preços já informados não terão validade nesta cotação. Esta ação não pode ser desfeita."
            : "A empresa perderá o acesso ao link e os preços já informados serão apagados. Esta ação não pode ser desfeita."}
          rotuloConfirmar="Desconvidar"
          pendente={desconvidar.isPending}
          onCancelar={() => setAlvoDesconvidar(null)}
          onConfirmar={async () => {
            try {
              await desconvidar.mutateAsync(alvoDesconvidar.participanteId)
              toast.success('Representante desconvidado.')
            } catch (e) {
              if (e instanceof SessaoExpiradaError) return
              toast.error(e instanceof ApiError ? e.message : 'Erro ao desconvidar representante')
            } finally {
              setAlvoDesconvidar(null)
            }
          }}
        />
      )}
    </Dialog>
  )
}