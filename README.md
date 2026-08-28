# simplecote-front

Front-end do SimpleCote (React + TypeScript + Vite). Arquitetura pasta-por-feature — ver `spec.md` §5.

## Setup

```bash
npm install
cp .env.example .env.development   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:8080
```

O backend local sobe em `http://localhost:8080` via `./mvnw spring-boot:test-run` no repositório `simplecote-back` (ver `spec.md` §6).

## Scripts

| Comando         | O que faz                                    |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento (Vite + HMR)     |
| `npm test`      | Suíte de testes (Vitest, uma passada)        |
| `npm run build` | Type-check (`tsc -b`) + build de produção    |
| `npm run lint`  | Oxlint                                       |
| `npm run preview` | Serve o `dist/` gerado pelo build          |

## Ambiente

`VITE_API_BASE_URL` — base URL da API. Definida em `.env.development` (local, não versionado);
`.env.example` é o template versionado. Ver `spec.md` §6.
