import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import type { ParticipanteStatus } from '@/shared/domain/tipos-base'
import type { ConviteStatus } from './cotacoes.schema'
import { useConvidarEmpresas, useParticipantes, useReenviarConvite } from './cotacoes.api'

const ROTULO_PARTICIPANTE: Record<ParticipanteStatus, string> = {
  CONVIDADO: 'Convidado',
  VISUALIZOU: 'Visualizou',
  RESPONDIDO: 'Respondeu',
}

function rotuloConvite(status: ConviteStatus | null): string {
  if (status === 'ENVIADO') return 'convite enviado'
  if (status === 'FALHOU') return 'falha no envio'
  return 'convite não enviado'
}

type Props = {
  cotacaoId: string
  /** Convidar só é permitido em RASCUNHO (o backend rejeita fora disso). */
  podeConvidar: boolean
}

export function ParticipantesSection({ cotacaoId, podeConvidar }: Props) {
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
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Participantes</h2>

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

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Representante</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
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
              participantes.data.map((p) => (
                <tr key={p.participanteId}>
                  <td className="px-4 py-2">{p.empresaNome}</td>
                  <td className="px-4 py-2">{p.representanteNome}</td>
                  <td className="px-4 py-2">
                    {ROTULO_PARTICIPANTE[p.participanteStatus]}{' '}
                    <span className="text-muted-foreground">· {rotuloConvite(p.conviteStatus)}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reenviar.mutate(p.participanteId)}
                        disabled={reenviar.isPending}
                      >
                        Reenviar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiarLink(p.linkMagico, p.participanteId)}
                      >
                        {copiado === p.participanteId ? 'Copiado!' : 'Copiar link'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
