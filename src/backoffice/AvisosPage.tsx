import { useState } from 'react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { dataHoraBr } from '@/shared/format/formatters'
import { NIVEIS_AVISO, type NivelAviso } from '@/avisos/avisos.schema'
import { useAlternarAviso, useAvisosAdmin, useCriarAviso, useRemoverAviso } from './avisos.api'

const CLASSE_NIVEL: Record<NivelAviso, string> = {
  INFO: 'bg-primary/10 text-primary',
  ATENCAO: 'bg-warning/10 text-warning',
  CRITICO: 'bg-destructive/10 text-destructive',
}

const ROTULO_NIVEL: Record<NivelAviso, string> = {
  INFO: 'Info',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
}

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

function mensagemDeErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

export function AvisosPage() {
  const { data: avisos, isLoading, error } = useAvisosAdmin()
  const criar = useCriarAviso()
  const alternar = useAlternarAviso()
  const remover = useRemoverAviso()

  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [nivel, setNivel] = useState<NivelAviso>('INFO')
  const [expiraEm, setExpiraEm] = useState('')
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [avisoARemover, setAvisoARemover] = useState<string | null>(null)

  function enviar() {
    setErroForm(null)
    criar.mutate(
      { titulo, corpo, nivel, expiraEm: expiraEm ? new Date(`${expiraEm}T00:00:00Z`).toISOString() : null },
      {
        onSuccess: () => {
          setTitulo('')
          setCorpo('')
          setNivel('INFO')
          setExpiraEm('')
        },
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          setErroForm(mensagemDeErro(e))
        },
      },
    )
  }

  function confirmarRemover() {
    if (!avisoARemover) return
    remover.mutate(avisoARemover, {
      onSuccess: () => setAvisoARemover(null),
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        toast.error(mensagemDeErro(e))
      },
    })
  }

  return (
    <PageContainer maxWidth="full" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Avisos</h1>
        <p className="text-sm text-muted-foreground">Avisos exibidos no painel das lojas.</p>
      </div>

      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-semibold ui-uppercase">Novo aviso</h2>

        {erroForm && (
          <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
            {erroForm}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aviso-titulo" className="text-sm font-medium ui-uppercase">
              Título
            </label>
            <Input id="aviso-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aviso-corpo" className="text-sm font-medium ui-uppercase">
              Corpo
            </label>
            <textarea
              id="aviso-corpo"
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="aviso-nivel" className="text-sm font-medium ui-uppercase">
              Nível
            </label>
            <select id="aviso-nivel" value={nivel} onChange={(e) => setNivel(e.target.value as NivelAviso)} className={inputCls}>
              {NIVEIS_AVISO.map((n) => (
                <option key={n} value={n}>
                  {ROTULO_NIVEL[n]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="aviso-expira" className="text-sm font-medium ui-uppercase">
              Expira em (opcional)
            </label>
            <Input id="aviso-expira" type="date" value={expiraEm} onChange={(e) => setExpiraEm(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={!titulo.trim() || !corpo.trim() || criar.isPending} onClick={enviar}>
            {criar.isPending ? 'Criando…' : 'Criar aviso'}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <p className="p-6 text-muted-foreground">Carregando avisos…</p>
      ) : error ? (
        <p className="p-6 text-destructive">Erro ao carregar avisos: {error.message}</p>
      ) : !avisos?.length ? (
        <p className="p-6 text-muted-foreground">Nenhum aviso cadastrado.</p>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium ui-uppercase">Título</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Nível</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Ativo</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Publicado em</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Expira em</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {avisos.map((aviso) => (
                  <tr key={aviso.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{aviso.titulo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CLASSE_NIVEL[aviso.nivel]}`}>
                        {ROTULO_NIVEL[aviso.nivel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Ativo"
                        checked={aviso.ativo}
                        disabled={alternar.isPending}
                        onChange={() => alternar.mutate({ id: aviso.id, ativo: !aviso.ativo })}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{dataHoraBr(aviso.publicadoEm)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{aviso.expiraEm ? dataHoraBr(aviso.expiraEm) : '—'}</td>
                    <td className="px-4 py-3">
                      {avisoARemover === aviso.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Remover aviso?</span>
                          <Button variant="ghost" size="sm" onClick={() => setAvisoARemover(null)}>
                            Cancelar
                          </Button>
                          <Button variant="destructive" size="sm" disabled={remover.isPending} onClick={confirmarRemover}>
                            Confirmar remoção
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setAvisoARemover(aviso.id)}>
                          Remover
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageContainer>
  )
}
