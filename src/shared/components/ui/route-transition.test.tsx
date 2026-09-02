import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { RouteTransition } from './route-transition'

test('exibe o novo outlet após a troca de rota (fallback sem startViewTransition)', async () => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RouteTransition />,
        children: [
          { index: true, element: <div>Início</div> },
          { path: 'outra', element: <div>Outra tela</div> },
        ],
      },
    ],
    { initialEntries: ['/'] },
  )

  render(<RouterProvider router={router} />)

  expect(screen.getByText('Início')).toBeInTheDocument()

  router.navigate('/outra')

  expect(await screen.findByText('Outra tela')).toBeInTheDocument()
})
