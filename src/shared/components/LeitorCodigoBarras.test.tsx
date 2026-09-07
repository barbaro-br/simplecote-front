import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, test, beforeEach } from 'vitest'
import { LeitorCodigoBarras } from './LeitorCodigoBarras'

const mockDecode = vi.fn()

vi.mock('@zxing/browser', () => {
  return {
    BrowserMultiFormatReader: class {
      decodeFromConstraints = mockDecode
    },
    NotFoundException: class NotFoundException extends Error {},
  }
})

beforeEach(() => {
  mockDecode.mockReset()
})

test('lê um código de barras com sucesso', async () => {
  mockDecode.mockImplementation((_constraints, _video, callback) => {
    // Simula uma leitura bem sucedida de GTIN
    setTimeout(() => {
      callback({ getText: () => '7891234567890' }, null)
    }, 50)
    return { stop: vi.fn() }
  })
  
  const onRead = vi.fn()
  render(<LeitorCodigoBarras onRead={onRead} onClose={vi.fn()} />)

  await waitFor(() => {
    expect(onRead).toHaveBeenCalledWith('7891234567890')
  })
})

test('exibe mensagem quando a permissão da câmera é negada', async () => {
  mockDecode.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))
  
  render(<LeitorCodigoBarras onRead={vi.fn()} onClose={vi.fn()} />)

  expect(await screen.findByText(/Câmera indisponível ou permissão negada/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
})

test('botão de fechar chama onClose', async () => {
  const mockStop = vi.fn()
  mockDecode.mockResolvedValue({ stop: mockStop })
  
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<LeitorCodigoBarras onRead={vi.fn()} onClose={onClose} />)

  const btn = screen.getByRole('button', { name: 'Fechar câmera' })
  await user.click(btn)

  expect(onClose).toHaveBeenCalled()
})

