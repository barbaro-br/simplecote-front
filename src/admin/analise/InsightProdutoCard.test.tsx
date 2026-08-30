import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InsightProdutoCard } from './InsightProdutoCard'
import type { InsightProduto } from './analise.schema'

describe('InsightProdutoCard', () => {
  it('renderiza erro', () => {
    render(<InsightProdutoCard insight="erro" />)
    expect(screen.getByTestId('insight-produto-erro')).toBeInTheDocument()
  })

  it('renderiza vazio', () => {
    render(<InsightProdutoCard insight={null} />)
    expect(screen.getByTestId('insight-produto-vazio')).toBeInTheDocument()
  })

  it('renderiza vazio quando ultimaCompra é null (mesmo com insight presente)', () => {
    render(<InsightProdutoCard insight={{ 
      ultimaCompra: null, 
      variacaoPct: null, 
      menorPreco: null, 
      media90d: null, 
      numeroCompras: null, 
      numeroFornecedores: null, 
      serie: [] 
    }} />)
    expect(screen.getByTestId('insight-produto-vazio')).toBeInTheDocument()
  })

  it('renderiza dados completos', () => {
    const mockInsight: InsightProduto = {
      ultimaCompra: {
        cotacaoId: '123e4567-e89b-12d3-a456-426614174000',
        empresa: 'Papelaria XYZ',
        representante: 'João',
        precoUnitario: '15.50',
        data: '2023-10-15T00:00:00Z',
        quantidade: 10,
      },
      variacaoPct: '5.2', // subiu
      menorPreco: '14.00',
      media90d: '15.00',
      numeroCompras: 5,
      numeroFornecedores: 3,
      serie: [15.0, 14.5, 15.5],
    }

    render(
      <MemoryRouter>
        <InsightProdutoCard insight={mockInsight} />
      </MemoryRouter>
    )

    // Preço e data
    expect(screen.getByText('R$ 15,50')).toBeInTheDocument()
    expect(screen.getByText('14/10/2023')).toBeInTheDocument() // timezone dependendo de onde roda, pode ser 14 ou 15. Wait, I will use regex.
    expect(screen.getByText(/10\/2023/)).toBeInTheDocument()
    
    // Empresa, rep, qtd
    expect(screen.getByText('Papelaria XYZ')).toBeInTheDocument()
    expect(screen.getByText(/João/)).toBeInTheDocument()
    expect(screen.getByText('Qtd: 10')).toBeInTheDocument()

    // Menor, Media, Compras, Fornecedores
    expect(screen.getByText('R$ 14,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 15,00')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    // Badge variação subiu (destrutivo)
    const badge = screen.getByTestId('badge-variacao')
    expect(badge).toHaveClass('text-destructive')
    expect(badge).toHaveTextContent('5.2%')

    // Sparkline
    expect(screen.getByTestId('sparkline')).toBeInTheDocument()

    // Link
    const link = screen.getByRole('link', { name: 'Ver cotação' })
    expect(link).toHaveAttribute('href', '/admin/cotacoes/123e4567-e89b-12d3-a456-426614174000/resultado')
  })

  it('badge de variação verde quando desceu', () => {
    const mockInsight: InsightProduto = {
      ultimaCompra: {
        cotacaoId: '123e4567-e89b-12d3-a456-426614174000',
        empresa: 'Papelaria XYZ',
        representante: 'João',
        precoUnitario: '15.50',
        data: '2023-10-15T00:00:00Z',
        quantidade: 10,
      },
      variacaoPct: '-10.5', // desceu
      menorPreco: null,
      media90d: null,
      numeroCompras: null,
      numeroFornecedores: null,
      serie: [],
    }

    render(
      <MemoryRouter>
        <InsightProdutoCard insight={mockInsight} />
      </MemoryRouter>
    )

    const badge = screen.getByTestId('badge-variacao')
    // token do projeto (src/index.css), não palette cru do Tailwind
    expect(badge).toHaveClass('text-success')
    expect(badge).toHaveTextContent('10.5%')
  })

  it('badge de variação neutro quando null', () => {
    const mockInsight: InsightProduto = {
      ultimaCompra: {
        cotacaoId: '123e4567-e89b-12d3-a456-426614174000',
        empresa: 'Papelaria XYZ',
        representante: 'João',
        precoUnitario: '15.50',
        data: '2023-10-15T00:00:00Z',
        quantidade: 10,
      },
      variacaoPct: null, // neutro
      menorPreco: null,
      media90d: null,
      numeroCompras: null,
      numeroFornecedores: null,
      serie: [],
    }

    render(
      <MemoryRouter>
        <InsightProdutoCard insight={mockInsight} />
      </MemoryRouter>
    )

    const badge = screen.getByTestId('badge-variacao')
    expect(badge).toHaveClass('text-muted-foreground')
    expect(badge).toHaveTextContent('—')
  })
})
