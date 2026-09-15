import { useMemo, useState } from 'react'
import {
  Crown,
  Envelope,
  Eye,
  Gear,
  Key,
  MagnifyingGlass,
  Pencil,
  Plus,
  ShieldCheck,
  User,
  UserMinus,
  Users,
} from '@phosphor-icons/react'
import { Dialog } from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import type { OpcaoChip } from '@/shared/ui'
import { UsuarioForm } from './UsuarioForm'
import { RedefinirSenhaForm } from './RedefinirSenhaForm'
import { useInativarUsuario, useUsuarios } from './usuarios.api'
import { ROTULO_PAPEL, type Usuario } from './usuarios.schema'

type Modal =
  | { tipo: 'criar' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'senha'; usuario: Usuario }
  | null

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

function normalizar(termo: string): string {
  return termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function UsuariosPage() {
  const { data: usuarios, isLoading, error } = useUsuarios()
  const inativar = useInativarUsuario()
  const [modal, setModal] = useState<Modal>(null)
  const [confirmar, setConfirmar] = useState<Usuario | null>(null)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  const palavras = normalizar(busca.trim()).split(/\s+/).filter(Boolean)

  const listaFiltrada = useMemo(() => {
    return [...(usuarios ?? [])]
      .filter((u) => {
        if (filtro === 'ativos' && !u.ativo) return false
        if (filtro === 'inativos' && u.ativo) return false
        if (palavras.length === 0) return true
        const alvo = `${normalizar(u.nome)} ${normalizar(u.email)} ${normalizar(ROTULO_PAPEL[u.papel] ?? u.papel)}`
        return palavras.every((p) => alvo.includes(p))
      })
      .sort((a, b) => Number(b.ativo) - Number(a.ativo))
  }, [usuarios, filtro, palavras])

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-8 text-center text-on-surface-variant">
          <p className="text-sm">Carregando usuários…</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          <p className="text-sm font-semibold">Erro ao carregar usuários: {error.message}</p>
        </div>
      </PageContainer>
    )
  }


  return (
    <PageContainer maxWidth="5xl" className="space-y-4 text-on-surface">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="size-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
                Usuários do sistema
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {usuarios?.length ?? 0}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Gerencie quem acessa o painel administrativo e os níveis de permissão.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModal({ tipo: 'criar' })}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-black font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(78,222,163,0.25)]"
        >
          <Plus className="size-4" weight="bold" />
          Novo usuário
        </button>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS (Soltos, sem card envolvente) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 select-none overflow-x-auto max-w-full">
          {FILTROS.map((f) => {
            const ativo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
            aria-label="Buscar usuário"
            placeholder="Buscar por nome, e-mail ou perfil…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-xl border border-white/15 bg-black/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>
      </div>

      {/* 3. MODAIS (CRIAR, EDITAR, SENHA) */}
      <Dialog
        open={modal !== null}
        onClose={() => setModal(null)}
        size="lg"
        ariaLabel="Usuário"
        className="p-0 bg-transparent border-0 shadow-none rounded-none"
      >
        {modal?.tipo === 'editar' && (
          <UsuarioForm aoSalvar={() => setModal(null)} usuarioParaEditar={modal.usuario} />
        )}
        {modal?.tipo === 'senha' && (
          <RedefinirSenhaForm
            usuarioId={modal.usuario.id}
            usuarioNome={modal.usuario.nome}
            aoSalvar={() => setModal(null)}
          />
        )}
        {modal?.tipo === 'criar' && <UsuarioForm aoSalvar={() => setModal(null)} />}
      </Dialog>

      {/* 4. MODAL DE CONFIRMAÇÃO PARA INATIVAR */}
      <Dialog
        open={confirmar !== null}
        onClose={() => setConfirmar(null)}
        title="Inativar usuário"
        className="rounded-none border border-white/15 bg-[#0d1410] text-on-surface p-6 shadow-2xl"
      >
        <p className="text-sm text-on-surface-variant">
          {confirmar?.nome} perde o acesso ao painel. Não há como reativar pela tela.
        </p>
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-4">
          <button
            type="button"
            onClick={() => setConfirmar(null)}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={inativar.isPending}
            onClick={() => {
              if (!confirmar) return
              inativar.mutate(confirmar.id, { onSettled: () => setConfirmar(null) })
            }}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {inativar.isPending ? 'Inativando…' : 'Inativar'}
          </button>
        </div>
      </Dialog>

      {/* 5. PLANILHA DE USUÁRIOS (Sem bordas de coluna, cabeçalho no padrão cotações) */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-[#111813]/60 shadow-inner">
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
            {!usuarios?.length ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-3.5 text-center text-on-surface-variant">
                  Nenhuma usuário encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              listaFiltrada.map((usuario) => {
                const isOwner = usuario.papel === 'OWNER'
                return (
                  <tr
                    key={usuario.id}
                    className={`transition-colors hover:bg-white/[0.03] group ${usuario.ativo ? '' : 'opacity-60 bg-black/20'}`}
                  >
                    {/* Nome com título aumentado */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-on-surface">{usuario.nome}</span>
                      </div>
                    </td>

                    {/* E-mail */}
                    <td className="py-3 px-3.5 font-mono text-xs text-on-surface-variant">
                      {usuario.email}
                    </td>

                    {/* Papel */}
                    <td className="py-3 px-3.5">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                          <Crown className="size-3.5 text-amber-400" weight="fill" />
                          {ROTULO_PAPEL[usuario.papel] ?? usuario.papel}
                        </span>
                      ) : usuario.papel === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded">
                          <ShieldCheck className="size-3.5 text-cyan-400" weight="bold" />
                          {ROTULO_PAPEL[usuario.papel] ?? usuario.papel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-medium bg-white/5 text-on-surface-variant border border-white/10 rounded">
                          {ROTULO_PAPEL[usuario.papel] ?? usuario.papel}
                        </span>
                      )}
                    </td>

                    {/* Status Badge Moderno */}
                    <td className="py-3 px-3.5 text-center">
                      {usuario.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-on-surface-variant border border-white/10">
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3.5 text-center">
                      {isOwner ? null : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="Editar"
                            aria-label="Editar"
                            onClick={() => setModal({ tipo: 'editar', usuario })}
                            className="size-8 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <Pencil className="size-4" weight="bold" />
                          </button>
                          <button
                            type="button"
                            title="Trocar senha"
                            aria-label="Trocar senha"
                            onClick={() => setModal({ tipo: 'senha', usuario })}
                            className="size-8 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <Key className="size-4" weight="bold" />
                          </button>
                          {usuario.ativo && (
                            <button
                              type="button"
                              title="Inativar"
                              aria-label="Inativar"
                              onClick={() => setConfirmar(usuario)}
                              className="size-8 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <UserMinus className="size-4" weight="bold" />
                            </button>
                          )}
                        </div>
                      )}
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
