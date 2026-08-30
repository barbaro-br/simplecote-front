import { render, screen } from '@testing-library/react'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('não desenha linha se tiver 0 ou 1 ponto', () => {
    const { unmount } = render(<Sparkline pontos={[]} />)
    expect(screen.queryByTestId('sparkline-polyline')).not.toBeInTheDocument()
    expect(screen.getByTestId('sparkline-empty')).toBeInTheDocument()
    unmount()

    render(<Sparkline pontos={[10]} />)
    expect(screen.queryByTestId('sparkline-polyline')).not.toBeInTheDocument()
    expect(screen.getByTestId('sparkline-empty')).toBeInTheDocument()
  })

  it('desenha polyline com as coordenadas corretas para 3 pontos', () => {
    render(<Sparkline pontos={[10, 20, 10]} />)
    const polyline = screen.getByTestId('sparkline-polyline')
    expect(polyline).toBeInTheDocument()
    // min: 10, max: 20
    // w: 60, h: 20
    // p0: 10 -> (0, 20)
    // p1: 20 -> (30, 0)
    // p2: 10 -> (60, 20)
    expect(polyline).toHaveAttribute('points', '0.0,20.0 30.0,0.0 60.0,20.0')
  })
})
