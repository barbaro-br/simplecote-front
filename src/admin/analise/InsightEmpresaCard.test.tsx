import { render, screen } from '@testing-library/react'
import { InsightEmpresaCard } from './InsightEmpresaCard'
import { duracaoAprox } from './duracao'
import type { InsightEmpresa } from './analise.schema'

describe('InsightEmpresaCard', () => {
  it('formata o tempo aprox corretamente', () => {
    expect(duracaoAprox(30)).toBe('< 1 min')
    expect(duracaoAprox(120)).toBe('~2 min')
    expect(duracaoAprox(3600)).toBe('~1 h')
    expect(duracaoAprox(7500)).toBe('~2 h')
    expect(duracaoAprox(86400)).toBe('~1 dia')
    expect(duracaoAprox(180000)).toBe('~2 dias')
  })

  it('renderiza "sem dados" para null ou erro', () => {
    const { rerender } = render(<InsightEmpresaCard insight={null} />)
    expect(screen.getByTestId('insight-empresa-vazio')).toHaveTextContent('Sem dados de relacionamento')

    rerender(<InsightEmpresaCard insight="erro" />)
    expect(screen.getByTestId('insight-empresa-vazio')).toHaveTextContent('Sem dados de relacionamento')
  })

  it('renderiza "sem dados" se tudo estiver vazio', () => {
    const insight: InsightEmpresa = {
      taxaResposta: null,
      itensVencidos: null,
      valorComprado: null,
      ultimaCompra: null,
      maisBarata: null,
      segundoLugar: null,
      produtosFornecidos: null,
      tempoMedioRespostaSegundos: null,
    }
    render(<InsightEmpresaCard insight={insight} />)
    expect(screen.getByTestId('insight-empresa-vazio')).toHaveTextContent('Sem dados de relacionamento')
  })

  it('renderiza os dados da empresa', () => {
    const insight: InsightEmpresa = {
      taxaResposta: { respondeu: 10, convidada: 12 },
      itensVencidos: 50,
      valorComprado: { total: '15000', ultimos90d: '5000' },
      ultimaCompra: { data: '2023-10-15T12:00:00Z', valor: '2000' },
      maisBarata: 8,
      segundoLugar: 4,
      produtosFornecidos: 100,
      tempoMedioRespostaSegundos: 3600, // 1h
    }
    render(<InsightEmpresaCard insight={insight} />)

    const card = screen.getByTestId('insight-empresa-card')
    expect(card).toBeInTheDocument()
    
    // Taxa
    expect(screen.getByText('10 / 12')).toBeInTheDocument()
    // Tempo medio
    expect(screen.getByText('~1 h')).toBeInTheDocument()
    // Competitividade
    expect(screen.getByText('Mais barata 8× / 2º lugar 4×')).toBeInTheDocument()
    // Itens ganhos
    expect(screen.getByText('50')).toBeInTheDocument()
    // Fornecidos
    expect(screen.getByText('100')).toBeInTheDocument()
    // Comprado
    expect(screen.getByText('R$ 15.000,00 / R$ 5.000,00')).toBeInTheDocument()
    // Ultima compra
    expect(screen.getByText('15/10/2023')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument()
  })
})
