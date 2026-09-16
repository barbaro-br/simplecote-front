import { useMemo, useState } from 'react'
import {
  Buildings,
  CurrencyDollar,
  Eye,
  EyeSlash,
  Gear,
  MagnifyingGlass,
  Pencil,
  Plus,
  Trash,
  User,
  UserMinus,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Dialog } from '@/shared/components/ui/dialog'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Selo, type OpcaoChip } from '@/shared/ui'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { moeda } from '@/shared/format/formatters'
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

function normalizar(termo: string): string {
  return termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

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
  const [busca, setBusca] = useState('')

  const representantePorEmpresa = useMemo(
    () => new Map((representantes ?? []).map((r) => [r.empresaId, r] as const)),
    [representantes],
  )

  const palavras = normalizar(busca.trim()).split(/\s+/).filter(Boolean)

  // Ativas primeiro — inativa não compete por atenção no meio da lista.
  const empresasFiltradas = useMemo(() => {
    return [...(empresas ?? [])]
      .filter((e) => {
        if (filtro === 'ativos' && !e.ativo) return false
        if (filtro === 'inativos' && e.ativo) return false
        if (palavras.length === 0) return true

        const rep = representantePorEmpresa.get(e.id)
        const alvo = `${normalizar(e.nome)} ${rep ? `${normalizar(rep.nome)} ${normalizar(rep.email ?? '')}` : ''}`
        return palavras.every((p) => alvo.includes(p))
      })
      .sort((a, b) => Number(b.ativo) - Number(a.ativo))
  }, [empresas, filtro, palavras, representantePorEmpresa])

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-8 text-center text-on-surface-variant">
          <p className="text-sm">Carregando fornecedores…</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          <p className="text-sm font-semibold">Erro ao carregar fornecedores: {error.message}</p>
        </div>
      </PageContainer>
    )
  }

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
    <PageContainer maxWidth="5xl" className="space-y-4 text-on-surface">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Buildings className="size-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
                Fornecedores e empresas
              </h1>
              <span className="px-2 py-0.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {empresas?.length ?? 0}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Gerencie fornecedores, representantes e pedidos mínimos para cotação.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-none bg-primary hover:bg-primary/90 text-black font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(78,222,163,0.25)]"
        >
          <Plus className="size-4" weight="bold" />
          Nova empresa
        </button>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS (Soltos, com cantos quadrados) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-none bg-white/[0.03] border border-white/10 select-none overflow-x-auto max-w-full">
          {FILTROS.map((f) => {
            const ativo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={`px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  ativo
                    ? 'bg-primary text-black font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                {f.rotulo}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/50"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar fornecedor"
            placeholder="Buscar por empresa, contato ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-none border border-white/15 bg-black/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>
      </div>

      {/* 3. MODAL DE FORMULÁRIO (NOVA EMPRESA / EDITAR) */}
      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={empresaEditando ? 'Editar empresa' : 'Nova empresa'}
        className="p-0 bg-transparent border-0 shadow-none rounded-none"
      >
        <EmpresaForm
          aoSalvar={fecharForm}
          empresaParaEditar={empresaEditando}
          representanteParaEditar={
            empresaEditando ? representantePorEmpresa.get(empresaEditando.id) : undefined
          }
        />
      </Dialog>

      {/* 4. MODAIS DE CONFIRMAÇÃO */}
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

      {/* 5. PLANILHA DE FORNECEDORES (Sem bordas de coluna, cabeçalho no padrão cotações) */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-none border border-white/10 bg-[#111813]/60 shadow-inner">
        <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
            <tr>
              <th className="py-3 px-3.5 font-bold border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <Buildings className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Empresa</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <User className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Representante</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10 text-right w-36">
                <div className="flex items-center justify-end gap-1.5">
                  <CurrencyDollar className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Pedido mín.</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10 text-center w-28">
                <div className="flex items-center justify-center gap-1.5">
                  <Eye className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Status</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10 text-center w-[124px]">
                <div className="flex items-center justify-center gap-1.5">
                  <Gear className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Ações</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!empresas?.length ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhum fornecedor cadastrado.
                </td>
              </tr>
            ) : empresasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhuma empresa encontrada com os filtros atuais.
                </td>
              </tr>
            ) : (
              empresasFiltradas.map((empresa) => {
                const rep: Representante | undefined = representantePorEmpresa.get(empresa.id)
                return (
                  <tr
                    key={empresa.id}
                    className={`transition-colors hover:bg-white/[0.03] group ${empresa.ativo ? '' : 'opacity-60 bg-black/20'}`}
                  >
                    {/* Empresa com título aumentado */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditar(empresa)}
                          className="font-bold text-sm sm:text-base text-on-surface text-left hover:text-primary transition-colors cursor-pointer group-hover:underline"
                        >
                          {empresa.nome}
                        </button>
                        {!empresa.ativo && (
                          <Selo tom="neutro" className="text-[10px] rounded-none">
                            Inativa
                          </Selo>
                        )}
                      </div>
                    </td>

                    {/* Representante */}
                    <td className="py-3 px-3.5 text-on-surface-variant">
                      {rep ? (
                        <div>
                          <div className="font-semibold text-on-surface">{rep.nome}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant/70">
                            {rep.email}
                            {rep.whatsapp ? ` • ${rep.whatsapp}` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/40 italic">
                          Sem contato cadastrado
                        </span>
                      )}
                    </td>

                    {/* Pedido Mínimo */}
                    <td className="py-3 px-3.5 text-right font-mono">
                      {empresa.pedidoMinimo != null && empresa.pedidoMinimo > 0 ? (
                        <span className="text-on-surface font-semibold">
                          {moeda(empresa.pedidoMinimo)}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Status Badge Moderno */}
                    <td className="py-3 px-3.5 text-center">
                      {empresa.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-none text-xs font-medium bg-white/5 text-on-surface-variant border border-white/10">
                          Inativa
                        </span>
                      )}
                    </td>

                    {/* Ações com botões estilizados no padrão dark */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {empresa.ativo ? (
                          <>
                            <button
                              type="button"
                              title="Editar"
                              aria-label="Editar"
                              onClick={() => abrirEditar(empresa)}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <Pencil className="size-4" weight="bold" />
                            </button>
                            <button
                              type="button"
                              title="Inativar"
                              aria-label="Inativar"
                              onClick={() => inativar.mutate(empresa.id)}
                              disabled={inativar.isPending}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                            >
                              <EyeSlash className="size-4" weight="bold" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            title="Ativar"
                            aria-label="Ativar"
                            onClick={() => ativar.mutate(empresa.id)}
                            disabled={ativar.isPending}
                            className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                          >
                            <Eye className="size-4" weight="bold" />
                          </button>
                        )}
                        {rep && (
                          <button
                            type="button"
                            title="Excluir contato"
                            aria-label="Excluir contato"
                            onClick={() => setRepresentanteParaExcluir(rep)}
                            className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <UserMinus className="size-4" weight="bold" />
                          </button>
                        )}
                        {empresa.podeExcluir ? (
                          <button
                            type="button"
                            title="Excluir"
                            aria-label="Excluir"
                            onClick={() => setEmpresaParaExcluir(empresa)}
                            className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash className="size-4" weight="bold" />
                          </button>
                        ) : (
                          <Tooltip content="Não é possível excluir: a empresa já participou de uma cotação. Use Inativar.">
                            <button
                              type="button"
                              title="Excluir"
                              aria-label="Excluir"
                              disabled
                              onClick={() => setEmpresaParaExcluir(empresa)}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant/40 transition-colors inline-flex items-center justify-center cursor-not-allowed opacity-50"
                            >
                              <Trash className="size-4" weight="bold" />
                            </button>
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
    </PageContainer>
  )
}
