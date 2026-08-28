# simplecote-front

Front-end do SimpleCote (React + TypeScript + Vite). Arquitetura pasta-por-feature — ver `spec.md` §5.

## Setup

```bash
npm install
cp .env.example .env.development   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:8080
```

O backend local sobe em `http://localhost:8080` via `./mvnw spring-boot:test-run` no repositório `simplecote-back` (ver `spec.md` §6).

## Desenvolvimento local

Roteiro para rodar front + backend juntos, com autenticação real:

1. **Backend** — no repositório `simplecote-back` (requer **Docker** rodando, para o Postgres via Testcontainers):

   ```bash
   AUTH_ENABLED=true ./mvnw spring-boot:test-run
   ```

   Sobe em `http://localhost:8080` com a auth ligada e o perfil de dev, que semeia (`SeedDadosDev`) um admin e alguns dados de exemplo.

2. **Front** — neste repositório:

   ```bash
   cp .env.example .env.development   # VITE_API_BASE_URL=http://localhost:8080
   npm run dev
   ```

3. **Login** — abra `http://localhost:5173/login` e entre com as credenciais semeadas:

   | Campo | Valor |
   | ----- | ----- |
   | E-mail | `admin@dev.local` |
   | Senha | `admin123` |

   O JWT fica em `sessionStorage` e o app redireciona para `/admin`. Recarregar a página mantém a sessão; um `401` numa chamada autenticada leva de volta para `/login`.

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
