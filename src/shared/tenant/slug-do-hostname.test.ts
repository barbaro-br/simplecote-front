import { describe, it, expect } from 'vitest'
import {
  decidirRedirectTenant,
  ehHostBackoffice,
  ehHostDoApp,
  extrairSlugDoHostname,
} from './slug-do-hostname'

describe('extrairSlugDoHostname', () => {
  it('extrai o slug de <slug>.simplecote.app', () => {
    expect(extrairSlugDoHostname('supermercado-do-ze.simplecote.app')).toBe('supermercado-do-ze')
  })

  it('trata hosts sem loja como null', () => {
    expect(extrairSlugDoHostname('simplecote.app')).toBeNull() // apex
    expect(extrairSlugDoHostname('app.simplecote.app')).toBeNull()
    expect(extrairSlugDoHostname('www.simplecote.app')).toBeNull()
    expect(extrairSlugDoHostname('backoffice.simplecote.app')).toBeNull()
  })

  it('trata localhost e preview da Vercel como null', () => {
    expect(extrairSlugDoHostname('localhost')).toBeNull()
    expect(extrairSlugDoHostname('simplecote-front.vercel.app')).toBeNull()
  })

  it('trata subdomínio multi-nível como null', () => {
    expect(extrairSlugDoHostname('a.b.simplecote.app')).toBeNull()
  })

  it('trata slugs reservados como null', () => {
    expect(extrairSlugDoHostname('admin.simplecote.app')).toBeNull()
    expect(extrairSlugDoHostname('api.simplecote.app')).toBeNull()
  })

  it('ignora porta e maiúsculas', () => {
    expect(extrairSlugDoHostname('Loja.SimpleCote.App:3000')).toBe('loja')
  })
})

describe('ehHostDoApp', () => {
  it('reconhece hosts .simplecote.app (inclusive apex)', () => {
    expect(ehHostDoApp('loja.simplecote.app')).toBe(true)
    expect(ehHostDoApp('app.simplecote.app')).toBe(true)
    expect(ehHostDoApp('simplecote.app')).toBe(true)
  })

  it('não reconhece localhost nem preview', () => {
    expect(ehHostDoApp('localhost')).toBe(false)
    expect(ehHostDoApp('simplecote-front.vercel.app')).toBe(false)
  })
})

describe('ehHostBackoffice', () => {
  it('reconhece o host reservado do backoffice', () => {
    expect(ehHostBackoffice('backoffice.simplecote.app')).toBe(true)
  })

  it('não confunde com outros hosts', () => {
    expect(ehHostBackoffice('loja.simplecote.app')).toBe(false)
    expect(ehHostBackoffice('app.simplecote.app')).toBe(false)
    expect(ehHostBackoffice('simplecote.app')).toBe(false)
    expect(ehHostBackoffice('localhost')).toBe(false)
  })
})

describe('decidirRedirectTenant', () => {
  it('slugs iguais → ok', () => {
    expect(decidirRedirectTenant('loja-a', 'loja-a', true)).toEqual({ tipo: 'ok' })
    expect(decidirRedirectTenant(null, null, true)).toEqual({ tipo: 'ok' })
  })

  it('slug divergente em host do app → redireciona para o subdomínio do JWT', () => {
    expect(decidirRedirectTenant('loja-b', 'loja-a', true)).toEqual({
      tipo: 'redirecionar',
      destino: 'https://loja-a.simplecote.app',
    })
  })

  it('host neutro com sessão → redireciona para o subdomínio do JWT', () => {
    expect(decidirRedirectTenant(null, 'loja-a', true)).toEqual({
      tipo: 'redirecionar',
      destino: 'https://loja-a.simplecote.app',
    })
  })

  it('slug divergente fora do app (dev/preview) → ok (sem redirecionar)', () => {
    expect(decidirRedirectTenant('loja-b', 'loja-a', false)).toEqual({ tipo: 'ok' })
  })

  it('slug do JWT ausente em host do app → ok (o back escopa pelo JWT)', () => {
    expect(decidirRedirectTenant('loja-b', null, true)).toEqual({ tipo: 'ok' })
  })
})
