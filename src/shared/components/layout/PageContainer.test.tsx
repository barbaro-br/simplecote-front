import { render } from '@testing-library/react'
import { PageContainer, type PageMaxWidth } from './PageContainer'

const CASOS: [PageMaxWidth, string][] = [
  ['lg', 'max-w-lg'],
  ['4xl', 'max-w-4xl'],
  ['5xl', 'max-w-5xl'],
]

test.each(CASOS)('PageContainer(maxWidth=%s) renderiza a classe de largura correta', (maxWidth, cls) => {
  const { container } = render(
    <PageContainer maxWidth={maxWidth} data-testid="page">
      <span>conteúdo</span>
    </PageContainer>,
  )
  const div = container.firstElementChild as HTMLElement
  expect(div).toHaveClass('mx-auto')
  expect(div).toHaveClass('w-full')
  expect(div).toHaveClass(cls)
})

test('PageContainer repassa o className para a div interna', () => {
  const { container } = render(
    <PageContainer maxWidth="5xl" className="space-y-5">
      <span>conteúdo</span>
    </PageContainer>,
  )
  const div = container.firstElementChild as HTMLElement
  expect(div).toHaveClass('space-y-5')
})
