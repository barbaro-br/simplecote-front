import { WhatsappLogo } from '@phosphor-icons/react'
import { TelaCard } from './TelaCard'

const RAMOS = ['Hortifruti', 'Mercearia', 'Bebidas', 'Carnes', 'Limpeza'] as const

const EMPRESAS: { nome: string; ramo: (typeof RAMOS)[number]; contato: string }[] = [
  { nome: 'Hortifruti Boa Safra', ramo: 'Hortifruti', contato: '(38) 9 9911-2200' },
  { nome: 'Distribuidora Aurora', ramo: 'Mercearia', contato: '(11) 9 8123-4455' },
  { nome: 'Meridiano Atacado', ramo: 'Bebidas', contato: '(31) 9 9740-1188' },
  { nome: 'Rede Litoral', ramo: 'Mercearia', contato: '(27) 9 9666-0432' },
  { nome: 'Frigorífico Serra', ramo: 'Carnes', contato: '(34) 9 9502-7781' },
  { nome: 'CleanMax Suprimentos', ramo: 'Limpeza', contato: '(11) 9 9333-1290' },
]

export function EmpresasDemo() {
  return (
    <TelaCard titulo="Empresas">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px] text-white/50 sm:px-5">
        <span>Fornecedores cadastrados</span>
        <span className="text-white/70">{EMPRESAS.length} · 5 ramos</span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-white/[0.07] px-4 py-3 sm:px-5">
        {RAMOS.map((ramo, i) => (
          <span
            key={ramo}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              i === 0
                ? 'bg-brand-mint/15 text-brand-mint-bright ring-1 ring-inset ring-brand-mint/30'
                : 'bg-white/[0.06] text-white/55'
            }`}
          >
            {ramo}
          </span>
        ))}
      </div>

      <ul className="divide-y divide-white/[0.07]">
        {EMPRESAS.map(({ nome, ramo, contato }) => (
          <li key={nome} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-white/70">
              {nome.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">{nome}</div>
              <div className="text-[11px] text-white/40">{ramo}</div>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] tabular-nums text-white/45 sm:inline-flex">
              <WhatsappLogo className="size-3.5 text-brand-mint" weight="fill" aria-hidden />
              {contato}
            </span>
          </li>
        ))}
      </ul>
    </TelaCard>
  )
}
