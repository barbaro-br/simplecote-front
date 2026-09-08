import { z } from 'zod'

// Espelha os DTOs da change backoffice-super-admin e backoffice-metricas-de-uso do back.

export const compradorAdminSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  slug: z.string(),
  statusAssinatura: z.string(),
  criadoEm: z.string(),
  ultimoAcessoEm: z.string().nullable(),
  trialExpiraEm: z.string().nullable(),
  cotacoes: z.number(),
  usuarios: z.number(),
  representantes: z.number(),
  suspenso: z.boolean(),
  // Métricas de uso (change backoffice-metricas-de-uso). `valorTotalComprado`
  // vem na listagem e no detalhe; os demais só no detalhe (nulos na lista).
  valorTotalComprado: z.number(),
  cotacoesPorStatus: z.record(z.string(), z.number()).nullable(),
  primeiraCotacaoEm: z.string().nullable(),
  ultimaAtividadeEm: z.string().nullable(),
})
export const compradorAdminListaSchema = z.array(compradorAdminSchema)
export type CompradorAdmin = z.infer<typeof compradorAdminSchema>

// Resumo de uma cotação da loja (GET /api/admin/compradores/{id}/cotacoes).
export const cotacaoResumoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  status: z.enum(['RASCUNHO', 'ABERTA', 'ENCERRADA', 'PEDIDOS_GERADOS', 'CANCELADA']),
  criadoEm: z.string(),
  encerradoEm: z.string().nullable(),
  qtdItens: z.number(),
  qtdParticipantes: z.number(),
  valorComprado: z.number(),
})
export const cotacaoResumoListaSchema = z.array(cotacaoResumoSchema)
export type CotacaoResumo = z.infer<typeof cotacaoResumoSchema>

// Admin (OWNER/ADMIN) de um Comprador — presente apenas no detalhe.
export const adminCompradorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string(),
  papel: z.enum(['OWNER', 'ADMIN']),
  emailVerificado: z.boolean(),
})
export type AdminComprador = z.infer<typeof adminCompradorSchema>

export const compradorAdminDetalheSchema = compradorAdminSchema.extend({
  admins: z.array(adminCompradorSchema),
})
export type CompradorAdminDetalhe = z.infer<typeof compradorAdminDetalheSchema>

// Status de assinatura (string crua do back; hoje só TESTE, os demais entram
// com planos-cobranca-e-nfse).
export const STATUS_ASSINATURA = ['TESTE', 'ATIVA', 'INADIMPLENTE', 'CANCELADA'] as const

export const ROTULO_STATUS_ASSINATURA: Record<string, string> = {
  TESTE: 'Teste',
  ATIVA: 'Ativa',
  INADIMPLENTE: 'Inadimplente',
  CANCELADA: 'Cancelada',
}

export function rotuloStatus(status: string): string {
  return ROTULO_STATUS_ASSINATURA[status] ?? status
}

// Prazo de teste (change backoffice-prazo-de-teste). `trialExpiraEm` nulo = sem
// prazo. `atencao` = vence em até 7 dias; `vencido` = já passou.
export type NivelPrazo = 'ok' | 'atencao' | 'vencido'

const UM_DIA_MS = 24 * 60 * 60 * 1000

export function prazoLabel(trialExpiraEm: string | null): { texto: string; nivel: NivelPrazo } {
  if (!trialExpiraEm) return { texto: 'Sem prazo', nivel: 'ok' }
  const dias = Math.ceil((new Date(trialExpiraEm).getTime() - Date.now()) / UM_DIA_MS)
  if (dias < 0) {
    const n = -dias
    return { texto: `Expirou há ${n} ${n === 1 ? 'dia' : 'dias'}`, nivel: 'vencido' }
  }
  if (dias <= 7) {
    if (dias === 0) return { texto: 'Expira hoje', nivel: 'atencao' }
    return { texto: `Expira em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, nivel: 'atencao' }
  }
  return { texto: `Expira em ${dias} dias`, nivel: 'ok' }
}

// Resumo do SaaS (change backoffice-resumo-do-saas) — GET /api/admin/resumo.
export const lojasResumoSchema = z.object({
  total: z.number(),
  emTeste: z.number(),
  prazoVencido: z.number(),
  suspensas: z.number(),
})
export type LojasResumo = z.infer<typeof lojasResumoSchema>

export const pontoSerieSchema = z.object({
  data: z.string(),
  qtd: z.number(),
})
export type PontoSerie = z.infer<typeof pontoSerieSchema>

export const funilAtivacaoSchema = z.object({
  cadastraram: z.number(),
  verificaram: z.number(),
  criaramCotacao: z.number(),
  apuraram: z.number(),
})
export type FunilAtivacao = z.infer<typeof funilAtivacaoSchema>

export const resumoSaasSchema = z.object({
  lojas: lojasResumoSchema,
  lojasAtivas30d: z.number(),
  cotacoesNoMes: z.number(),
  gmvTotal: z.number(),
  cadastros30d: z.array(pontoSerieSchema),
  funil: funilAtivacaoSchema,
})
export type ResumoSaas = z.infer<typeof resumoSaasSchema>

// Notas livres do SUPER_ADMIN sobre uma loja (change backoffice-notas-e-auditoria).
export const notaSchema = z.object({
  id: z.string().uuid(),
  texto: z.string(),
  autorSuperAdminId: z.string().uuid(),
  criadoEm: z.string(),
})
export const notaListaSchema = z.array(notaSchema)
export type Nota = z.infer<typeof notaSchema>

// Item da linha do tempo consolidada da loja. `tipo` é a string crua do back
// (cadastro, verificacao, suporte, suspensao, reativacao, prazo_alterado,
// exclusao, nota); `ator` é nome/e-mail quando dá pra resolver, senão nulo.
export const TIPOS_EVENTO = [
  'cadastro',
  'verificacao',
  'suporte',
  'suspensao',
  'reativacao',
  'prazo_alterado',
  'exclusao',
  'nota',
] as const
export type TipoEvento = (typeof TIPOS_EVENTO)[number]

export const timelineItemSchema = z.object({
  tipo: z.string(),
  quando: z.string(),
  ator: z.string().nullable(),
  descricao: z.string(),
})
export const timelineListaSchema = z.array(timelineItemSchema)
export type TimelineItem = z.infer<typeof timelineItemSchema>
