import { useMemo, useState } from 'react'
import { Pencil, PlusCircle, UserX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { RepresentanteForm } from './RepresentanteForm'
import { useInativarRepresentante, useRepresentantes } from './representantes.api'
import type { Representante } from './representantes.schema'

export function RepresentantesPage() {
  const { data: representantes, isLoading, error } = useRepresentantes()
  const { data: empresas } = useEmpresas({ incluirInativos: true })
  const inativar = useInativarRepresentante()

  const [form, setForm] = useState<{ modo: 'criar' } | { modo: 'editar'; rep: Representante } | null>(
    null,
  )
  const [confirmar, setConfirmar] = useState<Representante | null>(null)

  const nomePorEmpresa = useMemo(
    () => new Map((empresas ?? []).map((e) => [e.id, e.nome])),
    [empresas],
  )

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando representantes…</p>
  if (error)
    return <p className="p-6 text-destructive">Erro ao carregar representantes: {error.message}</p>

  const lista = representantes ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Representantes</h1>
          <p className="text-sm text-muted-foreground">
            Contatos que respondem as cotações pelas empresas.
          </p>
        </div>
        <Button onClick={() => setForm({ modo: 'criar' })}>
          <PlusCircle className="mr-2 size-4" />
          Novo representante
        </Button>
      </div>

      <Dialog
        open={form !== null}
        onClose={() => setForm(null)}
        size="lg"
        ariaLabel={form?.modo === 'editar' ? 'Editar representante' : 'Novo representante'}
      >
        {form?.modo === 'editar' ? (
          <RepresentanteForm
            aoSalvar={() => setForm(null)}
            representanteParaEditar={form.rep}
            empresaNomeAtual={nomePorEmpresa.get(form.rep.empresaId)}
          />
        ) : (
          <RepresentanteForm aoSalvar={() => setForm(null)} />
        )}
      </Dialog>

      <Dialog
        open={confirmar !== null}
        onClose={() => setConfirmar(null)}
        title="Inativar representante"
      >
        <p className="text-sm text-muted-foreground">
          {confirmar?.nome} deixará de aparecer para novas cotações. Não há como reativar pela tela.
        </p>
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="ghost" onClick={() => setConfirmar(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={inativar.isPending}
            onClick={() => {
              if (!confirmar) return
              inativar.mutate(confirmar.id, { onSettled: () => setConfirmar(null) })
            }}
          >
            {inativar.isPending ? 'Inativando…' : 'Inativar'}
          </Button>
        </div>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!lista.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum representante cadastrado.
                  </td>
                </tr>
              ) : (
                lista.map((r) => (
                  <tr
                    key={r.id}
                    className={`transition-colors hover:bg-muted/50 ${r.ativo ? '' : 'opacity-60 bg-muted/10'}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {r.nome}
                      {!r.ativo && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {r.whatsapp ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {nomePorEmpresa.get(r.empresaId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          icon={Pencil}
                          label="Editar"
                          onClick={() => setForm({ modo: 'editar', rep: r })}
                        />
                        {r.ativo && (
                          <IconButton
                            icon={UserX}
                            label="Inativar"
                            onClick={() => setConfirmar(r)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
