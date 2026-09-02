import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './routes'
import { AuthProvider } from './shared/auth/AuthContext'
import { SessaoExpiradaBridge } from './shared/auth/SessaoExpiradaBridge'
import { ConfiguracaoLojaProvider } from './admin/configuracoes/ConfiguracaoLojaProvider'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <AuthProvider>
      <SessaoExpiradaBridge />
      <QueryClientProvider client={queryClient}>
        <ConfiguracaoLojaProvider>
          <RouterProvider router={routes} />
        </ConfiguracaoLojaProvider>
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}
