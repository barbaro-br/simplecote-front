/**
 * Design system do painel escuro (change redesign-painel-dark).
 * Ver `openspec/changes/redesign-painel-dark/design.md`.
 *
 * Uso: envolver a área autenticada num wrapper com `data-painel="dark"` para
 * ativar os tokens `--pnl-*` (index.css). Os primitivos têm fallback pros
 * `--brand-*`, então também funcionam soltos (telas de demo da landing).
 */
export { Superficie } from './Superficie'
export { SecaoCabecalho, SubFaixa } from './SecaoCabecalho'
export { Lista, LinhaLista } from './LinhaLista'
export { Selo, type TomSelo } from './Selo'
export { CampoEstat, RodapeAcao } from './CampoEstat'
export { ChipsFiltro, type OpcaoChip } from './ChipsFiltro'
export {
  GradeDados,
  type ColunaGrade,
  type LinhaGrade,
  type CelulaGrade,
} from './GradeDados'
export { BotaoPrimario, BotaoFantasma, BotaoIcone, CampoTexto, Busca } from './controles'
