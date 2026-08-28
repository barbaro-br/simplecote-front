import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthContext'

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-card text-foreground">
      <aside className="w-64 border-r bg-background p-4 flex flex-col">
        <h1 className="text-xl font-bold text-primary mb-8">SimpleCote</h1>
        <nav className="space-y-2 flex flex-col flex-1">
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Cotações</Link>
          <Link to="/admin/produtos" className="text-sm text-muted-foreground hover:text-foreground">Produtos</Link>
          <Link to="/admin/empresas" className="text-sm text-muted-foreground hover:text-foreground">Empresas</Link>
        </nav>
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className="w-full text-left text-sm text-muted-foreground hover:text-destructive transition-colors mt-4 pt-4 border-t"
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

