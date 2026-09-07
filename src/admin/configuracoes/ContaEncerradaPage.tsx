import { Link } from 'react-router-dom'

export function ContaEncerradaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Conta encerrada</h1>
        <p className="text-sm text-muted-foreground">
          A conta da sua loja foi encerrada. Os acessos foram revogados e os dados serão apagados
          em definitivo após o período de carência.
        </p>
        <Link to="/" className="inline-block text-sm font-medium text-primary hover:underline">
          Ir para a página inicial
        </Link>
      </div>
    </div>
  )
}
