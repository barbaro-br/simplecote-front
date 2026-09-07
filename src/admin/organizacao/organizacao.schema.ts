import { z } from 'zod'
import { ROTULO_PAPEL, type Papel } from '@/shared/domain/papel'

// Espelha os DTOs da change organizacao-papeis-e-convites do back.

export const papelOrganizacaoSchema = z.enum(['OWNER', 'ADMIN', 'OPERADOR'])
export type PapelOrganizacao = z.infer<typeof papelOrganizacaoSchema>

export const statusMembroSchema = z.enum(['ATIVO', 'INATIVO', 'CONVITE_PENDENTE'])
export type StatusMembro = z.infer<typeof statusMembroSchema>

// Item de GET /api/organizacao/membros. Para convite pendente, `id` é o id do
// convite e `nome` é nulo; para um Usuario, `id` é o id do Usuario.
export const membroSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().nullable(),
  email: z.string(),
  papel: papelOrganizacaoSchema,
  status: statusMembroSchema,
})
export const membroListaSchema = z.array(membroSchema)
export type Membro = z.infer<typeof membroSchema>

// Corpo de POST /api/organizacao/convites: papel ∈ {ADMIN, OPERADOR}.
export const convidarSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  papel: z.enum(['ADMIN', 'OPERADOR']),
})
export type ConvidarValues = z.infer<typeof convidarSchema>

// Corpo de POST /public/convites/{token}: só a senha (a conta nasce do convite).
export const aceitarConviteSchema = z.object({
  senha: z.string().min(1, 'Informe a senha').min(8, 'A senha deve ter ao menos 8 caracteres'),
})
export type AceitarConviteValues = z.infer<typeof aceitarConviteSchema>

// Contexto de GET /public/convites/{token}.
export const conviteContextoSchema = z.object({
  nomeLoja: z.string(),
  papel: papelOrganizacaoSchema,
})
export type ConviteContexto = z.infer<typeof conviteContextoSchema>

export const ROTULO_STATUS: Record<StatusMembro, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  CONVITE_PENDENTE: 'Convite pendente',
}

export function rotuloPapel(papel: Papel): string {
  return ROTULO_PAPEL[papel]
}
