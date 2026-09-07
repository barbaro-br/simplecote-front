## Context

Ver `proposal.md` — Why. As telas dos três passos já existem (`ProdutoForm`, `RepresentantesModal`/`representantes.api`, `NovaCotacaoWizard`). Esta change encadeia e sinaliza; não reescreve fluxo.

## Goals / Non-Goals

**Goals**
- Levar um `Comprador` recém-criado a uma primeira cotação real sem se perder.
- Reuso total das telas existentes.

**Non-Goals**
- Redesenhar produtos/representantes/cotação.
- Tour interativo com overlays passo a passo — um checklist + wizard basta.
- Gamificação / e-mails de ativação drip — outra frente.

## Decisions

- **Derivar os passos de contadores existentes, guardar só o "dispensado".** "Tem produto?" = `GET /api/produtos` não-vazio; idem representantes e cotações. Evita um subsistema de estado de onboarding no back. O único bit que precisa persistir é "o usuário fechou o checklist" — por `Comprador`, com fallback em `localStorage`.
- **Checklist é a espinha; wizard é atalho.** O checklist sempre reflete o estado real (mesmo se o usuário fez as coisas por fora). O wizard é açúcar para quem quer ser levado pela mão; fechá-lo nunca perde nada.
- **Dados de exemplo só em `TESTE`, com marca e limpeza atômica.** Um `Comprador` que assinou não deve poder "sujar" a base com fixtures; e quem testou precisa conseguir zerar antes de usar pra valer. O back marca os registros de exemplo para o `DELETE` em lote.
- **Render no `DashboardPage`, não no `AdminLayout`.** É conteúdo da home, não do shell; some quando os três passos estão feitos.

## Risks / Trade-offs

- **Contadores custam 3 chamadas no primeiro load** → cabem numa só resposta se o back expuser um `GET /api/onboarding` agregando; senão, 3 `useQuery` leves com cache. Decidir no pré-requisito 0.1.
- **"Dispensado" só em `localStorage`** (se o back atrasar) → volta a aparecer em outro dispositivo; aceitável como fallback temporário.
- **Wizard reusando modais que hoje abrem sobre outra tela** → validar que `RepresentantesModal`/`AdicionarItemModal` funcionam montados dentro do wizard sem uma cotação "por trás"; se acoplado demais, o passo abre a tela real e volta.

## Migration Plan

1. Back: decidir fonte dos passos (agregado vs. contadores) + persistir "dispensado" + endpoints de dados de exemplo.
2. Front: `useOnboarding` → checklist → wizard → dados de exemplo.
3. Rollback: não renderizar o checklist/wizard; nada mais depende deles.
