## Technical Design

- **Novo arquivo:** Criar `public/favicon.svg`. Usaremos um SVG baseado em texto (emoji) para garantir que funcione em qualquer resolução, seja leve e tenha suporte nos navegadores modernos:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y=".9em" font-size="90">🛒</text>
  </svg>
  ```
- **Arquivo existente:** `index.html`.
- **Alteração:** Trocar a tag de ícone atual:
  De: `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`
  Para: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- **Limpeza:** (Opcional) Podemos deletar o `/vite.svg` da pasta `public` se não houver outros usos.
