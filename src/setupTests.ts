import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { http, HttpResponse } from 'msw'

configure({ asyncUtilTimeout: 3000 })

// Handlers padrão dos endpoints de auth do refresh token. O `AuthProvider`
// dispara `POST /api/auth/refresh` no boot (e o `logout` dispara `/logout`),
// então todo teste que renderiza `<AuthProvider>` precisa desses defaults para
// não estourar `onUnhandledRequest: 'error'`. Sem cookie → `refresh` responde
// `401` (estado deslogado); `logout` é idempotente → `204`. Testes que precisam
// de sessão sobrescrevem via `server.use(...)`.
export const server = setupServer(
  http.post('*/api/auth/refresh', () => new HttpResponse(null, { status: 401 })),
  http.post('*/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
)

class MockEventSource {
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null;
  onerror: ((this: EventSource, ev: Event) => any) | null = null;
  onopen: ((this: EventSource, ev: Event) => any) | null = null;
  readyState: number = 0;
  url: string = '';
  withCredentials: boolean = false;
  CLOSED: number = 2;
  CONNECTING: number = 0;
  OPEN: number = 1;
  
  constructor(url: string | URL, _eventSourceInitDict?: EventSourceInit) {
    this.url = url.toString();
  }
  
  close(): void {}
  
  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions): void {}
  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions): void {}
  dispatchEvent(_event: Event): boolean { return true; }
}

Object.defineProperty(window, 'EventSource', {
  value: MockEventSource,
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
