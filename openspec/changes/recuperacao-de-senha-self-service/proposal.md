## Why

Hoje a única forma de trocar a senha de um usuário ADMIN/OPERADOR é um admin logado usar `RedefinirSenhaForm.tsx` para trocar a senha de outro usuário manualmente (`admin/usuarios`, requirement "Troca de senha de um usuário"). Isso funciona hoje porque o usuário (Francisco) é o próprio dono/admin do ambiente de teste. Quando o cliente (Sara Supermercado) assumir a conta em produção, não vai haver mais um admin "por trás" disponível pra resetar senha manualmente sempre que alguém esquecer — é preciso um fluxo de autoatendimento ("esqueci minha senha") antes de entregar a chave.

Nota: a ideia inicial de "reset de senha" incluía uma dúvida sobre papéis (o usuário mencionou virar "só mais um representante") — **esclarecido**: isso se refere ao fluxo de link tokenizado que representantes já usam hoje (`/cotacao/:token`), sem login nem senha — já funciona, não precisa de mudança nenhuma. Esta change trata exclusivamente de autoatendimento de senha para usuários ADMIN/OPERADOR (quem loga no painel).

## What Changes

- Link "Esqueci minha senha" na tela de login.
- Tela de solicitação: usuário informa o e-mail; o sistema sempre confirma de forma genérica ("se esse e-mail existir, um link foi enviado"), **sem revelar** se o e-mail existe na base (evita enumeration).
- Tela de redefinição (acessada pelo link recebido por e-mail, com um token): nova senha + confirmação, mesmas regras de validação já usadas em `RedefinirSenhaForm.tsx` (mínimo 8 caracteres, confirmação igual). Trata token inválido/expirado com mensagem clara.
- **Depende de endpoints no backend que ainda não existem** para solicitar e efetivar a redefinição (envio de e-mail com token). O backend já tem infraestrutura de envio de e-mail (usada no convite de representantes — `spring-boot-starter-mail` já é dependência do projeto), então o esforço adicional no back é menor do que em `configuracoes-da-loja-basico`, mas os endpoints específicos de reset ainda não existem — confirmado por não haver nada equivalente hoje além da troca admin-assistida.

## Capabilities

### New Capabilities

- `admin/recuperar-senha`: fluxo de autoatendimento para um usuário ADMIN/OPERADOR redefinir a própria senha sem depender de outro admin.

### Modified Capabilities

_Nenhuma — não altera o fluxo de login existente nem a troca de senha admin-assistida já especificada em `admin/usuarios`, só adiciona um caminho novo._

## Impact

- **Front** (este repositório): novo link na `LoginPage.tsx`, duas novas telas/rotas (`/esqueci-senha`, `/redefinir-senha/:token` ou equivalente).
- **Back** (`simplecote-back`, fora deste repositório): dois endpoints novos (solicitar redefinição, efetivar redefinição com token) — contrato assumido documentado em `design.md`, a confirmar com quem implementar o lado back.
- Segurança: geração/expiração/uso único do token é responsabilidade do backend; o front só consome o resultado (token válido ou não).
