import { useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { ConfirmarDialog } from '../cotacoes/ConfirmarDialog'
import { useEmpresas, useInativarEmpresa, useAtivarEmpresa, useExcluirEmpresa } from './empresas.api'
import { useRepresentantes } from '../representantes/representantes.api'
import { EmpresaForm } from './EmpresaForm'
import type { Empresa } from './empresas.schema'
import type { Representante } from '../representantes/representantes.schema'

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas({ incluirInativos: true })
  const { data: representantes } = useRepresentantes()
  const inativar = useInativarEmpresa()
  const ativar = useAtivarEmpresa()
  const excluir = useExcluirEmpresa()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | undefined>(undefined)
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null)

  const representantePorEmpresa = useMemo(
    () => new Map((representantes ?? []).map((r) => [r.empresaId, r] as const)),
    [representantes],
  )

  // Ativas primeiro — inativa não compete por atenção no meio da lista.
  const empresasOrdenadas = useMemo(
    () => [...(empresas ?? [])].sort((a, b) => Number(b.ativo) - Number(a.ativo)),
    [empresas],
  )

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando fornecedores…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar fornecedores: {error.message}</p>

  function abrirNovo() {
    setEmpresaEditando(undefined)
    setMostrarForm(true)
  }

  function abrirEditar(empresa: Empresa) {
    setEmpresaEditando(empresa)
    setMostrarForm(true)
  }

  function fecharForm() {
    setMostrarForm(false)
    setEmpresaEditando(undefined)
  }

  async function confirmarExclusao() {
    if (!empresaParaExcluir) return
    try {
      await excluir.mutateAsync(empresaParaExcluir.id)
      toast.success('Empresa excluída.')
      setEmpresaParaExcluir(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(e instanceof ApiError ? e.message : 'Erro ao excluir a empresa.')
    }
  }

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores (Empresas)</h1>
          <p className="text-sm text-muted-foreground">Gerencie as empresas e seus respectivos representantes.</p>
        </div>
        <Button onClick={abrirNovo}>
          <PlusCircle className="mr-2 size-4" />
          Nova Empresa
        </Button>
      </div>

      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={empresaEditando ? 'Editar empresa' : 'Nova empresa'}
      >
        <EmpresaForm
          aoSalvar={fecharForm}
          empresaParaEditar={empresaEditando}
          representanteParaEditar={
            empresaEditando ? representantePorEmpresa.get(empresaEditando.id) : undefined
          }
        />
      </Dialog>

      {empresaParaExcluir && (
        <ConfirmarDialog
          titulo="Excluir empresa"
          descricao={`Excluir definitivamente "${empresaParaExcluir.nome}"? Esta ação é irreversível e não pode ser desfeita.`}
          rotuloConfirmar="Excluir"
          pendente={excluir.isPending}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setEmpresaParaExcluir(null)}
        />
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Representante</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!empresas?.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum fornecedor cadastrado.
                  </td>
                </tr>
              ) : (
                empresasOrdenadas.map((empresa) => {
                  const rep: Representante | undefined = representantePorEmpresa.get(empresa.id)
                  return (
                    <tr
                      key={empresa.id}
                      className={`transition-colors hover:bg-muted/50 ${empresa.ativo ? '' : 'opacity-60 bg-muted/10'}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {empresa.nome}
                        {!empresa.ativo && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Inativa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {rep ? (
                          <div>
                            <div className="font-medium text-foreground">{rep.nome}</div>
                            <div className="text-xs text-muted-foreground">{rep.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">sem representante</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {empresa.ativo ? (
                            <>
                              <IconButton
                                icon={Pencil}
                                label="Editar"
                                onClick={() => abrirEditar(empresa)}
                              />
                              <IconButton
                                icon={EyeOff}
                                label="Inativar"
                                onClick={() => inativar.mutate(empresa.id)}
                                disabled={inativar.isPending}
                              />
                            </>
                          ) : (
                            <IconButton
                              icon={Eye}
                              label="Ativar"
                              onClick={() => ativar.mutate(empresa.id)}
                              disabled={ativar.isPending}
                            />
                          )}
                          {empresa.podeExcluir ? (
                            <IconButton
                              icon={Trash2}
                              label="Excluir"
                              tone="destructive"
                              onClick={() => setEmpresaParaExcluir(empresa)}
                            />
                          ) : (
                            <Tooltip content="Não é possível excluir: a empresa já participou de uma cotação. Use Inativar.">
                              <IconButton
                                icon={Trash2}
                                label="Excluir"
                                tone="destructive"
                                disabled
                                onClick={() => setEmpresaParaExcluir(empresa)}
                              />
                            </Tooltip>
                          )}
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
    </PageContainer>
  )
}
