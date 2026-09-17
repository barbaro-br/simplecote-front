
import { useMemo, useState } from 'react'
import {
  Key, PencilSimple, Crown,
  Envelope,
  Eye,
  Gear,
  MagnifyingGlass,
  PaperPlaneTilt,
  ShieldCheck,
  Trash,
  User,
  UserMinus,
  UserPlus,
  Users,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Dialog } from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import type { OpcaoChip } from '@/shared/ui'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { AdicionarMembroModal } from './AdicionarMembroModal'
import { RedefinirSenhaForm } from './RedefinirSenhaForm'
import {
  useInativarMembro,
  useMembros,
  useReenviarConvite,
  useRevogarConvite,
} from './organizacao.api'
import { ROTULO_STATUS, rotuloPapel, type Membro } from './organizacao.schema'

type AcaoConfirmar =
  | { tipo: 'revogar'; conviteId: string; email: string }
  | { tipo: 'inativar'; membro: Membro }
  | null

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'pendentes', rotulo: 'Convites pendentes' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

function normalizar(termo: string): string {
  return termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function MembrosPage() {
  const { data: membros, isLoading, error } = useMembros()
  const revogar = useRevogarConvite()
  const reenviar = useReenviarConvite()
  const inativar = useInativarMembro()
  const [convidarAberto, setConvidarAberto] = useState(false)
  const [editando, setEditando] = useState<Membro | null>(null)
  const [trocandoSenha, setTrocandoSenha] = useState<Membro | null>(null)
  const [confirmar, setConfirmar] = useState<AcaoConfirmar>(null)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  function mensagemDeErro(e: unknown): string {
    return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
  }

  function aoReenviar(id: string) {
    reenviar.mutate(id, {
      onSuccess: () => toast.success('Convite reenviado.'),
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        toast.error(mensagemDeErro(e))
      },
    })
  }

  function aoConfirmar() {
    if (!confirmar) return
    if (confirmar.tipo === 'revogar') {
      revogar.mutate(confirmar.conviteId, {
        onSettled: () => setConfirmar(null),
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          toast.error(mensagemDeErro(e))
        },
      })
    } else {
      inativar.mutate(confirmar.membro.id, {
        onSettled: () => setConfirmar(null),
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          toast.error(mensagemDeErro(e))
        },
      })
    }
  }

  const palavras = normalizar(busca.trim()).split(/\s+/).filter(Boolean)

  const listaFiltrada = useMemo(() => {
    return [...(membros ?? [])]
      .filter((m) => {
        if (filtro === 'ativos' && m.status !== 'ATIVO') return false
        if (filtro === 'pendentes' && m.status !== 'CONVITE_PENDENTE') return false
        if (filtro === 'inativos' && m.status !== 'INATIVO') return false
        if (palavras.length === 0) return true
        const alvo = `${normalizar(m.nome ?? '')} ${normalizar(m.email)} ${normalizar(rotuloPapel(m.papel))}`
        return palavras.every((p) => alvo.includes(p))
      })
  }, [membros, filtro, palavras])

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-8 text-center text-on-surface-variant">
          <p className="text-sm">Carregando membros…</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          <p className="text-sm font-semibold">Erro ao carregar membros: {error.message}</p>
        </div>
      </PageContainer>
    )
  }


  return (
    <PageContainer maxWidth="5xl" className="space-y-4 text-on-surface">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="size-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
                Membros da organização
              </h1>
              <span className="px-2 py-0.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {membros?.length ?? 0}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Quem acessa o painel da sua loja e seus níveis de permissão.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConvidarAberto(true)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-none bg-primary hover:bg-primary/90 text-black font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(78,222,163,0.25)]"
        >
          <UserPlus className="size-4" weight="bold" />
          Adicionar membro
        </button>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS (Soltos, sem card envolvente) */}
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
            aria-label="Buscar membro"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-none border border-white/15 bg-black/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>
      </div>

      {/* 3. MODAL DE CONVITE */}
      <Dialog
        open={convidarAberto}
        onClose={() => setConvidarAberto(false)}
        size="lg"
        ariaLabel="Adicionar membro"
        className="p-0 bg-transparent border-0 shadow-none rounded-none"
      >
        <AdicionarMembroModal aoFechar={() => setConvidarAberto(false)} />
      </Dialog>

      <Dialog
        open={!!editando}
        onClose={() => setEditando(null)}
        size="lg"
        ariaLabel="Editar membro"
        className="p-0 bg-transparent border-0 shadow-none rounded-none"
      >
        {editando && <AdicionarMembroModal aoFechar={() => setEditando(null)} membroParaEditar={editando} />}
      </Dialog>

      <Dialog
        open={!!trocandoSenha}
        onClose={() => setTrocandoSenha(null)}
        size="lg"
        ariaLabel="Redefinir senha"
        className="p-0 bg-transparent border-0 shadow-none rounded-none"
      >
        {trocandoSenha && <RedefinirSenhaForm usuarioId={trocandoSenha.id} usuarioNome={trocandoSenha.nome || trocandoSenha.email} aoSalvar={() => setTrocandoSenha(null)} />}
      </Dialog>

      {/* 4. DIÁLOGOS DE CONFIRMAÇÃO */}
      {confirmar?.tipo === 'revogar' && (
        <ConfirmarDialog
          titulo="Revogar convite"
          descricao={`O convite de ${confirmar.email} será revogado e o link enviado deixará de funcionar.`}
          rotuloConfirmar="Revogar"
          pendente={revogar.isPending}
          onConfirmar={aoConfirmar}
          onCancelar={() => setConfirmar(null)}
        />
      )}

      {confirmar?.tipo === 'inativar' && (
        <ConfirmarDialog
          titulo="Inativar membro"
          descricao={`${confirmar.membro.nome ?? confirmar.membro.email} perderá o acesso ao painel.`}
          rotuloConfirmar="Inativar"
          pendente={inativar.isPending}
          onConfirmar={aoConfirmar}
          onCancelar={() => setConfirmar(null)}
        />
      )}

      {/* 5. PLANILHA DE MEMBROS (Sem bordas de coluna, cabeçalho no padrão cotações) */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-none border border-white/10 bg-[#111813]/60 shadow-inner">
        <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
            <tr>
              <th className="py-3 px-3.5 font-bold border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <User className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Nome</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <Envelope className="size-4 text-primary shrink-0" weight="bold" />
                  <span>E-mail</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10 w-44">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary shrink-0" weight="bold" />
                  <span>Papel</span>
                </div>
              </th>
              <th className="py-3 px-3.5 font-bold border-b border-white/10 text-center w-36">
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
            {!membros?.length ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhum membro ainda.
                </td>
              </tr>
            ) : listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhum membro encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              listaFiltrada.map((m) => {
                const isOwner = m.papel === 'OWNER'
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors hover:bg-white/[0.03] group ${m.status === 'ATIVO' ? '' : 'opacity-70 bg-black/20'}`}
                  >
                    {/* Nome com título aumentado */}
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-sm sm:text-base text-on-surface">{m.nome ?? '—'}</span>
                    </td>

                    {/* E-mail */}
                    <td className="py-3 px-3.5 font-mono text-xs text-on-surface-variant">
                      {m.email}
                    </td>

                    {/* Papel */}
                    <td className="py-3 px-3.5">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-none">
                          <Crown className="size-3.5 text-amber-400" weight="fill" />
                          {rotuloPapel(m.papel)}
                        </span>
                      ) : m.papel === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-none">
                          <ShieldCheck className="size-3.5 text-cyan-400" weight="bold" />
                          {rotuloPapel(m.papel)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-medium bg-white/5 text-on-surface-variant border border-white/10 rounded-none">
                          {rotuloPapel(m.papel)}
                        </span>
                      )}
                    </td>

                    {/* Status Badge Moderno */}
                    <td className="py-3 px-3.5 text-center">
                      {m.status === 'ATIVO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          {ROTULO_STATUS[m.status]}
                        </span>
                      ) : m.status === 'CONVITE_PENDENTE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <PaperPlaneTilt className="size-3.5 text-amber-400" />
                          {ROTULO_STATUS[m.status]}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-none text-xs font-medium bg-white/5 text-on-surface-variant border border-white/10">
                          {ROTULO_STATUS[m.status]}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {m.status === 'CONVITE_PENDENTE' && (
                          <>
                            <button
                              type="button"
                              title="Reenviar"
                              aria-label="Reenviar"
                              onClick={() => aoReenviar(m.id)}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <PaperPlaneTilt className="size-4" weight="bold" />
                            </button>
                            <button
                              type="button"
                              title="Revogar"
                              aria-label="Revogar"
                              onClick={() =>
                                setConfirmar({ tipo: 'revogar', conviteId: m.id, email: m.email })
                              }
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <Trash className="size-4" weight="bold" />
                            </button>
                          </>
                        )}
                        {(m.status === 'ATIVO' || m.status === 'INATIVO') && (
                          <>
                            <button
                              type="button"
                              title="Editar"
                              aria-label="Editar"
                              onClick={() => setEditando(m)}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <PencilSimple className="size-4" weight="bold" />
                            </button>
                            <button
                              type="button"
                              title="Trocar senha"
                              aria-label="Trocar senha"
                              onClick={() => setTrocandoSenha(m)}
                              className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <Key className="size-4" weight="bold" />
                            </button>
                          </>
                        )}
                        {m.status === 'ATIVO' && !isOwner && (
                          <button
                            type="button"
                            title="Inativar"
                            aria-label="Inativar"
                            onClick={() => setConfirmar({ tipo: 'inativar', membro: m })}
                            className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <UserMinus className="size-4" weight="bold" />
                          </button>
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
