# Infra: domínio `simplecote.com.br` + assuntos parados

> Criado em 2026-09-06. Serve de runbook pro domínio e de estacionamento pros temas
> que decidimos ver depois (email, VPS, multi-tenant, modelagem de representante).

---

## 1. Estado atual (fatos)

| Peça | Valor |
|------|-------|
| Front | Vercel, projeto `simplecote-front`, alias `https://simplecote-front.vercel.app` |
| Back | Heroku, app `immense-badlands-31311`, `https://immense-badlands-31311-934249812234.herokuapp.com` (o sufixo numérico é só na URL, não no nome do app) |
| Deploy front | GitHub Actions (`.github/workflows/deploy.yml`) → `vercel deploy --prebuilt --prod`. Integração git da Vercel desligada pra `main` (`vercel.json`). |
| Deploy back | GitHub Actions no repo `simplecote-back`, push em `origin` (nunca `git push heroku`) |
| `VITE_API_BASE_URL` | fixado no `deploy.yml` (linha ~19), embutido no bundle em build time |
| Contrato back→front | back lê `SIMPLECOTE_CORS_ORIGINS` (CORS) e `SIMPLECOTE_BASE_URL` (domínio dos links mágicos `/cotacao/:token`) |
| Domínio | `simplecote.com.br` registrado no registro.br (usuário FRMON150), expira 06/09/2027, status Publicado. DNS ainda não configurado. |

---

## 2. Alvo

| Host | Aponta pra | Uso |
|------|-----------|-----|
| `app.simplecote.com.br` | Vercel (front) | endereço principal da aplicação |
| `api.simplecote.com.br` | Heroku (back) | API |
| `simplecote.com.br` (apex) | Vercel | por ora redireciona pro `app`; no futuro vira landing/site |
| `www.simplecote.com.br` | Vercel | redireciona pro `app` |

DNS: usar o **DNS do próprio registro.br** (menos partes móveis, publica em minutos, sem
criar conta nem trocar nameserver). Cloudflare é um upgrade opcional pra depois (painel
melhor, regras de redirect, facilita os registros de email) — trocar os nameservers no
registro.br quando/se quiser.

Proxy: se um dia migrar pra Cloudflare, deixar `app` e `api` como **DNS only (nuvem
cinza)** — Vercel e o ACM do Heroku precisam enxergar o CNAME direto pra emitir o
certificado.

---

## 3. Passo a passo (fazer agora)

### 3.1 registro.br — zona DNS
Painel → `SIMPLECOTE.COM.BR` → DNS → **Modo avançado** ("Configurar zona DNS"). Botão
**Nova Entrada** por linha, **Salvar Alterações** no final. Adicionar:

| Tipo | Nome | Dados |
|------|------|-------|
| CNAME | `app` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `api` | `systematic-squirrel-sulmebktdtv835y4qxhzl23y.herokudns.com` |
| A | *(em branco)* | `76.76.21.21` |

> - registro.br **não aceita `@`** nem `*` — o apex vai com o campo **Nome em branco**.
> - Se reclamar do CNAME, usar ponto final: `cname.vercel-dns.com.`
> - Domínio recém-registrado fica ~2h "em transição" antes de deixar editar a zona.
> - Use o valor exato que a tela "Add Domain" da Vercel mostrar. Hoje é `A 76.76.21.21`
>   pro apex e `CNAME cname.vercel-dns.com` pros subdomínios. O `api` entra no passo 3.3.

### 3.2 Vercel — domínios do projeto
Projeto `simplecote-front` → Settings → Domains → Add:
- `app.simplecote.com.br` → marcar como **Primary**
- `simplecote.com.br`
- `www.simplecote.com.br`

A Vercel emite os certificados e passa a redirecionar apex + www → `app`. Esperar
todos ficarem "Valid Configuration". O alias `simplecote-front.vercel.app` continua
funcionando (o smoke test do `deploy.yml` usa ele).

### 3.3 Heroku — domínio da API
Já feito: `heroku domains:add api.simplecote.com.br -a immense-badlands-31311`.
Alvo retornado (usar no CNAME `api` da tabela acima):

```
systematic-squirrel-sulmebktdtv835y4qxhzl23y.herokudns.com
```

Depois do CNAME salvo e propagado:
```
heroku domains:wait api.simplecote.com.br -a immense-badlands-31311
heroku certs:auto:enable -a immense-badlands-31311
```
Esperar o cert ficar OK. Testar:
```
curl -I https://api.simplecote.com.br/actuator/health   # 200
```

### 3.4 Ligações que dependem do DNS já no ar

**Front — `.github/workflows/deploy.yml` (linha ~19):**
```yaml
env:
  VITE_API_BASE_URL: https://api.simplecote.com.br
```
Commit + push → CI rebuilda o bundle com a nova base. O step "Smoke" confirma que o
bundle publicado fala com o novo host.

**Back — config vars no Heroku (repo `simplecote-back`):**
```
SIMPLECOTE_CORS_ORIGINS  → incluir https://app.simplecote.com.br
SIMPLECOTE_BASE_URL      → https://app.simplecote.com.br
```
(`SIMPLECOTE_BASE_URL` muda o domínio dos links mágicos enviados aos representantes —
conferir num convite de teste depois.)

### 3.5 Verificação final
1. Abrir `https://app.simplecote.com.br`, logar em `/login`.
2. Aba Network: chamadas vão pra `https://api.simplecote.com.br`, sem erro de CORS.
3. Recarregar em `/admin/cotacoes` e num link `/cotacao/<token>` — as duas rotas resolvem (SPA fallback).
4. `https://simplecote.com.br` e `https://www.simplecote.com.br` redirecionam pro `app`.

### Ordem e tempo
registro.br publica a zona em minutos. Cert da Vercel: minutos após o DNS resolver.
Cert do Heroku (ACM): minutos a ~1h. Não há domínio custom hoje, então não há downtime.

---

## 4. Pra depois (decisões estacionadas)

### 4.1 Email transacional
- Hoje: Brevo com o Gmail no meio. Incômodo = a amarração com o Gmail, não o Brevo.
- Agora que existe domínio, dá pra resolver dos dois jeitos:
  - **Manter o Brevo**: verificar `simplecote.com.br` no Brevo, configurar SPF/DKIM
    (registros que o Brevo fornece), mandar de `naoresponda@simplecote.com.br` pela
    API/SMTP do Brevo — tira o Gmail da jogada, mesma simplicidade.
  - **Migrar pro Resend**: DNS (SPF/DKIM) + API key, ~10 min, log de cada email +
    webhooks. Free 3.000/mês (100/dia); US$ 20 → 50k/mês.
- **Não** conectar direto no Gmail (limite 500/dia, entregabilidade ruim, zero monitor).
- **Não** self-hostar (Postal/Maddy) — vira responsável por reputação de IP, é mais ops.
- Decidir com o volume/mês real em mãos.

### 4.2 Heroku + Vercel vs VPS
**Decisão: fica no PaaS.** VPS = virar sysadmin (patch de SO, SSL, backup, monitor,
incidente 3h da manhã) e o crédito do Student Pack dura ~1 ano. Se o custo do Heroku
incomodar, o movimento é lateral pra outro PaaS (Render, Railway, DigitalOcean App
Platform com o crédito de US$ 200), não pra droplet cru.

### 4.3 SaaS multi-tenant
- É arquitetura de aplicação, não de infra — roda no stack atual.
- Construir a v1 já com **`cliente_id` (ou `tenant_id`) em toda tabela**, mesmo com um
  cliente só (o supermercado de Januária). Aí "virar SaaS" = adicionar tela de
  cadastro, não reescrever.
- Login → buscar o vínculo usuário↔empresa → guardar `empresa_id`/`cliente_id` na
  sessão/JWT → **toda query filtrada por ele**.
- Subdomínio por cliente (`cliente.simplecote.com.br`) é enfeite pra muito depois
  (precisa DNS curinga + cert curinga; a Vercel suporta). Começar com todos em
  `app.simplecote.com.br` e o contexto vindo da sessão.
- Um nome/uma empresa só. "SimpleCote" já é o nome. MEI resolve o CNPJ agora.

### 4.4 Modelagem: representante × distribuidora × cidade
Problema: "Época tem o Fulano em Manga e o Beltrano em Januária"; "Aliança tem rep em
Manga e outro em Montalvânia"; um rep pode cobrir várias cidades.

Um "representante" não é só uma pessoa — é a pessoa **numa distribuidora, numa região**:

- `distribuidora` — Época, Martins, Aliança
- `representante` — pessoa (nome, contato)
- `atuacao` — liga `representante` ↔ `distribuidora` ↔ cidade(s)/região. É aqui que
  mora o "quem atende o quê onde".

Fluxo: cotação de um supermercado em Manga puxa os representantes cujo `atuacao` casa
(distribuidoras escolhidas × cidade = Manga). Mesma distribuidora em Januária cai pra
outra pessoa. Um convite por distribuidora, roteado pro rep certo daquela cidade.

Pendente: abrir `src/admin/representantes/representantes.schema.ts` (está modificado no
working tree) e ver o que falta pra chegar nesse formato — hoje o representante tem
uma cidade/região só ou já suporta o N-pra-N (distribuidora × cidade)?
