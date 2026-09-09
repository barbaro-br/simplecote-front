import { ArrowClockwise, CheckCircle, Eye, PaperPlaneTilt } from '@phosphor-icons/react'
import { TelaCard } from './TelaCard'

type Status = 'respondeu' | 'visualizou' | 'enviado'

const REPRESENTANTES: { empresa: string; ramo: string; status: Status }[] = [
  { empresa: 'Hortifruti Boa Safra', ramo: 'Hortifruti', status: 'respondeu' },
  { empresa: 'Distribuidora Aurora', ramo: 'Mercearia', status: 'respondeu' },
  { empresa: 'Meridiano Atacado', ramo: 'Bebidas', status: 'visualizou' },
  { empresa: 'Rede Litoral', ramo: 'Mercearia', status: 'respondeu' },
  { empresa: 'Frigorífico Serra', ramo: 'Carnes', status: 'enviado' },
]

const CHIP: Record<Status, { texto: string; classe: string; Icone: typeof CheckCircle }> = {
  respondeu: { texto: 'Respondeu', classe: 'text-brand-mint-bright bg-brand-mint/15 ring-brand-mint/30', Icone: CheckCircle },
  visualizou: { texto: 'Visualizou', classe: 'text-warning bg-warning/10 ring-warning/30', Icone: Eye },
  enviado: { texto: 'Convite enviado', classe: 'text-white/60 bg-white/5 ring-white/15', Icone: PaperPlaneTilt },
}

export function RepresentantesDemo() {
  const responderam = REPRESENTANTES.filter((r) => r.status === 'respondeu').length

  return (
    <TelaCard titulo="Representantes">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px] text-white/50 sm:px-5">
        <span>Convites da cotação</span>
        <span className="text-white/70">
          {responderam} de {REPRESENTANTES.length} responderam
        </span>
      </div>
      <ul className="divide-y divide-white/[0.07]">
        {REPRESENTANTES.map(({ empresa, ramo, status }) => {
          const chip = CHIP[status]
          const pendente = status !== 'respondeu'
          return (
            <li key={empresa} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-white/70">
                {empresa.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-white">{empresa}</div>
                <div className="text-[11px] text-white/40">{ramo}</div>
              </div>
              {pendente && (
                <span className="hidden items-center gap-1 text-[11px] text-white/45 sm:inline-flex">
                  <ArrowClockwise className="size-3" aria-hidden />
                  reenviar
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${chip.classe}`}
              >
                <chip.Icone className="size-3" weight="fill" aria-hidden />
                {chip.texto}
              </span>
            </li>
          )
        })}
      </ul>
    </TelaCard>
  )
}
