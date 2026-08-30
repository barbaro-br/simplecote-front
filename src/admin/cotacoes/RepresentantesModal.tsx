import { useState, useMemo, useRef, useEffect } from 'react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { useRepresentantes } from '@/admin/representantes/representantes.api'
import { useParticipantes } from './cotacoes.api'
import { Send, Copy, Check, Mail, Phone, Search, X, Info } from 'lucide-react'
import { urlWhatsApp } from './compartilhar-link'
import { toast } from 'sonner'

type Props = {
  cotacaoId: string
  status: string
  open: boolean
  onClose: () => void
  selecionadas: string[]
  onToggle: (empresaId: string) => void
}

export function RepresentantesModal({ cotacaoId, status, open, onClose, selecionadas, onToggle }: Props) {
  const participantes = useParticipantes(cotacaoId)
  const { data: empresas } = useEmpresas()
  const { data: reps } = useRepresentantes()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | 'enviado' | 'nao_enviado'>('todos')
  const searchRef = useRef<HTMLInputElement>(null)

  const isAberta = status !== 'RASCUNHO'

  // Reset state on open
  useEffect(() => {
    if (open) {
      setSearch('')
      setFilter('todos')
      // setTimeout(() => searchRef.current?.focus(), 60)
    }
  }, [open])

  const partsMap = useMemo(() => {
    const map = new Map()
    for (const p of participantes.data ?? []) {
      map.set(p.empresaId, p)
    }
    return map
  }, [participantes.data])

  const lista = useMemo(() => {
    return (empresas ?? []).map(e => {
      const part = partsMap.get(e.id)
      const rep = (reps ?? []).find(r => r.empresaId === e.id)
      const isChecked = part !== undefined || selecionadas.includes(e.id)
      return {
        ...e,
        part,
        isChecked,
        repNome: rep?.nome,
        repEmail: rep?.email,
        repWhatsapp: rep?.whatsapp
      }
    })
  }, [empresas, partsMap, selecionadas, reps])

  const filtrados = useMemo(() => {
    let result = lista.filter(e => {
      const s = search.toLowerCase()
      const matchSearch = e.nome.toLowerCase().includes(s) || 
                          (e.repNome || '').toLowerCase().includes(s)
      if (!matchSearch) return false

      if (isAberta && filter !== 'todos') {
        if (!e.part) return false
        const isEnviado = e.part.conviteStatus === 'ENVIADO'
        if (filter === 'enviado') return isEnviado
        if (filter === 'nao_enviado') return !isEnviado
      }
      
      // Se está aberta, independente de filtro, exibe só os convidados (part !== undefined)
      // Wait, in Figma, when opened it still shows only those selected/invited.
      if (isAberta && e.part === undefined) return false

      return true
    })

    return result.sort((a, b) => {
      if (!isAberta) {
        if (a.isChecked && !b.isChecked) return -1
        if (!a.isChecked && b.isChecked) return 1
      }
      return a.nome.localeCompare(b.nome)
    })
  }, [lista, isAberta, search, filter])

  // Contadores para o UI
  const totalConvidados = participantes.data?.length ?? 0
  const enviadoCount = participantes.data?.filter(p => p.conviteStatus === 'ENVIADO').length ?? 0
  const naoEnviadoCount = totalConvidados - enviadoCount


  const copiarLink = (e: any) => {
    const link = `https://app.simplecote.com/responder/${e.part!.id}` // mock de link
    navigator.clipboard.writeText(link)
    setCopiedId(e.id)
    toast.success("Link copiado para a área de transferência")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDispararTodosEmail = () => {
    toast.success('Envio de e-mails em lote iniciado (Simulação)')
  }

  const qtdSelecionadas = selecionadas.length + (participantes.data?.length ?? 0)

  return (
    <Dialog open={open} onClose={onClose} size="lg" ariaLabel="Representantes">
      <div className="flex flex-col h-[70vh] max-h-[600px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border shrink-0">
          <div>
            <div className="text-[15px] font-semibold text-foreground">Representantes</div>
            <div className="text-xs text-muted-foreground mt-[1px]">
              {qtdSelecionadas === 0
                ? 'Nenhum marcado para convite'
                : `${qtdSelecionadas} marcado${qtdSelecionadas !== 1 ? 's' : ''} para convite`}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        {/* Filter chips (Apenas se já aberta) */}
        {isAberta && (
          <div className="px-6 py-2.5 border-b border-muted flex gap-1.5 shrink-0">
            {(['todos', 'enviado', 'nao_enviado'] as const).map(f => {
              const count = f === 'todos' ? totalConvidados : f === 'enviado' ? enviadoCount : naoEnviadoCount
              const isSel = filter === f
              const label = f === 'todos' ? 'Todos' : f === 'enviado' ? 'Enviado' : 'Não enviado'
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors border-[1.5px] ${
                    isSel 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${count === 0 ? 'opacity-50' : 'opacity-100'}`}
                >
                  {label}
                  <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-primary-foreground ${isSel ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-muted shrink-0">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
              <Search className="size-4" />
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar empresa ou representante..."
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-border rounded-md outline-none text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 bg-background/50">
          <ul className="m-0 p-0 list-none">
            {filtrados.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-[13px]">
                Nenhuma empresa encontrada.
              </div>
            ) : filtrados.map((e, idx) => {
              const enviado = e.part?.conviteStatus === 'ENVIADO'
              
              return (
                <li
                  key={e.id}
                  className={`flex items-center gap-3 px-5 py-2.5 border-b border-muted transition-colors cursor-pointer ${
                    e.isChecked ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  }`}
                  onClick={() => {
                    if (e.part === undefined) onToggle(e.id)
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={e.isChecked}
                    disabled={e.part !== undefined}
                    onChange={() => {
                      if (e.part === undefined) onToggle(e.id)
                    }}
                    onClick={ev => ev.stopPropagation()}
                    className="w-[15px] h-[15px] shrink-0 cursor-pointer accent-primary"
                  />

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold tracking-wide transition-colors ${
                    e.isChecked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {e.nome.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] ${e.isChecked ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                      {e.nome}
                    </div>
                    <div className="flex items-center gap-1.5 mt-[1px]">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {e.part?.representanteNome || e.repNome || 'Representante'}
                      </span>
                    </div>
                  </div>

                  {/* Icons E-mail / WhatsApp */}
                  {!isAberta && (e.repEmail || e.repWhatsapp) && (
                    <div className="flex items-center gap-2 shrink-0 text-muted-foreground/50 mr-2">
                      {e.repEmail && <span title="Possui E-mail"><Mail className="size-3.5" /></span>}
                      {e.repWhatsapp && <span title="Possui WhatsApp"><Phone className="size-3.5" /></span>}
                    </div>
                  )}

                  {/* Status Badge (apenas se aberta) */}
                  {isAberta && e.isChecked && (
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      enviado ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                    }`}>
                      {enviado ? 'Enviado' : 'Não enviado'}
                    </span>
                  )}

                  {/* Ações quando Aberta */}
                  {isAberta && e.part && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Enviar por WhatsApp"
                        className="h-7 w-7 text-muted-foreground hover:bg-muted"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          const link = `https://app.simplecote.com/responder/${e.part!.id}`
                          const msg = `Olá ${e.part!.representanteNome || e.repNome || 'Representante'}, aqui está o link da cotação. Acesse: ${link}`
                          const url = urlWhatsApp(msg, e.part!.whatsappRepresentante)
                          window.open(url, '_blank')
                        }}
                      >
                        <Send className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Copiar Link"
                        className="h-7 w-7 text-muted-foreground hover:bg-muted"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          copiarLink(e)
                        }}
                      >
                        {copiedId === e.id ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-border bg-muted/20 shrink-0">
          {isAberta ? (
            naoEnviadoCount > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{naoEnviadoCount}</strong> {naoEnviadoCount === 1 ? 'convite não enviado' : 'convites não enviados'}
                </span>
                <Button onClick={handleDispararTodosEmail} className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Send className="size-3.5" />
                  Enviar para todos
                </Button>
              </div>
            ) : (
              <div className="text-xs text-green-600 font-medium py-1">
                ✓ Todos os convites foram enviados.
              </div>
            )
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="size-4 text-muted-foreground/60 shrink-0" />
                <span>Os convites serão disparados automaticamente ao clicar em <strong className="text-foreground">Abrir</strong>.</span>
              </div>
              <Button onClick={onClose} variant="default" className="h-8 text-xs px-4">
                Pronto
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
