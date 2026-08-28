import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useEmpresas, useInativarEmpresa } from './empresas.api'
import { EmpresaForm } from './EmpresaForm'
import type { Empresa } from './empresas.schema'

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas()
  const inativar = useInativarEmpresa()
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
        <Button onClick={mostrarForm ? fecharForm : abrirNovo}>
          {mostrarForm ? 'Ocultar' : 'Nova Empresa'}
        </Button>
      </div>

      {mostrarForm && (
        <EmpresaForm 
          aoSalvar={fecharForm} 
          empresaParaEditar={empresaEditando} 
        />
      )}

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
                <tr key={empresa.id} className={empresa.ativo ? 'hover:bg-muted/30' : 'opacity-50'}>
                  <td className="px-4 py-3">
                    {empresa.nome} {empresa.ativo ? '' : '(Inativa)'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {empresa.ativo && (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => abrirEditar(empresa)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => inativar.mutate(empresa.id)}
                          disabled={inativar.isPending}
                        >
                          Inativar
                        </Button>
                      </div>
                    )}
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
