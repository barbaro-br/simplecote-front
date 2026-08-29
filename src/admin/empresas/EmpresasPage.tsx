import { useState } from 'react'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { useEmpresas, useInativarEmpresa, useAtivarEmpresa } from './empresas.api'
import { EmpresaForm } from './EmpresaForm'
import type { Empresa } from './empresas.schema'

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas({ incluirInativos: true })
  const inativar = useInativarEmpresa()
  const ativar = useAtivarEmpresa()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | undefined>(undefined)

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fornecedores (Empresas)</h1>
        <Button onClick={abrirNovo}>Nova Empresa</Button>
      </div>

      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={empresaEditando ? 'Editar empresa' : 'Nova empresa'}
      >
        <EmpresaForm aoSalvar={fecharForm} empresaParaEditar={empresaEditando} />
      </Dialog>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!empresas?.length ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum fornecedor cadastrado.
                </td>
              </tr>
            ) : (
              empresas.map((empresa) => (
                <tr
                  key={empresa.id}
                  className={`transition-colors hover:bg-muted/40 ${empresa.ativo ? '' : 'opacity-50 text-muted-foreground'}`}
                >
                  <td className="px-4 py-3">
                    {empresa.nome} {empresa.ativo ? '' : '(Inativa)'}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
