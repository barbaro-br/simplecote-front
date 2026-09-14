import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Icon } from './ui-v2'

type ToastTipo = 'sucesso' | 'erro'
type ToastItem = { id: number; texto: string; tipo: ToastTipo }

const ToastContext = createContext<{ mostrar: (texto: string, tipo?: ToastTipo) => void } | null>(null)

let proximoId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ToastItem[]>([])

  const mostrar = useCallback((texto: string, tipo: ToastTipo = 'sucesso') => {
    const id = proximoId++
    setItens((prev) => [...prev, { id, texto, tipo }])
    setTimeout(() => setItens((prev) => prev.filter((i) => i.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ mostrar }}>
      {children}
      <div className="fixed bottom-space-lg right-space-lg z-[200] flex flex-col gap-space-sm">
        {itens.map((i) => (
          <div
            key={i.id}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-xl shadow-2xl text-body-sm font-medium ${
              i.tipo === 'erro' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
            }`}
          >
            <Icon name={i.tipo === 'erro' ? 'error' : 'check_circle'} className="text-[18px]" />
            {i.texto}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx

  return {
    mostrar: (texto: string, tipo: ToastTipo = 'sucesso') => {
      if (tipo === 'erro') {
        toast.error(texto)
      } else {
        toast.success(texto)
      }
    },
  }
}

export function mensagemErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return 'Ocorreu um erro inesperado.'
}
