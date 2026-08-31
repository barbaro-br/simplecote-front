## Technical Design

### Back-end
- Arquivo `ParticipanteService.java`:
  - Modificar validação no método `convidar`: `if (cotacao.getStatus() != StatusCotacao.RASCUNHO && cotacao.getStatus() != StatusCotacao.ABERTA) { throw... }`
  - Se a cotação for `ABERTA`, após salvar o `Participante` e gerar o link, precisamos inicializar os lances para os itens dessa cotação para o novo participante. (Talvez chamar um `LancesInitializer` se aplicável).

### Front-end
- Arquivo `RepresentantesModal.tsx`:
  - Atualmente, a variável `filtrados` oculta empresas não convidadas se `isAberta === true`. Precisaremos adicionar um botão ou _toggle_ ("Ver todas as empresas") para que o usuário possa achar a empresa esquecida.
  - Ao lado de uma empresa não convidada, mostrar um botão "Convidar" que fará a mutação `useConvidarEmpresas` passando aquele único ID.
