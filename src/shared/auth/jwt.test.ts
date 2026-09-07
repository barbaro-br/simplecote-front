import { describe, it, expect } from 'vitest'
import { decodificarClaims } from './jwt'

function payloadBase64Url(json: unknown): string {
  return btoa(JSON.stringify(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('decodificarClaims', () => {
  it('decodifica papel, slug e compradorId do token (base64url)', () => {
    const token = `x.${payloadBase64Url({ papel: 'ADMIN', slug: 'loja-1', compradorId: 'c1' })}.sig`

    expect(decodificarClaims(token)).toEqual({ papel: 'ADMIN', slug: 'loja-1', compradorId: 'c1' })
  })

  it('retorna null para token vazio ou lixo', () => {
    expect(decodificarClaims(null)).toBeNull()
    expect(decodificarClaims('')).toBeNull()
    expect(decodificarClaims('nao-e-um-jwt')).toBeNull()
    expect(decodificarClaims('a.%%%lixo%%%.b')).toBeNull()
  })

  it('papel desconhecido vira null sem derrubar os demais claims', () => {
    const token = `x.${payloadBase64Url({ papel: 'ROOT', slug: 'loja-1' })}.sig`

    expect(decodificarClaims(token)).toEqual({ papel: null, slug: 'loja-1', compradorId: null })
  })
})
