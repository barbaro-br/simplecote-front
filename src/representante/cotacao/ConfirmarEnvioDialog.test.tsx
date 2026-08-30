import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ConfirmarEnvioDialog } from './ConfirmarEnvioDialog'

const noop = () => {}

describe('ConfirmarEnvioDialog', () => {
  it('não renderiza nada quando fechado', () => {
    render(
      <ConfirmarEnvioDialog aberto={false} itensSemPreco={2} total={5} aoConfirmar={noop} aoCancelar={noop} />,
    )
    expect(screen.queryByText('Enviar cotação?')).not.toBeInTheDocument()
  })

  it('avisa no singular quando 1 item sem preço', () => {
    render(
      <ConfirmarEnvioDialog aberto itensSemPreco={1} total={5} aoConfirmar={noop} aoCancelar={noop} />,
    )
    expect(screen.getByText(/1 item/)).toBeInTheDocument()
    expect(screen.getByText(/será enviado em branco/)).toBeInTheDocument()
  })

  it('avisa no plural quando vários itens sem preço', () => {
    render(
      <ConfirmarEnvioDialog aberto itensSemPreco={3} total={5} aoConfirmar={noop} aoCancelar={noop} />,
    )
    expect(screen.getByText(/3 itens/)).toBeInTheDocument()
    expect(screen.getByText(/serão enviados em branco/)).toBeInTheDocument()
  })

  it('informa "todos preenchidos" quando não há itens sem preço', () => {
    render(
      <ConfirmarEnvioDialog aberto itensSemPreco={0} total={5} aoConfirmar={noop} aoCancelar={noop} />,
    )
    expect(screen.getByText('Todos os 5 itens estão preenchidos.')).toBeInTheDocument()
  })

  it('"Confirmar" e "Cancelar" chamam os callbacks', async () => {
    const aoConfirmar = vi.fn()
    const aoCancelar = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmarEnvioDialog
        aberto
        itensSemPreco={0}
        total={5}
        aoConfirmar={aoConfirmar}
        aoCancelar={aoCancelar}
      />,
    )

    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(aoConfirmar).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(aoCancelar).toHaveBeenCalledTimes(1)
  })
})
