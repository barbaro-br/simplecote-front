import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from './admin/layout/AdminLayout'
import { AuthGuard } from './shared/auth/AuthGuard'

import { ProdutosPage } from './admin/produtos/ProdutosPage'
import { EmpresasPage } from './admin/empresas/EmpresasPage'
import { LoginPage } from './admin/login/LoginPage'

export const routes = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '',
            element: <div>Dashboard (Em breve)</div>,
          },
          {
            path: 'produtos',
            element: <ProdutosPage />,
          },
          {
            path: 'empresas',
            element: <EmpresasPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/cotacao/:token',
    element: <div>Cotação Representante (Em breve)</div>,
  },
  {
    path: '/pedido/:token',
    element: <div>Pedido Representante (Em breve)</div>,
  },
])

