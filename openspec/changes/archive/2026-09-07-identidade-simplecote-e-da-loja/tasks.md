## 1. Antes do login — SimpleCote fixo

- [x] 1.1 `index.html`: `<title>Sarah Supermercado Cotações</title>` → `<title>SimpleCote</title>`
- [x] 1.2 `src/admin/login/LoginPage.tsx`: remover `useConfiguracaoLoja()` e o `Skeleton` de carregamento; título fixo "SimpleCote" + subtítulo "Cotações simplificadas"
- [x] 1.3 Conferir `src/admin/recuperar-senha/EsqueciSenhaPage.tsx` (e outras telas anônimas) — nenhuma referência a dado de loja nem a `GET /api/configuracoes`

## 2. Depois do login — identidade da loja

- [x] 2.1 `src/admin/configuracoes/ConfiguracaoLojaProvider.tsx`: `useEffect` que seta `document.title = ` `${data.nome} · SimpleCote` quando `data?.nome` existir
- [x] 2.2 Reset de `document.title` para "SimpleCote" quando `isAutenticado` vira `false` (logout / sessão expirada)
- [x] 2.3 Confirmar que o nome no shell (`AdminLayout` → `nomeLoja`) e a cor de marca seguem funcionando sem regressão

## 3. Testes

- [x] 3.1 `LoginPage` renderiza "SimpleCote" / "Cotações simplificadas" e **não** dispara `GET /api/configuracoes` (assert no MSW)
- [x] 3.2 Após autenticar com config carregada, `document.title` contém o nome da loja
- [x] 3.3 No logout, `document.title` volta a "SimpleCote"
- [x] 3.4 `EsqueciSenhaPage` não referencia dado de loja

## 4. Checagem de saúde

- [x] 4.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 4.2 Verificação manual: abrir `/login` (aba diz "SimpleCote", tela diz "SimpleCote"); logar (aba vira "<loja> · SimpleCote", sidebar com o nome da loja); sair (aba volta a "SimpleCote")

## 5. Follow-up (fora desta change)

- [ ] 5.1 Favicon/logo dinâmico por loja depois do login — depende de um campo `logoUrl` novo em `GET /api/configuracoes` (back)
