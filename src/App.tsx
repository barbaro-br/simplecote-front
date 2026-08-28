import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './routes'
import { AuthProvider } from './shared/auth/AuthContext'
import { SessaoExpiradaBridge } from './shared/auth/SessaoExpiradaBridge'

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
        <RouterProvider router={routes} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

