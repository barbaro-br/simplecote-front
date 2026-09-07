import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { CadastroFormValues } from './cadastro.schema'

// Contrato da change `cadastro-publico-e-slug` do back (section 0 do tasks.md).
// - POST /public/cadastro          → 201 sem corpo (Comprador TESTE + OWNER + e-mail)
// - GET  /public/compradores/validar-slug?slug= → enum como string JSON pura
// - POST /public/cadastro/verificar → { slug }

export type SlugDisponibilidade = 'LIVRE' | 'EM_USO' | 'RESERVADO' | 'INVALIDO'

export type VerificarEmailResponse = { slug: string }

async function cadastrar(valores: CadastroFormValues): Promise<void> {
  await api.post<void>('/public/cadastro', {
    nomeSupermercado: valores.nomeSupermercado,
    slug: valores.slug,
    email: valores.email,
    senha: valores.senha,
  })
}

export function useCadastrar() {
  return useMutation({ mutationFn: cadastrar })
}

async function validarSlug(slug: string): Promise<SlugDisponibilidade> {
  return api.get<SlugDisponibilidade>(
    `/public/compradores/validar-slug?slug=${encodeURIComponent(slug)}`,
  )
}

export function useValidarSlug(slug: string | null) {
  return useQuery({
    queryKey: ['public', 'validar-slug', slug],
    queryFn: () => validarSlug(slug as string),
    enabled: slug !== null,
  })
}

async function verificarEmail(token: string): Promise<VerificarEmailResponse> {
  return api.post<VerificarEmailResponse>('/public/cadastro/verificar', { token })
}

// POST com side-effect executado uma única vez no mount — `retry: false` para
// não reprocessar o token (uso único) em caso de falha transitória.
export function useVerificarEmail(token: string) {
  return useQuery({
    queryKey: ['public', 'verificar-email', token],
    queryFn: () => verificarEmail(token),
    enabled: token.length > 0,
    retry: false,
  })
}
