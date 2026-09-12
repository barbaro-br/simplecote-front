import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { definirToken } from '@/shared/api/api-client'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function jwtSuporte(expEmSegundos = Math.floor(Date.now() / 1000) + 30 * 60): string {
  const payload = btoa(
    JSON.stringify({ papel: 'ADMIN', compradorId: 'c-suporte', impersonatedBy: 'super-1', exp: expEmSegundos }),
  )
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

// A chave no localStorage é sufixada por um id de aba guardado em `window.name`
// (AuthContext.tsx `idDaAba()`) — fixamos `window.name` num valor conhecido
// pra cada teste poder ler/escrever a mesma chave que o `AuthProvider` usa.
const ID_ABA_TESTE = 'aba-teste'
const CHAVE_TOKEN_SUPORTE = `simplecote:token-suporte:${ID_ABA_TESTE}`

function Sonda() {
  const { token, isAutenticado, carregando, modoSuporte, login, logout, entrarComoSuporte, sairModoSuporte } =
    useAuth()
  return (
    <div>
      <span data-testid="autenticado">{isAutenticado ? 'sim' : 'nao'}</span>
      <span data-testid="carregando">{carregando ? 'sim' : 'nao'}</span>
      <span data-testid="token">{token ?? ''}</span>
      <span data-testid="modo-suporte">{modoSuporte ? 'sim' : 'nao'}</span>
      <button onClick={() => login('admin@simplecote.com', 'senha123')}>entrar</button>
      <button onClick={() => logout()}>sair</button>
      <button onClick={() => entrarComoSuporte(jwtSuporte())}>entrar como suporte</button>
      <button onClick={() => sairModoSuporte()}>sair do suporte</button>
    </div>
  )
}

function renderComProvider() {
  return render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  )
}

test('boot com refresh ok restaura a sessão sem passar pelo login', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-refresh' })))

  renderComProvider()

  expect(screen.getByTestId('carregando')).toHaveTextContent('sim')

  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-refresh')
})

test('boot sem cookie de refresh → estado deslogado após carregando', async () => {
  // default handler em setupTests.ts: refresh → 401 (sem cookie)
  renderComProvider()

  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')
  expect(screen.getByTestId('token')).toHaveTextContent('')
})

test('login() guarda o access token em memória e liga isAutenticado', async () => {
  server.use(http.post('*/api/auth/login', () => HttpResponse.json({ token: 'jwt-x' })))
  const user = userEvent.setup()

  renderComProvider()
  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')

  await user.click(screen.getByRole('button', { name: 'entrar' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-x')
})

test('logout() chama POST /api/auth/logout e limpa o estado local', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-refresh' })))
  let hitsLogout = 0
  server.use(
    http.post('*/api/auth/logout', () => {
      hitsLogout += 1
      return new HttpResponse(null, { status: 204 })
    })
  )
  const user = userEvent.setup()

  renderComProvider()
  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  })

  await user.click(screen.getByRole('button', { name: 'sair' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('')
  expect(hitsLogout).toBe(1)
})

// Regressão: reload em modo suporte voltava pro backoffice (perdia o modo).
// O token de suporte é impersonação — não é renovável pelo cookie do
// SUPER_ADMIN — então precisa sobreviver ao reload por fora do estado do React.
describe('modo suporte sobrevive a um reload', () => {
  beforeEach(() => {
    // `window.name` (id de aba) e `accessToken` de api-client.ts são
    // módulo/browsing-context-level e sobrevivem entre testes (renovarSessao
    // recusa renovar um token de impersonação — sem isto, um teste anterior
    // que entrou em modo suporte "vaza" pro boot do próximo).
    window.name = `simplecote-aba:${ID_ABA_TESTE}`
    localStorage.removeItem(CHAVE_TOKEN_SUPORTE)
    definirToken(null)
  })

  test('entrarComoSuporte() salva o token em localStorage', async () => {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-admin' })))
    const user = userEvent.setup()
    renderComProvider()
    await waitFor(() => expect(screen.getByTestId('autenticado')).toHaveTextContent('sim'))

    await user.click(screen.getByRole('button', { name: 'entrar como suporte' }))

    await waitFor(() => expect(screen.getByTestId('modo-suporte')).toHaveTextContent('sim'))
    expect(localStorage.getItem(CHAVE_TOKEN_SUPORTE)).toBe(jwtSuporte())
  })

  test('boot com token de suporte salvo restaura o modo suporte sem chamar /refresh', async () => {
    localStorage.setItem(CHAVE_TOKEN_SUPORTE, jwtSuporte())
    let hitsRefresh = 0
    server.use(
      http.post('*/api/auth/refresh', () => {
        hitsRefresh += 1
        return HttpResponse.json({ token: 'jwt-admin' })
      }),
    )

    renderComProvider()

    await waitFor(() => expect(screen.getByTestId('carregando')).toHaveTextContent('nao'))
    expect(screen.getByTestId('modo-suporte')).toHaveTextContent('sim')
    expect(screen.getByTestId('token')).toHaveTextContent(jwtSuporte())
    expect(hitsRefresh).toBe(0)
  })

  test('sairModoSuporte() limpa o token de suporte salvo', async () => {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-admin' })))
    const user = userEvent.setup()
    renderComProvider()
    await waitFor(() => expect(screen.getByTestId('autenticado')).toHaveTextContent('sim'))
    await user.click(screen.getByRole('button', { name: 'entrar como suporte' }))
    await waitFor(() => expect(screen.getByTestId('modo-suporte')).toHaveTextContent('sim'))

    await user.click(screen.getByRole('button', { name: 'sair do suporte' }))

    await waitFor(() => expect(screen.getByTestId('modo-suporte')).toHaveTextContent('nao'))
    expect(localStorage.getItem(CHAVE_TOKEN_SUPORTE)).toBeNull()
  })

  test('logout() também limpa o token de suporte salvo', async () => {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-admin' })))
    const user = userEvent.setup()
    renderComProvider()
    await waitFor(() => expect(screen.getByTestId('autenticado')).toHaveTextContent('sim'))
    await user.click(screen.getByRole('button', { name: 'entrar como suporte' }))
    await waitFor(() => expect(screen.getByTestId('modo-suporte')).toHaveTextContent('sim'))

    await user.click(screen.getByRole('button', { name: 'sair' }))

    await waitFor(() => expect(screen.getByTestId('autenticado')).toHaveTextContent('nao'))
    expect(localStorage.getItem(CHAVE_TOKEN_SUPORTE)).toBeNull()
  })

  // Regressão do próprio fix: `localStorage` é compartilhado entre abas — a
  // chave precisa ser isolada por aba (via `window.name`), senão duas abas de
  // suporte em lojas diferentes pisariam uma na chave da outra.
  test('token salvo por outra aba (window.name diferente) não é lido nesta', async () => {
    window.name = 'simplecote-aba:outra-aba'
    localStorage.setItem('simplecote:token-suporte:outra-aba', jwtSuporte())
    window.name = `simplecote-aba:${ID_ABA_TESTE}`

    renderComProvider()

    await waitFor(() => expect(screen.getByTestId('carregando')).toHaveTextContent('nao'))
    expect(screen.getByTestId('modo-suporte')).toHaveTextContent('nao')

    localStorage.removeItem('simplecote:token-suporte:outra-aba')
  })

  // `limparTokensExpirados()` varre e remove entradas de qualquer aba (a desta
  // inclusive) cujo token já expirou — evita acúmulo indefinido no
  // `localStorage` de abas fechadas sem passar por `sairModoSuporte`/`logout`.
  test('salvarTokenSuporte varre e remove tokens de suporte já expirados de outras abas', async () => {
    const jaExpirado = jwtSuporte(Math.floor(Date.now() / 1000) - 60)
    localStorage.setItem('simplecote:token-suporte:aba-fechada', jaExpirado)
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-admin' })))
    const user = userEvent.setup()
    renderComProvider()
    await waitFor(() => expect(screen.getByTestId('autenticado')).toHaveTextContent('sim'))

    await user.click(screen.getByRole('button', { name: 'entrar como suporte' }))

    await waitFor(() => expect(screen.getByTestId('modo-suporte')).toHaveTextContent('sim'))
    expect(localStorage.getItem('simplecote:token-suporte:aba-fechada')).toBeNull()
  })
})

test('useAuth() fora do <AuthProvider> lança erro explicativo', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<Sonda />)).toThrow(/AuthProvider/)

  spy.mockRestore()
})
