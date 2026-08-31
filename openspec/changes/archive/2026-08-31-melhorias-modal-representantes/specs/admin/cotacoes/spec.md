# Spec Delta: Ações Individuais de Representante

## 8.5 Acompanhamento de Respostas
- Ao visualizar um representante na cotação aberta, o administrador pode tomar ações rápidas e individuais de re-envio:
  - **Copiar Link:** Copia a URL mágica do representante para a área de transferência, exibindo uma confirmação.
  - **WhatsApp:** Abre o link via API do WhatsApp.
  - **E-mail (Novo):** Dispara novamente o e-mail de convite para aquele representante específico, utilizando o endpoint de re-envio individual. Deve possuir _loading_ visual durante a requisição.
