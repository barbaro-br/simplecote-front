import { expect, test } from 'vitest'
import { agruparPedidosPorEmpresa } from './pedidos.util'

test('agruparAvulsosPorMes já existe, vamos testar agruparPedidosPorEmpresa', () => {
  const dados = [
    { empresaNome: 'Empresa A', total: 100, id: '1' },
    { empresaNome: 'Empresa B', total: 50, id: '2' },
    { empresaNome: 'Empresa A', total: 200, id: '3' },
  ] as any[]

  const resultado = agruparPedidosPorEmpresa(dados)

  expect(resultado).toHaveLength(2)
  expect(resultado[0].empresaNome).toBe('Empresa A')
  expect(resultado[0].totalGeral).toBe(300)
  expect(resultado[0].pedidos).toHaveLength(2)

  expect(resultado[1].empresaNome).toBe('Empresa B')
  expect(resultado[1].totalGeral).toBe(50)
  expect(resultado[1].pedidos).toHaveLength(1)
})
