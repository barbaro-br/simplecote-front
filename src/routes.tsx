import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from './admin/layout/AdminLayout'
import { AuthGuard } from './shared/auth/AuthGuard'

import { ProdutosPage } from './admin/produtos/ProdutosPage'
import { EmpresasPage } from './admin/empresas/EmpresasPage'
import { LoginPage } from './admin/login/LoginPage'
import { CotacoesPage } from './admin/cotacoes/CotacoesPage'
import { NovaCotacaoPage } from './admin/cotacoes/NovaCotacaoPage'
import { CotacaoDetalhePage } from './admin/cotacoes/CotacaoDetalhePage'
import { ResultadoPage } from './admin/cotacoes/ResultadoPage'

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
            element: <CotacoesPage />,
          },
          {
            path: 'cotacoes/nova',
            element: <NovaCotacaoPage />,
          },
          {
            path: 'cotacoes/:id',
            element: <CotacaoDetalhePage />,
          },
          {
            path: 'cotacoes/:id/resultado',
            element: <ResultadoPage />,
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
