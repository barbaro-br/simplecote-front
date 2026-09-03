## 1. Consolidar as ações num menu "⋯"

- [x] 1.1 Em `RepresentantesModal.tsx`: importar `MenuAcoes` de `@/shared/components/ui/menu-acoes` (já usado em `CotacoesPage.tsx`/`CotacaoDetalhePage.tsx`).
- [x] 1.2 Para cada participante já convidado (`e.part` existe), montar a lista de `items` do `MenuAcoes` com, na ordem: "Enviar por WhatsApp" (`onSelect` abre `urlWhatsApp(...)`, mesma lógica de hoje), "Copiar link" (`onSelect` copia `linkMagico` e mostra o toast/estado "Copiado!" já existente), "Reenviar convite" (`onSelect` chama `reenviar.mutateAsync(...)`, mesma lógica de hoje, rótulo "Reenviar convite" — não "Reenviar e-mail"), e condicionalmente "Finalizar" (quando `podeGerenciarResposta && participanteStatus === 'VISUALIZOU'`) ou "Reabrir resposta" (quando `podeGerenciarResposta && participanteStatus === 'RESPONDIDO'`), cada um preservando a chamada de API e o toast de sucesso/erro já existentes.
- [x] 1.3 Remover os 3 `Button` de ícone (WhatsApp/Copiar/Reenviar) e o `Button` de texto (Finalizar/Reabrir) da linha, substituindo pelo único `MenuAcoes`.
- [x] 1.4 Manter o botão "Convidar" (para empresas ainda não convidadas) como está, fora do menu.

## 2. Largura mínima do nome

- [x] 2.1 No bloco de nome+representante da linha (`<div className="flex-1 min-w-0">`): adicionar uma largura mínima (`min-w-[…]`, calibrada na verificação visual) para que ele pare de ser o primeiro a ceder espaço quando o badge de status e o `MenuAcoes` estão presentes na mesma linha.

## 3. Limpeza de spec

- [x] 3.1 Confirmar que a spec sincronizada (`openspec/specs/admin/cotacoes/spec.md`) não contém mais a menção a "Remover empresa" no requirement "Convidar Empresas" após este change ser arquivado (ação inexistente na implementação).

## 4. Testes

- [x] 4.1 Atualizar `RepresentantesModal.test.tsx`: os testes que hoje buscam os botões "Finalizar"/"Reabrir resposta" diretamente na linha passam a abrir o menu "⋯" primeiro (`getByTitle('Mais opções')` ou seletor equivalente do `MenuAcoes`) antes de buscar o item pelo texto.
- [x] 4.2 Teste: um participante já convidado não exibe nenhum ícone de ação solto na linha (WhatsApp/Copiar/Reenviar) — só o botão do menu "⋯".
- [x] 4.3 Teste: abrir o menu "⋯" de um participante `VISUALIZOU` mostra o item "Finalizar" e não mostra "Reabrir resposta"; o inverso para `RESPONDIDO`.
- [x] 4.4 Teste: numa Cotação `PEDIDOS_GERADOS`/`CANCELADA`, o menu "⋯" de nenhum participante mostra "Finalizar" nem "Reabrir resposta" (adaptar os testes existentes desses casos).
- [x] 4.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 5. Verificação visual

- [ ] 5.1 Testar com dados reais (dev): abrir o modal com participantes de nomes como "Comercial Boa Praça" e "Distribuidora Sul" e confirmar que os nomes aparecem por completo (ou truncam de forma razoável, não para 1 caractere), com o menu "⋯" funcionando para cada ação.
