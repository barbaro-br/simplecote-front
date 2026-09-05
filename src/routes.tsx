import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from './admin/layout/AdminLayout'
import { AuthGuard } from './shared/auth/AuthGuard'

import { LoginPage } from './admin/login/LoginPage'
import { EsqueciSenhaPage } from './admin/recuperar-senha/EsqueciSenhaPage'
import { RedefinirSenhaPage } from './admin/recuperar-senha/RedefinirSenhaPage'
import { TemaClaro } from './representante/TemaClaro'
import { RouteLoadingFallback } from './shared/components/ui/route-loading'

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
    path: '/esqueci-senha',
    element: <EsqueciSenhaPage />,
  },
  {
    path: '/redefinir-senha/:token',
    element: <RedefinirSenhaPage />,
  },
  {
    path: '/admin',
    element: <AuthGuard />,
    HydrateFallback: RouteLoadingFallback,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '',
            lazy: () => import('./admin/analise/DashboardPage').then(m => ({ Component: m.DashboardPage })),
          },
          {
            path: 'cotacoes',
            lazy: () => import('./admin/cotacoes/CotacoesPage').then(m => ({ Component: m.CotacoesPage })),
          },
          {
            path: 'cotacoes/nova',
            lazy: () => import('./admin/cotacoes/NovaCotacaoPage').then(m => ({ Component: m.NovaCotacaoPage })),
          },
          {
            path: 'cotacoes/:id',
            lazy: () => import('./admin/cotacoes/CotacaoDetalhePage').then(m => ({ Component: m.CotacaoDetalhePage })),
          },
          {
            path: 'cotacoes/:id/bipar',
            lazy: () => import('./admin/cotacoes/bipagem/BipagemPage').then(m => ({ Component: m.BipagemPage })),
          },
          {
            path: 'cotacoes/:id/resultado',
            lazy: () => import('./admin/cotacoes/ResultadoPage').then(m => ({ Component: m.ResultadoPage })),
          },
          {
            path: 'produtos',
            lazy: () => import('./admin/produtos/ProdutosPage').then(m => ({ Component: m.ProdutosPage })),
          },
          {
            path: 'empresas',
            lazy: () => import('./admin/empresas/EmpresasPage').then(m => ({ Component: m.EmpresasPage })),
          },
          {
            path: 'usuarios',
            lazy: () => import('./admin/usuarios/UsuariosPage').then(m => ({ Component: m.UsuariosPage })),
          },
          {
            path: 'analises',
            lazy: () => import('./admin/analise/AnalisesPage').then(m => ({ Component: m.AnalisesPage })),
          },
          {
            path: 'configuracoes',
            lazy: () => import('./admin/configuracoes/ConfiguracoesPage').then(m => ({ Component: m.ConfiguracoesPage })),
          },
        ],
      },
    ],
  },
  {
    element: <TemaClaro />,
    HydrateFallback: RouteLoadingFallback,
    children: [
      {
        path: '/cotacao/:token',
        lazy: () => import('./representante/cotacao/CotacaoPorTokenPage').then(m => ({ Component: m.CotacaoPorTokenPage })),
      },
      {
        path: '/pedido/:token',
        lazy: () => import('./representante/pedido/PedidoPorTokenPage').then(m => ({ Component: m.PedidoPorTokenPage })),
      },
      {
        path: '/colaborador/:token',
        lazy: () => import('./colaborador/ColaboradorPage').then(m => ({ Component: m.ColaboradorPage })),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
])
