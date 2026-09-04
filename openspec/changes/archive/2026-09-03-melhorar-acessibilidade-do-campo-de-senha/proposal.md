## Why

Achado verificado por leitura de código: os três campos de senha do
painel (`UsuarioForm` — senha inicial no cadastro; `RedefinirSenhaForm` —
nova senha e confirmação) são `<Input type="password">` sem nenhuma forma
de o admin ver o que digitou, e a única validação (mínimo 8 caracteres, e
no caso da troca, as duas senhas baterem) só aparece **depois** do
submit rejeitado — o admin descobre o problema tarde, digitando às
cegas.

## What Changes

- Adicionar um botão de revelar/ocultar (ícone de olho) em cada um dos
  três campos de senha, alternando `type="password"`/`type="text"`
  daquele input especificamente.
- Adicionar um indicador ao vivo abaixo de cada campo "senha"/"nova
  senha", atualizado a cada tecla (via `form.watch`), mostrando se o
  mínimo de 8 caracteres já foi atingido (ex.: "8+ caracteres" com um
  ícone/cor que muda de neutro para positivo quando satisfeito) — **sem
  inventar critérios que não existem** (o backend só exige 8+
  caracteres, sem regra de maiúscula/número/símbolo; o indicador reflete
  só essa regra real).
- Em `RedefinirSenhaForm`, adicionar também uma indicação ao vivo de que
  os dois campos coincidem (ou não), atualizada conforme o admin digita
  em "Confirmar senha" — sem esperar o submit.

## Capabilities

### Modified Capabilities

- `admin/usuarios`: requirements "Cadastro de usuário" e "Troca de senha
  de um usuário" — adicionam revelar/ocultar e feedback ao vivo do
  critério de tamanho mínimo (e, na troca, de coincidência das senhas).

## Impact

- `src/admin/usuarios/UsuarioForm.tsx`
- `src/admin/usuarios/RedefinirSenhaForm.tsx`
