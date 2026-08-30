import { z } from 'zod'

export const papelSchema = z.enum(['ADMIN', 'OPERADOR'])
export type Papel = z.infer<typeof papelSchema>

// Espelha UsuarioResponse do backend (GET /v3/api-docs).
export const usuarioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string(),
  papel: papelSchema,
  ativo: z.boolean(),
})

export const usuarioListaSchema = z.array(usuarioSchema)

export type Usuario = z.infer<typeof usuarioSchema>

// Um schema pro form (criar e editar). `senha` só é exigida no modo criar — a
// checagem de `min(8)` fica no componente (o campo nem aparece no editar), no
// mesmo padrão do `EmpresaForm`.
export const usuarioFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  papel: papelSchema,
  senha: z.string().optional(),
})
export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>

export const SENHA_MIN = 8

// `confirmar` nunca sai do cliente — só serve pro refine de igualdade.
export const redefinirSenhaFormSchema = z
  .object({
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmar: z.string(),
  })
  .refine((v) => v.senha === v.confirmar, {
    message: 'As senhas não conferem',
    path: ['confirmar'],
  })
export type RedefinirSenhaFormValues = z.infer<typeof redefinirSenhaFormSchema>

export const ROTULO_PAPEL: Record<Papel, string> = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
}
