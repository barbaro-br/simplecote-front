## Purpose
Permite que um colaborador com dispositivo móvel leia códigos de barras através da câmera e processe a adição de itens à cotação rapidamente com feedback visual/sonoro.

## ADDED Requirements

### Requirement: Captura de GTIN via Câmera
A interface deve iniciar a câmera do dispositivo móvel e ler códigos de barra padrão continuamente, pausando ao encontrar um código até que a requisição de validação termine.

#### Scenario: Leitura bem-sucedida e adição
- **WHEN** o leitor de câmera captura um código de barras e o backend retorna status `200`
- **THEN** a interface exibe um indicador de sucesso (ex: Toast verde) e retoma a leitura da câmera imediatamente

#### Scenario: Produto exige confirmação de embalagem
- **WHEN** o leitor captura um código e o backend retorna status `202` (Accepted) com um nome sugerido
- **THEN** a interface pausa a leitura da câmera e exibe um modal minimalista pedindo a "Embalagem" (Unidade/Caixa) e "Qtd por embalagem", e ao confirmar, salva o produto e retoma a câmera

#### Scenario: Produto totalmente desconhecido
- **WHEN** o leitor captura um código e o backend retorna `404` (Not Found)
- **THEN** a interface alerta que o produto não foi encontrado e exibe um modal completo de cadastro de produto
