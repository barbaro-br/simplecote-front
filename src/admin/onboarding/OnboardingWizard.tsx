import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Package, Users } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import { EmpresaForm } from '@/admin/empresas/EmpresaForm'

type Passo = 1 | 2 | 3

const PASSOS: { n: Passo; titulo: string; Icon: typeof Package }[] = [
  { n: 1, titulo: 'Produtos', Icon: Package },
  { n: 2, titulo: 'Representante', Icon: Users },
  { n: 3, titulo: 'Cotação', Icon: CalendarCheck },
]

export function OnboardingWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [passo, setPasso] = useState<Passo>(1)

  if (!open) return null

  return (
    <Dialog open onClose={onClose} title="Configurar em 3 passos" size="lg">
      <ol className="flex items-center gap-2">
        {PASSOS.map((p) => {
          const Icon = p.Icon
          const ativo = passo === p.n
          const concluido = passo > p.n
          return (
            <li key={p.n} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  ativo ? 'bg-primary/10 text-primary' : concluido ? 'text-muted-foreground' : 'text-muted-foreground/60'
                }`}
              >
                <Icon className="size-4" aria-hidden />
                <span>{p.titulo}</span>
              </div>
              {p.n < 3 && <div className="h-px w-6 bg-border" aria-hidden />}
            </li>
          )
        })}
      </ol>

      {passo === 1 && <ProdutoForm aoSalvar={() => setPasso(2)} />}

      {passo === 2 && <EmpresaForm aoSalvar={() => setPasso(3)} />}

      {passo === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Último passo: crie uma cotação de teste e abra para os representantes darem preço.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                onClose()
                navigate('/admin/cotacoes/nova')
              }}
            >
              <CalendarCheck className="mr-2 size-4" />
              Abrir nova cotação
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
