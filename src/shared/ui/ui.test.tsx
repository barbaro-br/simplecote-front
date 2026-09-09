import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { CheckCircle } from '@phosphor-icons/react'
import {
  CampoEstat,
  ChipsFiltro,
  GradeDados,
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

test('GradeDados destaca a célula vencedora e expõe a coluna editável', () => {
  const mudancas: string[] = []
  render(
    <GradeDados
      colunas={[
        { chave: 'a', rotulo: 'Aurora' },
        { chave: 'b', rotulo: 'Meridiano' },
      ]}
      linhas={[
        {
          chave: 'arroz',
          titulo: 'Arroz tipo 1',
          sub: 'Fardo c/ 6',
          codigo: '7896 0067 11234',
          celulas: [
            { valor: 'R$ 179,40' },
            {
              valor: '',
              editavel: {
                valor: '174,00',
                aoMudar: (v) => mudancas.push(v),
                rotuloA11y: 'Preço de Meridiano para Arroz tipo 1',
              },
            },
          ],
        },
        {
          chave: 'feijao',
          titulo: 'Feijão carioca',
          celulas: [{ valor: 'R$ 80,00', destaque: true, sub: 'R$ 8,00/un' }, { valor: 'R$ 87,00' }],
        },
      ]}
    />,
  )
  expect(screen.getByText('7896 0067 11234')).toBeInTheDocument()
  const editavel = screen.getByLabelText('Preço de Meridiano para Arroz tipo 1') as HTMLInputElement
  expect(editavel.value).toBe('174,00')
  expect(screen.getByText('R$ 8,00/un')).toBeInTheDocument()
})
