## 1. Tornar os indicadores funcionais

- [x] 1.1 Em `RepresentantesModal.tsx`, importar `urlMailto` de `./compartilhar-link` e `aplicarMascaraTelefone` de `@/shared/utils/telefone`.
- [x] 1.2 Trocar `{e.repEmail && <span title="Possui E-mail"><Mail className="size-3.5" /></span>}` por um `<a href={urlMailto(msg, 'Cotação — link de acesso', e.repEmail)} title={e.repEmail} target="_blank" rel="noopener noreferrer">` com o mesmo ícone `Mail`. Montar `msg` no mesmo padrão inline já usado pelo WhatsApp no menu "⋯" (`Olá ${nome}, aqui está o link da cotação. Acesse: ${link}`).
- [x] 1.3 Trocar `{e.repWhatsapp && <span title="Possui WhatsApp"><Phone className="size-3.5" /></span>}` por um `<button type="button" title={aplicarMascaraTelefone(e.repWhatsapp)} onClick={...}>` com o mesmo ícone `Phone`, que copia `aplicarMascaraTelefone(e.repWhatsapp)` para a área de transferência (`navigator.clipboard.writeText`) e mostra `toast.success('Telefone copiado!')`.
- [x] 1.4 Manter o tamanho (`size-3.5`) e a posição atual dos dois ícones na linha — não alterar layout.

## 2. Testes

- [x] 2.1 Teste: linha com `repEmail` preenchido renderiza um link `mailto:` com o e-mail correto no `href` e no `title`.
- [x] 2.2 Teste: linha com `repWhatsapp` preenchido, ao clicar no indicador de telefone, chama `navigator.clipboard.writeText` com o número formatado e mostra o toast de confirmação.
- [x] 2.3 Teste: linha sem e-mail/telefone não renderiza os respectivos indicadores (comportamento condicional já existente, sem regressão).
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar manualmente (dev): abrir o modal Representantes de uma cotação com participantes que têm e-mail/WhatsApp cadastrados, passar o mouse sobre os indicadores (confirmar que mostram o valor real), clicar no de e-mail (abre o cliente de e-mail padrão) e no de telefone (copia e mostra confirmação).
