import { test, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../setupTests'

test('MSW intercepta chamada', async () => {
  server.use(
    http.get('http://localhost:8080/api/teste', () => {
      return HttpResponse.json({ mock: 'ok' })
    })
  )

  const res = await fetch('http://localhost:8080/api/teste')
  const json = await res.json()
  expect(json.mock).toBe('ok')
})
