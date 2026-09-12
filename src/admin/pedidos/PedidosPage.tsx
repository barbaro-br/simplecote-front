import { useNavigate } from 'react-router-dom'
import { PlusCircle, Receipt } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie, SecaoCabecalho, Lista } from '@/shared/ui'
import { dataHoraBr } from '@/shared/format/formatters'
import { usePedidosAgregados } from './pedidos.api'
import { LinhaPedidoResumo } from './LinhaPedidoResumo'

export function PedidosPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = usePedidosAgregados()

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando pedidos…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar pedidos: {error.message}</p>
  if (!data) return null

  const semNenhumPedido = data.grupos.length === 0 && data.avulsos.length === 0

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <CabecalhoPagina
        titulo="Pedidos"
        subtitulo="Todos os pedidos apurados e avulsos, num lugar só."
        acao={
          <Button onClick={() => navigate('/admin/pedidos-avulsos/novo')}>
            <PlusCircle className="mr-2 size-4" />
            Novo pedido
          </Button>
        }
      />

      {semNenhumPedido && (
        <Superficie className="p-10 text-center space-y-4">
          <Receipt className="mx-auto size-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-[var(--pnl-txt,#fff)]">Nenhum pedido ainda</p>
            <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] mt-1">
              Crie um pedido avulso ou apure uma cotação para ver os pedidos aqui.
            </p>
          </div>
          <Button onClick={() => navigate('/admin/pedidos-avulsos/novo')}>
            <PlusCircle className="mr-2 size-4" />
            Novo pedido
          </Button>
        </Superficie>
      )}

      {data.grupos.map((grupo) => (
        <Superficie key={grupo.cotacaoId}>
          <SecaoCabecalho titulo={grupo.tituloCotacao} nivelTitulo={2} />
          <Lista>
            {grupo.pedidos.map((pedido) => (
              <LinhaPedidoResumo key={pedido.id} titulo={pedido.empresaNome ?? '—'} pedido={pedido} />
            ))}
          </Lista>
        </Superficie>
      ))}

      {data.avulsos.length > 0 && (
        <Superficie>
          <SecaoCabecalho titulo="Avulsos" nivelTitulo={2} />
          <Lista>
            {data.avulsos.map((pedido) => (
              <LinhaPedidoResumo key={pedido.id} titulo={`Pedido avulso — ${dataHoraBr(pedido.geradoEm)}`} pedido={pedido} />
            ))}
          </Lista>
        </Superficie>
      )}
    </PageContainer>
  )
}
