import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export const server = setupServer()

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
