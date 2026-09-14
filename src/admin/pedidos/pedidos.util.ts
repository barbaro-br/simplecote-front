import { chaveMes, mesAnoBr } from '@/shared/format/formatters'
import type { TomSelo } from '@/shared/ui'
import type { PedidoResumo } from './pedidos.schema'

export const ROTULO_STATUS: Record<string, string> = {
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  CONFIRMADO: 'Confirmado',
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
}

export const TOM_STATUS: Record<string, TomSelo> = {
  CONFIRMADO: 'sucesso',
  FECHADO: 'sucesso',
  ENVIADO: 'info',
  GERADO: 'neutro',
  ABERTO: 'neutro',
}

export type GrupoAvulsosMes = {
  chave: string
  rotulo: string
  pedidos: PedidoResumo[]
  total: number
}

/** Agrupa pedidos avulsos por mês de geração (mais recente primeiro) — sem isso, dezenas de
 * avulsos viram uma lista só, longa demais pra escanear. */
export function agruparAvulsosPorMes(avulsos: PedidoResumo[]): GrupoAvulsosMes[] {
  const porMes = new Map<string, PedidoResumo[]>()
  for (const p of avulsos) {
    const chave = chaveMes(p.geradoEm)
    const lista = porMes.get(chave)
    if (lista) lista.push(p)
    else porMes.set(chave, [p])
  }
  return Array.from(porMes.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([chave, pedidos]) => ({
      chave,
      rotulo: mesAnoBr(chave),
      pedidos: [...pedidos].sort((a, b) => b.geradoEm.localeCompare(a.geradoEm)),
      total: pedidos.reduce((s, p) => s + p.total, 0),
    }))
}

export type GrupoEmpresaPedidos = {
  empresaNome: string
  totalGeral: number
  pedidos: PedidoResumo[]
}

export function agruparPedidosPorEmpresa(pedidos: PedidoResumo[]): GrupoEmpresaPedidos[] {
  const mapa = new Map<string, PedidoResumo[]>()
  
  for (const p of pedidos) {
    const nome = p.empresaNome || 'Sem Empresa'
    const lista = mapa.get(nome) || []
    lista.push(p)
    mapa.set(nome, lista)
  }

  const resultado: GrupoEmpresaPedidos[] = []
  for (const [empresaNome, pedidosEmpresa] of mapa.entries()) {
    const totalGeral = pedidosEmpresa.reduce((acc, p) => acc + p.total, 0)
    resultado.push({ empresaNome, totalGeral, pedidos: pedidosEmpresa })
  }

  return resultado.sort((a, b) => a.empresaNome.localeCompare(b.empresaNome))
}
