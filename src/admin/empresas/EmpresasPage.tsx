import { useMemo, useState } from 'react'
import { Eye, EyeSlash, Pencil, PlusCircle, Trash, UserMinus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie, Selo, ChipsFiltro, type OpcaoChip } from '@/shared/ui'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { ConfirmarDialog } from '../cotacoes/ConfirmarDialog'
import { useEmpresas, useInativarEmpresa, useAtivarEmpresa, useExcluirEmpresa } from './empresas.api'
import { useRepresentantes, useExcluirRepresentante } from '../representantes/representantes.api'
import { EmpresaForm } from './EmpresaForm'
import type { Empresa } from './empresas.schema'
import type { Representante } from '../representantes/representantes.schema'

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas({ incluirInativos: true })
  const { data: representantes } = useRepresentantes()
  const inativar = useInativarEmpresa()
  const ativar = useAtivarEmpresa()
  const excluir = useExcluirEmpresa()
  const excluirRepresentante = useExcluirRepresentante()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | undefined>(undefined)
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null)
  const [representanteParaExcluir, setRepresentanteParaExcluir] = useState<Representante | null>(null)
  const [filtro, setFiltro] = useState('todos')

  const representantePorEmpresa = useMemo(
    () => new Map((representantes ?? []).map((r) => [r.empresaId, r] as const)),
    [representantes],
  )

  // Ativas primeiro — inativa não compete por atenção no meio da lista.
  const empresasOrdenadas = useMemo(
    () =>
      [...(empresas ?? [])]
        .filter((e) => filtro === 'todos' || (filtro === 'ativos' ? e.ativo : !e.ativo))
        .sort((a, b) => Number(b.ativo) - Number(a.ativo)),
    [empresas, filtro],
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

  async function confirmarExclusaoRepresentante() {
    if (!representanteParaExcluir) return
    try {
      const { resultado } = await excluirRepresentante.mutateAsync(representanteParaExcluir.id)
      if (resultado === 'REMOVIDO') {
        toast.success('Contato removido.')
      } else {
        toast.success('Dados do contato anonimizados; o histórico foi mantido.')
      }
      setRepresentanteParaExcluir(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(e instanceof ApiError ? e.message : 'Erro ao excluir o contato.')
    }
  }

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <CabecalhoPagina titulo="Fornecedores (Empresas)" subtitulo="Gerencie as empresas e seus respectivos representantes." acao={<Button onClick={abrirNovo}>
          <PlusCircle className="mr-2 size-4" />
          Nova Empresa
        </Button>} />

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

      {representanteParaExcluir && (
        <ConfirmarDialog
          titulo="Excluir contato"
          descricao={`Excluir o contato "${representanteParaExcluir.nome}"? Se ele nunca participou de uma cotação, os dados serão apagados e a empresa ficará sem contato. Se já participou, os dados pessoais (nome, e-mail e WhatsApp) serão anonimizados e o histórico de cotações será preservado.`}
          rotuloConfirmar="Excluir"
          pendente={excluirRepresentante.isPending}
          onConfirmar={confirmarExclusaoRepresentante}
          onCancelar={() => setRepresentanteParaExcluir(null)}
        />
      )}

      <Superficie>
        <ChipsFiltro opcoes={FILTROS} valor={filtro} aoTrocar={setFiltro} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-white/[0.03] border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              <tr className="text-left text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                <th className="px-4 py-3 font-medium ui-uppercase">Nome</th>
                <th className="px-4 py-3 font-medium ui-uppercase">Representante</th>
                <th className="px-4 py-3 font-medium ui-uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              {!empresas?.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
                    Nenhum fornecedor cadastrado.
                  </td>
                </tr>
              ) : (
                empresasOrdenadas.map((empresa) => {
                  const rep: Representante | undefined = representantePorEmpresa.get(empresa.id)
                  return (
                    <tr
                      key={empresa.id}
                      className={`transition-colors hover:bg-white/[0.03] ${empresa.ativo ? '' : 'opacity-60'}`}
                    >
                      <td className="px-4 py-3 font-medium ui-uppercase text-[var(--pnl-txt,#fff)]">
                        {empresa.nome}
                        {!empresa.ativo && (
                          <Selo tom="neutro" className="ml-2">
                            Inativa
                          </Selo>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                        {rep ? (
                          <div>
                            <div className="font-medium text-[var(--pnl-txt,#fff)]">{rep.nome}</div>
                            <div className="text-xs text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{rep.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">sem representante</span>
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
                                icon={EyeSlash}
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
                          {rep && (
                            <IconButton
                              icon={UserMinus}
                              label="Excluir contato"
                              tone="destructive"
                              onClick={() => setRepresentanteParaExcluir(rep)}
                            />
                          )}
                          {empresa.podeExcluir ? (
                            <IconButton
                              icon={Trash}
                              label="Excluir"
                              tone="destructive"
                              onClick={() => setEmpresaParaExcluir(empresa)}
                            />
                          ) : (
                            <Tooltip content="Não é possível excluir: a empresa já participou de uma cotação. Use Inativar.">
                              <IconButton
                                icon={Trash}
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
      </Superficie>
    </PageContainer>
  )
}
