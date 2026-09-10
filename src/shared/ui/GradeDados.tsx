import { useId, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'

/**
 * Tabela de valores do painel (design.md §2): coluna 0 = rótulo do item
 * (título + sub + código), colunas de valor à direita com `tabular-nums`.
 * A célula vencedora/selecionada acende em menta; suporta 1 coluna editável.
 */

export type ColunaGrade = { chave: string; rotulo: ReactNode }

export type CelulaGrade = {
  /** conteúdo principal (valor formatado) */
  valor: ReactNode
  /** linha secundária sob o valor (ex.: "R$ 6,67/un") */
  sub?: ReactNode
  /** acende a célula em menta + caret */
  destaque?: boolean
  /** dispara a animação `flash-green` (só quando `destaque`) */
  flash?: boolean
  /** torna a célula um input controlado; `valor` é ignorado */
  editavel?: { valor: string; aoMudar: (v: string) => void; rotuloA11y: string; placeholder?: string }
}

export type LinhaGrade = {
  chave: string
  /** rótulo do item na coluna 0 */
  titulo: ReactNode
  sub?: ReactNode
  codigo?: ReactNode
  /** uma célula por coluna, na ordem de `colunas` */
  celulas: CelulaGrade[]
}

function Celula({ c }: { c: CelulaGrade }) {
  const id = useId()
  if (c.editavel) {
    return (
      <td className="px-2 py-2 text-right sm:py-2.5">
        <label htmlFor={id} className="sr-only">
          {c.editavel.rotuloA11y}
        </label>
        <input
          id={id}
          inputMode="decimal"
          value={c.editavel.valor}
          placeholder={c.editavel.placeholder}
          onChange={(e) => c.editavel!.aoMudar(e.target.value)}
          className="h-8 w-20 rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] px-2 text-right text-[13px] tabular-nums text-[var(--pnl-txt,#fff)] placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] focus:outline-none focus:ring-1 focus:ring-[var(--pnl-acento,#57bf8e)]/50"
        />
      </td>
    )
  }
  return (
    <td className="px-2 py-2 text-right sm:py-2.5">
      <span
        className={cn(
          'inline-flex flex-col items-end rounded-md px-2 py-1 text-[13px] tabular-nums transition-colors duration-500',
          c.destaque
            ? 'bg-[var(--pnl-acento,#57bf8e)]/15 font-semibold text-[var(--pnl-acento-hi,#6fe6ac)] ring-1 ring-[var(--pnl-acento,#57bf8e)]/40'
            : 'text-[var(--pnl-txt-2,rgba(255,255,255,0.6))]',
          c.destaque && c.flash && 'flash-green',
        )}
      >
        <span className="inline-flex items-center gap-1">
          {c.destaque && <CaretDown className="size-3" weight="bold" aria-hidden />}
          {c.valor}
        </span>
        {c.sub != null && (
          <span
            className={cn(
              'text-[10px] font-normal',
              c.destaque
                ? 'text-[var(--pnl-acento-hi,#6fe6ac)]/70'
                : 'text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]',
            )}
          >
            {c.sub}
          </span>
        )}
      </span>
    </td>
  )
}

export function GradeDados({
  colunas,
  linhas,
  rotuloItem = 'Item',
  rodape,
  minWidth = 400,
  className,
}: {
  colunas: ColunaGrade[]
  linhas: LinhaGrade[]
  rotuloItem?: ReactNode
  /** linha extra ao fim do corpo (ex.: "+ adicionar item") */
  rodape?: ReactNode
  minWidth?: number
  className?: string
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-left', className)}
        style={{ minWidth }}
      >
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            <th className="px-4 py-2 font-medium sm:px-5">{rotuloItem}</th>
            {colunas.map((col) => (
              <th key={col.chave} className="px-2 py-2 text-right font-medium">
                {col.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr
              key={linha.chave}
              className="border-t border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] align-top"
            >
              <td className="whitespace-nowrap px-4 py-2 sm:px-5 sm:py-2.5">
                <div className="text-[13px] font-semibold text-[var(--pnl-txt,#fff)]">
                  {linha.titulo}
                </div>
                {linha.sub != null && (
                  <div className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                    {linha.sub}
                  </div>
                )}
                {linha.codigo != null && (
                  <div className="mt-0.5 font-mono text-[10px] tracking-tight text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                    {linha.codigo}
                  </div>
                )}
              </td>
              {linha.celulas.map((c, i) => (
                <Celula key={colunas[i]?.chave ?? i} c={c} />
              ))}
            </tr>
          ))}
          {rodape != null && (
            <tr className="border-t border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              <td colSpan={colunas.length + 1} className="px-4 py-2 sm:px-5">
                {rodape}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
