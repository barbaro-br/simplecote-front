import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { dataBr, dataHoraBr, moeda } from '@/shared/format/formatters'
import { useCompradores } from './backoffice.api'
import { STATUS_ASSINATURA, rotuloStatus } from './backoffice.schema'

const CLASSE_STATUS: Record<string, string> = {
  TESTE: 'bg-muted text-muted-foreground',
  ATIVA: 'bg-success/10 text-success-foreground',
  INADIMPLENTE: 'bg-destructive/10 text-destructive',
  CANCELADA: 'bg-muted text-muted-foreground',
}

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

type CampoSorte = 'nome' | 'criado' | 'acesso' | 'comprado'
type Sorte = { campo: CampoSorte; asc: boolean }

function CabecalhoOrdenavel({
  campo,
  rotulo,
  sorte,
  onSorte,
}: {
  campo: CampoSorte
  rotulo: string
  sorte: Sorte
  onSorte: (campo: CampoSorte) => void
}) {
  const ativo = sorte.campo === campo
  const Icone = !ativo ? CaretUpDown : sorte.asc ? CaretUp : CaretDown
  return (
    <th className="px-4 py-3 font-medium ui-uppercase">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => onSorte(campo)}
      >
        {rotulo}
        <Icone className={`size-3 ${ativo ? '' : 'opacity-40'}`} />
      </button>
    </th>
  )
}

export function CompradoresPage() {
  const [status, setStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [sorte, setSorte] = useState<Sorte>({ campo: 'criado', asc: false })
  const buscaDebounced = useDebounce(busca, 400)

  const { data: compradores, isLoading, error } = useCompradores({
    status: status || undefined,
    busca: buscaDebounced.trim() || undefined,
  })

  const ordenados = useMemo(() => {
    if (!compradores) return compradores
    const lista = [...compradores]
    lista.sort((a, b) => {
      let va: string | number
      let vb: string | number
      switch (sorte.campo) {
        case 'nome':
          va = a.nome.toLowerCase()
          vb = b.nome.toLowerCase()
          break
        case 'criado':
          va = a.criadoEm
          vb = b.criadoEm
          break
        case 'acesso':
          va = a.ultimoAcessoEm ?? ''
          vb = b.ultimoAcessoEm ?? ''
          break
        case 'comprado':
          va = a.valorTotalComprado
          vb = b.valorTotalComprado
          break
      }
      if (va < vb) return sorte.asc ? -1 : 1
      if (va > vb) return sorte.asc ? 1 : -1
      return 0
    })
    return lista
  }, [compradores, sorte])

  function ordenar(campo: CampoSorte) {
    setSorte((atual) => (atual.campo === campo ? { campo, asc: !atual.asc } : { campo, asc: true }))
  }

  return (
    <PageContainer maxWidth="full" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Compradores</h1>
        <p className="text-sm text-muted-foreground">Contas do SimpleCote.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filtrar por status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option value="">Todos os status</option>
          {STATUS_ASSINATURA.map((s) => (
            <option key={s} value={s}>
              {rotuloStatus(s)}
            </option>
          ))}
        </select>
        <Input
          aria-label="Buscar por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p className="p-6 text-muted-foreground">Carregando compradores…</p>
      ) : error ? (
        <p className="p-6 text-destructive">Erro ao carregar compradores: {error.message}</p>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left text-muted-foreground">
                  <CabecalhoOrdenavel campo="nome" rotulo="Nome" sorte={sorte} onSorte={ordenar} />
                  <th className="px-4 py-3 font-medium ui-uppercase">Slug</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Status</th>
                  <CabecalhoOrdenavel campo="criado" rotulo="Criada em" sorte={sorte} onSorte={ordenar} />
                  <CabecalhoOrdenavel campo="acesso" rotulo="Último acesso" sorte={sorte} onSorte={ordenar} />
                  <CabecalhoOrdenavel campo="comprado" rotulo="Comprado" sorte={sorte} onSorte={ordenar} />
                  <th className="px-4 py-3 font-medium ui-uppercase">Uso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!ordenados?.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum comprador encontrado.
                    </td>
                  </tr>
                ) : (
                  ordenados.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Link to={`/backoffice/compradores/${c.id}`} className="font-medium hover:underline">
                          {c.nome}
                          {c.suspenso && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                              Suspensa
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CLASSE_STATUS[c.statusAssinatura] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {rotuloStatus(c.statusAssinatura)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{dataBr(c.criadoEm)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.ultimoAcessoEm ? dataHoraBr(c.ultimoAcessoEm) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{moeda(c.valorTotalComprado)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.cotacoes} cot · {c.usuarios} usu · {c.representantes} rep
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageContainer>
  )
}
