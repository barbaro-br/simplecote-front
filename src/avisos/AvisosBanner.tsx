import { useState } from 'react'
import { Info, Warning, WarningOctagon, X, type Icon } from '@phosphor-icons/react'
import { useAvisosVigentes } from './avisos.api'
import type { NivelAviso } from './avisos.schema'

const CHAVE_DISPENSADOS = 'avisos-dispensados'

const ESTILO_NIVEL: Record<NivelAviso, { classe: string; Icone: Icon }> = {
  INFO: { classe: 'border-primary/30 bg-primary/10', Icone: Info },
  ATENCAO: { classe: 'border-warning/30 bg-warning/10 text-warning', Icone: Warning },
  CRITICO: { classe: 'border-destructive/30 bg-destructive/10 text-destructive', Icone: WarningOctagon },
}

function lerDispensados(): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE_DISPENSADOS)
    if (!bruto) return []
    const parsed = JSON.parse(bruto)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function gravarDispensados(ids: string[]): void {
  try {
    localStorage.setItem(CHAVE_DISPENSADOS, JSON.stringify(ids))
  } catch {
    // localStorage indisponível — o estado fica só em memória nesta sessão
  }
}

export function AvisosBanner() {
  const { data: avisos } = useAvisosVigentes()
  const [dispensados, setDispensados] = useState<string[]>(() => lerDispensados())

  function dispensar(id: string) {
    setDispensados((atual) => {
      if (atual.includes(id)) return atual
      const novo = [...atual, id]
      gravarDispensados(novo)
      return novo
    })
  }

  const visiveis = (avisos ?? []).filter((a) => !dispensados.includes(a.id))
  if (!visiveis.length) return null

  return (
    <div className="space-y-2">
      {visiveis.map((aviso) => {
        const { classe, Icone } = ESTILO_NIVEL[aviso.nivel]
        return (
          <div
            key={aviso.id}
            role="status"
            className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm ${classe}`}
          >
            <div className="flex items-start gap-2">
              <Icone className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div className="space-y-0.5">
                <p className="font-semibold ui-uppercase">{aviso.titulo}</p>
                <p className="text-muted-foreground">{aviso.corpo}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dispensar aviso"
              onClick={() => dispensar(aviso.id)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
