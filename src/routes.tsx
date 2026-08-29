import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from './admin/layout/AdminLayout'
import { AuthGuard } from './shared/auth/AuthGuard'

import { ProdutosPage } from './admin/produtos/ProdutosPage'
import { EmpresasPage } from './admin/empresas/EmpresasPage'
import { LoginPage } from './admin/login/LoginPage'
import { CotacoesPage } from './admin/cotacoes/CotacoesPage'
import { NovaCotacaoPage } from './admin/cotacoes/NovaCotacaoPage'
import { CotacaoDetalhePage } from './admin/cotacoes/CotacaoDetalhePage'
import { GradeAoVivoPage } from './admin/cotacoes/GradeAoVivoPage'
import { ResultadoPage } from './admin/cotacoes/ResultadoPage'
import { TemaClaro } from './representante/TemaClaro'
import { CotacaoPorTokenPage } from './representante/cotacao/CotacaoPorTokenPage'
import { PedidoPorTokenPage } from './representante/pedido/PedidoPorTokenPage'

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
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
            path: 'cotacoes/:id/ao-vivo',
            element: <GradeAoVivoPage />,
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
    element: <TemaClaro />,
    children: [
      {
        path: '/cotacao/:token',
        element: <CotacaoPorTokenPage />,
      },
      {
        path: '/pedido/:token',
        element: <PedidoPorTokenPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
])
