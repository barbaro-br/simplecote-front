import { describe, it, expect } from 'vitest'
import { montarMensagemConvite, urlWhatsApp, urlMailto } from './compartilhar-link'

describe('compartilhar-link', () => {
  it('monta mensagem com prazo', () => {
    const msg = montarMensagemConvite({
      representanteNome: 'João',
      titulo: 'Cotação de Bebidas',
      empresaNome: 'Mercadinho',
      prazo: '2026-08-30T10:00:00Z',
      link: 'http://localhost/cotacao/123'
    })
    expect(msg).toContain('Olá João, aqui está o link da cotação Cotação de Bebidas da Mercadinho.')
    // Opcional: checar formato de data se bater com a timezone. 
    // Prazo está no texto.
    expect(msg).toContain('O prazo é até ')
    expect(msg).toContain('Acesse: http://localhost/cotacao/123')
  })

  it('monta mensagem sem prazo', () => {
    const msg = montarMensagemConvite({
      representanteNome: 'João',
      titulo: 'Cotação de Bebidas',
      empresaNome: 'Mercadinho',
      prazo: null,
      link: 'http://localhost/cotacao/123'
    })
    expect(msg).toContain('Olá João, aqui está o link da cotação Cotação de Bebidas da Mercadinho.')
    expect(msg).not.toContain('O prazo é até')
    expect(msg).toContain('Acesse: http://localhost/cotacao/123')
  })

  it('monta url WhatsApp com telefone', () => {
    const url = urlWhatsApp('Minha msg', '+55 (11) 98888-7777')
    expect(url).toBe('https://wa.me/5511988887777?text=Minha%20msg')
  })

  it('monta url WhatsApp sem telefone', () => {
    const url = urlWhatsApp('Minha msg')
    expect(url).toBe('https://wa.me/?text=Minha%20msg')
  })

  it('monta url Mailto com destinatário', () => {
    const url = urlMailto('Minha msg', 'Assunto Aqui', 'joao@example.com')
    expect(url).toBe('mailto:joao@example.com?subject=Assunto%20Aqui&body=Minha%20msg')
  })

  it('monta url Mailto sem destinatário', () => {
    const url = urlMailto('Minha msg', 'Assunto Aqui')
    expect(url).toBe('mailto:?subject=Assunto%20Aqui&body=Minha%20msg')
  })
})
