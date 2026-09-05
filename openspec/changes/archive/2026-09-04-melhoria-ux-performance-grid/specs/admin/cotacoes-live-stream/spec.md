## ADDED Requirements

### Requirement: Feedback visual de atualização em tempo real
A grade ao vivo SHALL aplicar um efeito visual transiente (*flash* ou *highlight* sutil) nas células de preço que forem atualizadas (novos lances ou alterações) via *SSE (Server-Sent Events)* ou *streaming*, para chamar a atenção do comprador para a mudança sem interromper sua navegação.

#### Scenario: Novo lance recebido na grade
- **WHEN** um representante submete um preço e a grade atualiza seu valor automaticamente
- **THEN** a célula correspondente exibe uma rápida transição de cor (ex: verde piscando sutilmente) antes de retornar ao estado padrão

#### Scenario: Mudança de liderança (Menor Preço)
- **WHEN** uma atualização de preço faz com que uma célula passe a ser o menor preço daquele item
- **THEN** o destaque visual de menor preço é aplicado não apenas de forma estática, mas acompanhado de uma leve transição para evidenciar a nova liderança
