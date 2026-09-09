import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { CheckCircle } from '@phosphor-icons/react'
import {
  CampoEstat,
  ChipsFiltro,
  LinhaLista,
  Lista,
  RodapeAcao,
  SecaoCabecalho,
  Selo,
  SubFaixa,
  Superficie,
} from './index'

test('Superficie + SecaoCabecalho renderizam título e ação', () => {
  render(
    <Superficie>
      <SecaoCabecalho titulo="Grade ao vivo" acao={<Selo tom="sucesso">Ativa</Selo>} />
      <SubFaixa esquerda="Convites" direita="3 de 5" />
    </Superficie>,
  )
  expect(screen.getByText('Grade ao vivo')).toBeInTheDocument()
  expect(screen.getByText('Ativa')).toBeInTheDocument()
  expect(screen.getByText('3 de 5')).toBeInTheDocument()
})

test('LinhaLista com onClick vira button e dispara', async () => {
  const cliques: string[] = []
  render(
    <Lista>
      <LinhaLista
        avatar="Hortifruti Boa Safra"
        titulo="Hortifruti Boa Safra"
        meta="Hortifruti"
        fim={<Selo tom="sucesso" icone={CheckCircle}>Respondeu</Selo>}
        onClick={() => cliques.push('x')}
      />
    </Lista>,
  )
  const linha = screen.getByRole('button', { name: /Hortifruti Boa Safra/ })
  expect(within(linha).getByText('HB')).toBeInTheDocument()
  linha.click()
  expect(cliques).toHaveLength(1)
})

test('CampoEstat e RodapeAcao mostram valor e ação', () => {
  render(
    <RodapeAcao
      esquerda={<CampoEstat inline rotulo="Economia" valor="R$ 836,00" sufixo="/ mês" />}
      direita={<button>Gerar pedidos</button>}
    />,
  )
  expect(screen.getByText('R$ 836,00')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Gerar pedidos' })).toBeInTheDocument()
})

test('ChipsFiltro marca o ativo com aria-pressed', () => {
  render(
    <ChipsFiltro
      valor="hortifruti"
      aoTrocar={() => {}}
      opcoes={[
        { valor: 'hortifruti', rotulo: 'Hortifruti' },
        { valor: 'bebidas', rotulo: 'Bebidas' },
      ]}
    />,
  )
  expect(screen.getByRole('button', { name: 'Hortifruti', pressed: true })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Bebidas', pressed: false })).toBeInTheDocument()
})
