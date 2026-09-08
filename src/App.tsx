import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './routes'
import { AuthProvider } from './shared/auth/AuthContext'
import { SessaoExpiradaBridge } from './shared/auth/SessaoExpiradaBridge'
import { AcessoBloqueadoBridge } from './shared/auth/AcessoBloqueadoBridge'
import { ConfiguracaoLojaProvider } from './admin/configuracoes/ConfiguracaoLojaProvider'
import { TenantProvider } from './shared/tenant/TenantContext'
import { Toaster } from 'sonner'
import { IconProvider } from './shared/components/ui/icon'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <IconProvider>
      <AuthProvider>
        <SessaoExpiradaBridge />
        <AcessoBloqueadoBridge />
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <ConfiguracaoLojaProvider>
              <RouterProvider router={routes} />
            </ConfiguracaoLojaProvider>
            <Toaster richColors position="bottom-right" />
          </TenantProvider>
        </QueryClientProvider>
      </AuthProvider>
    </IconProvider>
  )
}
