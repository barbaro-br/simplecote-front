/**
 * ARQUIVO GERADO AUTOMATICAMENTE — não edite à mão.
 *
 * Gerado por: npm run gen:api-types
 * Origem: http://localhost:8080/v3/api-docs
 * Data: 2026-09-16T07:45:43.341Z
 */

export interface paths {
    "/public/cotacoes/{token}/lances": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["registrarLances"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/cotacoes/{token}/condicoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["registrarCondicoes"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["buscar"];
        put: operations["atualizar"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/representantes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["atualizar_1"];
        post?: never;
        delete: operations["excluir"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["atualizar_2"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/avulsos/{id}/itens/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Edita preço/quantidade de um item do pedido avulso (só permitido em ABERTO) */
        put: operations["editarItem"];
        post?: never;
        /** Remove um item do pedido avulso (só permitido em ABERTO) */
        delete: operations["removerItem"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/participantes/{participanteId}/lances/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["corrigirLance"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/onboarding/dispensar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["dispensar"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/empresas/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["atualizar_3"];
        post?: never;
        delete: operations["excluir_1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuracoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["buscar_1"];
        put: operations["atualizar_4"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/catalogo-global/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["corrigir"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/pedidos/{token}/confirmar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirma o pedido (ENVIADO -> CONFIRMADO) */
        post: operations["confirmar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/cotacoes/{token}/finalizar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["finalizar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/convites/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["contexto"];
        put?: never;
        post: operations["aceitar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/colaborador/{token}/produtos/bipado": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cadastrarItemBipado"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/colaborador/{token}/itens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["adicionarItem"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/cadastro": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cadastrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/cadastro/verificar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["verificar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar"];
        put?: never;
        post: operations["criar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios/{id}/senha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["alterarSenha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios/{id}/inativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["inativar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/representantes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_1"];
        put?: never;
        post: operations["criar_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/representantes/{id}/inativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["inativar_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_2"];
        put?: never;
        post: operations["criar_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/{id}/inativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["inativar_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/{id}/ativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ativar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/importar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Importa produtos em massa a partir de um arquivo CSV ou XLSX
         * @description Cabeçalho esperado (case-insensitive, sinônimos aceitos): nome; código de barras (opcional; aceita também "gtin"); embalagem — Fardo, Caixa, Cartela ou Unidade (aceita também "tipo de embalagem"); quantidade por embalagem — inteiro >= 1, default 1 se ausente (aceita também "qtd_embalagem"). Linhas sem nome, com código de barras já cadastrado ou com tipo de embalagem inválido são ignoradas e contabilizadas em vez de abortar a importação.
         */
        post: operations["importar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/bipado": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cadastra um produto bipado (nome do provedor ou digitado + tipo de embalagem/quantidade do admin)
         * @description Se `cotacaoId` for informado, o produto criado é adicionado como item dessa cotação na mesma operação — a cotação precisa estar em RASCUNHO e ser do Comprador. A restrição ao papel OPERADOR entra na fatia autenticacao-jwt.
         */
        post: operations["bipado"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{id}/enviar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Envia o pedido ao representante vencedor (GERADO -> ENVIADO) */
        post: operations["enviar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/avulsos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cria o pedido avulso já com o primeiro item */
        post: operations["criar_3"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/avulsos/{id}/itens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Adiciona um item ao pedido avulso (só permitido em ABERTO) */
        post: operations["adicionarItem_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/avulsos/{id}/fechar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Fecha o pedido avulso, congelando os itens e o total */
        post: operations["fechar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/participantes/{participanteId}/reenviar-convite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reenviarConvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/participantes/{participanteId}/reabrir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reabrir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/participantes/{participanteId}/finalizar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["finalizar_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao/convites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["convidar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao/convites/{id}/reenviar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reenviar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/onboarding/dados-exemplo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["semearExemplo"];
        delete: operations["limparExemplo"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/empresas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_3"];
        put?: never;
        post: operations["criar_4"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/empresas/{id}/inativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["inativar_3"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/empresas/{id}/ativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ativar_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_4"];
        put?: never;
        post: operations["criar_5"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/recotar-sem-vencedor": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["recotarSemVencedor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/reabrir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reabrir_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/itens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["adicionarItem_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/itens/bipar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["biparItem"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/encerrar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["encerrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/duplicar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["duplicar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/cancelar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/apurar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["apurar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/abrir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["abrir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{cotacaoId}/participantes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_5"];
        put?: never;
        post: operations["convidar_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuracoes/colaborador/enviar-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["enviarLinkColaborador"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/condicoes-pagamento": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_6"];
        put?: never;
        post: operations["criar_6"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/condicoes-pagamento/{id}/inativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["inativar_4"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/condicoes-pagamento/{id}/ativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ativar_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/redefinir-senha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["redefinirSenha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/esqueci-senha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["esqueciSenha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/suspender": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["suspender"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/suporte": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["suporte"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/resetar-senha-admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["resetarSenhaAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/reenviar-verificacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reenviarVerificacao"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/reativar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reativar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/prazo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["definirPrazo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/notas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["notas"];
        put?: never;
        post: operations["adicionarNota"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/excluir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["excluir_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/catalogo-global/{id}/revisar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["revisar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/avisos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_7"];
        put?: never;
        post: operations["criar_7"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/prazo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["alterarPrazo"];
        trace?: never;
    };
    "/api/cotacoes/{id}/itens/{itemId}/quantidade": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["atualizarQuantidadeItem"];
        trace?: never;
    };
    "/api/admin/avisos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["remover"];
        options?: never;
        head?: never;
        patch: operations["alternarAtivo"];
        trace?: never;
    };
    "/public/pedidos/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Consulta o pedido do representante por token */
        get: operations["buscar_2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/pedidos/{token}.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download do PDF do pedido por token */
        get: operations["pdf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/cotacoes/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["visualizar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/compradores/{slug}/existe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["existe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/compradores/validar-slug": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["validarSlug"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/colaborador/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["estado"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/colaborador/{token}/produtos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["produtos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/colaborador/{token}/produtos/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["lookupProduto"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/sugestoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Sugestão ao digitar no cadastro, por nome ou por trecho de código de barras
         * @description Texto casa por nome; dígitos com 4+ caracteres casam por trecho do código de barras (em qualquer posição, não só sufixo); menos de 4 dígitos não busca por código (spec.md §10.6, produto/sugestao-de-cadastro). Retorna dois grupos: produtos já cadastrados pelo próprio Comprador (evita recadastrar) e sugestões do catálogo global que ele ainda não tem (nome, código de barras e marca — nunca tipo de embalagem nem quantidade).
         */
        get: operations["sugerir"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/sugestoes/catalogo-global": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Próxima página de sugestões do catálogo global, pro scroll infinito do painel de sugestão
         * @description Mesma busca por nome de GET /sugestoes (change scroll-infinito-sugestao-catalogo-global) — só o catálogo global pagina (o do próprio Comprador raramente passa de 30 itens parecidos). `pagina` 0-based; a página 0 é a mesma retornada por GET /sugestoes. Lista vazia = fim.
         */
        get: operations["sugerirMaisDoCatalogoGlobal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/produtos/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consulta um produto pelo código de barras (GTIN) num provedor externo
         * @description "Não encontrado" é resposta normal (404), não erro — inclui GTIN desconhecido pelo provedor e provedor desligado/fora do ar (spec.md §10.6). A restrição ao papel OPERADOR entra na fatia autenticacao-jwt.
         */
        get: operations["lookup"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista todos os Pedidos do Comprador, agrupados por Cotação (avulsos à parte) */
        get: operations["listarAgregado"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{id}.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download do PDF do pedido */
        get: operations["pdf_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/avulsos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Consulta um pedido avulso do próprio Comprador */
        get: operations["buscar_3"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao/membros": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["membros"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao/exportacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["exportar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/onboarding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["estado_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["buscar_4"];
        put?: never;
        post?: never;
        delete: operations["excluir_3"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/resultado": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["resultado"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/resultado.xlsx": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["resultadoXlsx"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/pedidos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["pedidos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/correcoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correcoes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/apuracao/previa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["previaApuracao"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/ao-vivo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["aoVivo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/ao-vivo/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["aoVivoStream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/avisos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["vigentes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/analises/produtos/insight": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["insightProdutos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/analises/empresas/{id}/insight": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["insightEmpresa"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/analises/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/analises/compras": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["compras"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/resumo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["resumo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_8"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["detalhe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/timeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["timeline"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/relatorio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["relatorio"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/cotacoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["cotacoes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/catalogo-global": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listar_9"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/catalogo-global/metricas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["metricas"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/participantes/{participanteId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["desconvidar"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["encerrar_1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/organizacao/convites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["revogar"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cotacoes/{id}/itens/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removerItem_1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/compradores/{id}/notas/{notaId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removerNota"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ProblemDetail: {
            /** Format: uri */
            type?: string;
            title?: string;
            /** Format: int32 */
            status?: number;
            detail?: string;
            /** Format: uri */
            instance?: string;
            properties?: {
                [key: string]: unknown;
            };
        };
        ItemLanceRequest: {
            /** Format: uuid */
            itemCotacaoId: string;
            preco?: number;
            naoCotado?: boolean;
        };
        RegistrarLancesRequest: {
            lances: components["schemas"]["ItemLanceRequest"][];
        };
        CondicaoPagamentoResponse: {
            /** Format: uuid */
            id?: string;
            descricao?: string;
            ativo?: boolean;
        };
        CotacaoParticipanteResponse: {
            /** Format: uuid */
            cotacaoId?: string;
            titulo?: string;
            /** @enum {string} */
            status?: "RASCUNHO" | "ABERTA" | "ENCERRADA" | "PEDIDOS_GERADOS" | "CANCELADA";
            /** Format: date-time */
            prazo?: string;
            podeEditar?: boolean;
            /** @enum {string} */
            participanteStatus?: "CONVIDADO" | "VISUALIZOU" | "RESPONDIDO";
            representanteNome?: string;
            empresaNome?: string;
            compradorNome?: string;
            itens?: components["schemas"]["ItemLanceResponse"][];
            condicaoPagamento?: string;
            prazoEntregaEstimado?: string;
            pedidoMinimo?: number;
            condicoesPagamentoDisponiveis?: components["schemas"]["CondicaoPagamentoResponse"][];
        };
        ItemLanceResponse: {
            /** Format: uuid */
            itemCotacaoId?: string;
            nome?: string;
            codigoBarras?: string;
            unidade?: string;
            /** Format: int32 */
            quantidadeSolicitada?: number;
            /** Format: int32 */
            quantidadePorEmbalagemSnapshot?: number;
            preco?: number;
            precoUnitario?: number;
            /** @enum {string} */
            statusLance?: "PENDENTE" | "COTADO" | "NAO_COTADO";
        };
        RegistrarCondicoesRequest: {
            /** Format: uuid */
            condicaoPagamentoId?: string;
            prazoEntregaEstimado?: string;
            pedidoMinimo?: number;
        };
        AtualizarUsuarioRequest: {
            nome: string;
            /** Format: email */
            email: string;
            /** @enum {string} */
            papel: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
        };
        UsuarioResponse: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            email?: string;
            /** @enum {string} */
            papel?: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
            ativo?: boolean;
        };
        AtualizarRepresentanteRequest: {
            nome: string;
            /** Format: email */
            email: string;
            whatsapp?: string;
        };
        RepresentanteResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            empresaId?: string;
            nome?: string;
            email?: string;
            whatsapp?: string;
            ativo?: boolean;
        };
        AtualizarProdutoRequest: {
            nome: string;
            unidade: string;
            /** Format: int32 */
            quantidadePorEmbalagem: number;
        };
        ProdutoResponse: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            codigoBarras?: string;
            unidade?: string;
            /** Format: int32 */
            quantidadePorEmbalagem?: number;
            ativo?: boolean;
        };
        EditarItemPedidoAvulsoRequest: {
            precoEmbalagem: number;
            /** Format: int32 */
            quantidade: number;
        };
        ItemPedidoAvulsoDTO: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            produtoId?: string;
            nomeSnapshot?: string;
            unidadeSnapshot?: string;
            /** Format: int32 */
            quantidadePorEmbalagemSnapshot?: number;
            precoEmbalagem?: number;
            precoUnitario?: number;
            /** Format: int32 */
            quantidade?: number;
            subtotal?: number;
        };
        PedidoAvulsoResponse: {
            /** Format: uuid */
            id?: string;
            status?: string;
            itens?: components["schemas"]["ItemPedidoAvulsoDTO"][];
            /** Format: int32 */
            quantidadeItens?: number;
            total?: number;
            /** Format: date-time */
            geradoEm?: string;
            condicaoPagamento?: string;
            prazoEntregaEstimado?: string;
            empresaNome?: string;
            representanteNome?: string;
        };
        CorrigirLanceRequest: {
            preco?: number;
            naoCotado?: boolean;
        };
        DispensarOnboardingRequest: {
            dispensado?: boolean;
        };
        AtualizarEmpresaRequest: {
            nome: string;
            pedidoMinimo?: number;
        };
        EmpresaResponse: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            ativo?: boolean;
            pedidoMinimo?: number;
        };
        AtualizarConfiguracaoRequest: {
            nome: string;
            corPrimaria: string;
            telefone: string;
            layoutEmail: string;
            /** @enum {string} */
            estiloNavegacao: "LATERAL" | "INFERIOR";
            /** @enum {string} */
            tema: "CLARO" | "ESCURO";
            emailContato?: string;
            mostrarMargemLucro?: boolean;
        };
        ConfiguracaoResponse: {
            nome?: string;
            corPrimaria?: string;
            telefone?: string;
            layoutEmail?: string;
            /** @enum {string} */
            estiloNavegacao?: "LATERAL" | "INFERIOR";
            /** @enum {string} */
            tema?: "CLARO" | "ESCURO";
            linkColaboradorToken?: string;
            emailContato?: string;
            mostrarMargemLucro?: boolean;
        };
        CorrigirCatalogoGlobalRequest: {
            nome: string;
            marca?: string;
        };
        ConfirmarPedidoRequest: {
            observacao?: string;
        };
        ItemPedidoDTO: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            itemCotacaoId?: string;
            /** Format: uuid */
            lanceId?: string;
            nomeSnapshot?: string;
            unidadeSnapshot?: string;
            /** Format: int32 */
            quantidadePorEmbalagemSnapshot?: number;
            /** Format: int32 */
            quantidade?: number;
            precoEmbalagem?: number;
            precoUnitario?: number;
            subtotal?: number;
            decididoPorDesempate?: boolean;
        };
        PedidoDTO: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            cotacaoId?: string;
            /** Format: uuid */
            participanteId?: string;
            origem?: string;
            empresaNome?: string;
            status?: string;
            observacao?: string;
            /** Format: date-time */
            geradoEm?: string;
            /** Format: date-time */
            enviadoEm?: string;
            /** Format: date-time */
            confirmadoEm?: string;
            itens?: components["schemas"]["ItemPedidoDTO"][];
            total?: number;
            condicaoPagamento?: string;
            prazoEntregaEstimado?: string;
            pedidoMinimo?: number;
        };
        AceitarConviteRequest: {
            senha: string;
        };
        ConviteAceitoResponse: {
            slug?: string;
        };
        ColaboradorCadastrarItemBipadoRequest: {
            /** Format: uuid */
            cotacaoId: string;
            gtin: string;
            nome: string;
            unidade: string;
            /** Format: int32 */
            quantidadePorEmbalagem?: number;
            /** Format: int32 */
            quantidade?: number;
        };
        ItemCotacaoResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            produtoId?: string;
            nomeSnapshot?: string;
            codigoBarrasSnapshot?: string;
            unidadeSnapshot?: string;
            /** Format: int32 */
            quantidadeSolicitada?: number;
            /** Format: int32 */
            quantidadePorEmbalagemSnapshot?: number;
            /** Format: date-time */
            criadoEm?: string;
        };
        ColaboradorAdicionarItemRequest: {
            /** Format: uuid */
            cotacaoId: string;
            /** Format: uuid */
            produtoId: string;
            /** Format: int32 */
            quantidade: number;
        };
        CadastroRequest: {
            nomeSupermercado: string;
            slug: string;
            /** Format: email */
            email: string;
            senha: string;
        };
        VerificarEmailRequest: {
            token: string;
        };
        VerificarEmailResponse: {
            slug?: string;
        };
        CriarUsuarioRequest: {
            nome: string;
            /** Format: email */
            email: string;
            /** @enum {string} */
            papel: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
            senha: string;
        };
        AlterarSenhaRequest: {
            senha: string;
        };
        CriarRepresentanteRequest: {
            /** Format: uuid */
            empresaId: string;
            nome: string;
            /** Format: email */
            email: string;
            whatsapp?: string;
        };
        CriarProdutoRequest: {
            nome: string;
            codigoBarras?: string;
            unidade: string;
            /** Format: int32 */
            quantidadePorEmbalagem: number;
        };
        LinhaIgnorada: {
            /** Format: int32 */
            linha?: number;
            motivo?: string;
        };
        ResultadoImportacaoDTO: {
            /** Format: int32 */
            criados?: number;
            /** Format: int32 */
            ignorados?: number;
            detalhes?: components["schemas"]["LinhaIgnorada"][];
        };
        CadastrarProdutoBipadoRequest: {
            gtin: string;
            nome: string;
            unidade: string;
            /** Format: int32 */
            quantidadePorEmbalagem?: number;
            /** Format: uuid */
            cotacaoId?: string;
        };
        CriarPedidoAvulsoRequest: {
            /** Format: uuid */
            empresaId: string;
            /** Format: uuid */
            produtoId?: string;
            precoEmbalagem?: number;
            /** Format: int32 */
            quantidade?: number;
            /** Format: uuid */
            condicaoPagamentoId?: string;
            condicaoPagamentoTexto?: string;
            prazoEntregaEstimado?: string;
        };
        AdicionarItemPedidoAvulsoRequest: {
            /** Format: uuid */
            produtoId: string;
            precoEmbalagem: number;
            /** Format: int32 */
            quantidade: number;
        };
        ParticipanteResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            representanteId?: string;
            /** @enum {string} */
            status?: "CONVIDADO" | "VISUALIZOU" | "RESPONDIDO";
            linkMagico?: string;
        };
        ConvidarRequest: {
            /** Format: email */
            email: string;
            /** @enum {string} */
            papel: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
        };
        ConviteResponse: {
            /** Format: uuid */
            id?: string;
        };
        CriarEmpresaRequest: {
            nome: string;
            pedidoMinimo?: number;
        };
        CriarCotacaoRequest: {
            titulo: string;
            /** Format: uuid */
            condicaoPagamentoPreferencialId?: string;
        };
        CotacaoResponse: {
            /** Format: uuid */
            id?: string;
            titulo?: string;
            /** @enum {string} */
            status?: "RASCUNHO" | "ABERTA" | "ENCERRADA" | "PEDIDOS_GERADOS" | "CANCELADA";
            /** Format: date-time */
            prazo?: string;
            /** Format: date-time */
            criadaEm?: string;
            /** Format: date-time */
            encerradaEm?: string;
            itens?: components["schemas"]["ItemCotacaoResponse"][];
            prazoVencido?: boolean;
            condicaoPagamentoPreferencial?: string;
        };
        CotacaoDuplicadaResponse: {
            cotacao?: components["schemas"]["CotacaoResponse"];
            omitidos?: components["schemas"]["ItemOmitido"][];
        };
        ItemOmitido: {
            /** Format: uuid */
            produtoId?: string;
            nome?: string;
            motivo?: string;
        };
        AdicionarItemRequest: {
            /** Format: uuid */
            produtoId: string;
            /** Format: int32 */
            quantidade: number;
        };
        BiparItemRequest: {
            gtin: string;
        };
        ResultadoDTO: {
            pedidos?: components["schemas"]["PedidoDTO"][];
            itensSemVencedor?: components["schemas"]["ItemCotacaoResponse"][];
        };
        AbrirCotacaoRequest: {
            /** Format: date-time */
            prazo: string;
        };
        ConvidarEmpresasRequest: {
            empresaIds: string[];
        };
        EnviarLinkColaboradorRequest: {
            /** Format: email */
            email: string;
        };
        CriarCondicaoPagamentoRequest: {
            descricao: string;
        };
        TokenResponse: {
            token?: string;
        };
        RedefinirSenhaRequest: {
            /** Format: email */
            email: string;
            codigo: string;
            novaSenha: string;
        };
        MensagemResponse: {
            mensagem?: string;
        };
        LoginRequest: {
            email: string;
            senha: string;
        };
        EsqueciSenhaRequest: {
            /** Format: email */
            email: string;
        };
        SuporteRequest: {
            motivo: string;
        };
        SuporteResponse: {
            token?: string;
            /** Format: date-time */
            expiraEm?: string;
        };
        ResetarSenhaAdminRequest: {
            /** Format: uuid */
            usuarioId: string;
        };
        PrazoRequest: {
            /** Format: date-time */
            expiraEm?: string;
        };
        NotaRequest: {
            texto?: string;
        };
        NotaResponse: {
            /** Format: uuid */
            id?: string;
            texto?: string;
            /** Format: uuid */
            autorSuperAdminId?: string;
            /** Format: date-time */
            criadoEm?: string;
        };
        AvisoRequest: {
            titulo: string;
            corpo: string;
            /** @enum {string} */
            nivel: "INFO" | "ATENCAO" | "CRITICO";
            /** Format: date-time */
            expiraEm?: string;
        };
        AvisoAdminResponse: {
            /** Format: uuid */
            id?: string;
            titulo?: string;
            corpo?: string;
            /** @enum {string} */
            nivel?: "INFO" | "ATENCAO" | "CRITICO";
            /** Format: date-time */
            publicadoEm?: string;
            /** Format: date-time */
            expiraEm?: string;
            ativo?: boolean;
            /** Format: uuid */
            criadoPor?: string;
        };
        AtualizarQuantidadeItemRequest: {
            /** Format: int32 */
            quantidade: number;
        };
        AvisoAtivoRequest: {
            ativo: boolean;
        };
        ConviteContextoResponse: {
            nomeLoja?: string;
            /** @enum {string} */
            papel?: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
        };
        SlugExisteResponse: {
            existe?: boolean;
        };
        CotacaoAbertaResumo: {
            /** Format: uuid */
            id?: string;
            titulo?: string;
        };
        EstadoColaboradorResponse: {
            nomeLoja?: string;
            cotacoesAbertas?: components["schemas"]["CotacaoAbertaResumo"][];
        };
        DadosProdutoExternoDTO: {
            gtin?: string;
            nome?: string;
            marca?: string;
        };
        SugestaoCatalogoGlobalDTO: {
            codigoBarras?: string;
            nome?: string;
            marca?: string;
        };
        SugestoesCadastroDTO: {
            doProprioCatalogo?: components["schemas"]["ProdutoResponse"][];
            doCatalogoGlobal?: components["schemas"]["SugestaoCatalogoGlobalDTO"][];
        };
        GrupoCotacaoDTO: {
            /** Format: uuid */
            cotacaoId?: string;
            tituloCotacao?: string;
            pedidos?: components["schemas"]["PedidoResumoDTO"][];
        };
        PedidoResumoDTO: {
            /** Format: uuid */
            id?: string;
            origem?: string;
            status?: string;
            empresaNome?: string;
            total?: number;
            /** Format: int32 */
            quantidadeItens?: number;
            condicaoPagamento?: string;
            prazoEntregaEstimado?: string;
            /** Format: date-time */
            geradoEm?: string;
            pedidoMinimo?: number;
        };
        PedidosAgrupadosResponse: {
            grupos?: components["schemas"]["GrupoCotacaoDTO"][];
            avulsos?: components["schemas"]["PedidoResumoDTO"][];
        };
        MembroResponse: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            email?: string;
            /** @enum {string} */
            papel?: "OWNER" | "ADMIN" | "OPERADOR" | "SUPER_ADMIN";
            /** @enum {string} */
            status?: "ATIVO" | "INATIVO" | "CONVITE_PENDENTE";
        };
        OnboardingEstadoResponse: {
            temProduto?: boolean;
            temRepresentante?: boolean;
            temCotacao?: boolean;
            dispensado?: boolean;
            modoTeste?: boolean;
        };
        CotacaoResumoResponse: {
            /** Format: uuid */
            id?: string;
            titulo?: string;
            /** @enum {string} */
            status?: "RASCUNHO" | "ABERTA" | "ENCERRADA" | "PEDIDOS_GERADOS" | "CANCELADA";
            /** Format: date-time */
            prazo?: string;
            /** Format: date-time */
            criadaEm?: string;
            /** Format: date-time */
            encerradaEm?: string;
            valorTotalComprado?: number;
            prazoVencido?: boolean;
        };
        CorrecaoLanceDTO: {
            /** Format: uuid */
            id?: string;
            /** Format: uuid */
            lanceId?: string;
            /** Format: uuid */
            participanteId?: string;
            /** Format: uuid */
            itemCotacaoId?: string;
            /** Format: uuid */
            usuarioId?: string;
            statusAnterior?: string;
            statusNovo?: string;
            precoAnterior?: number;
            precoNovo?: number;
            /** Format: date-time */
            criadoEm?: string;
        };
        Celula: {
            /** Format: uuid */
            participanteId?: string;
            /** Format: uuid */
            empresaId?: string;
            empresa?: string;
            preco?: number;
            precoUnitario?: number;
            /** @enum {string} */
            status?: "COTADO" | "NAO_COTADO" | "PENDENTE";
        };
        GridAoVivoDTO: {
            /** @enum {string} */
            status?: "RASCUNHO" | "ABERTA" | "ENCERRADA" | "PEDIDOS_GERADOS" | "CANCELADA";
            /** Format: int32 */
            respondidos?: number;
            /** Format: int32 */
            totalParticipantes?: number;
            itens?: components["schemas"]["ItemGrid"][];
        };
        ItemGrid: {
            /** Format: uuid */
            itemCotacaoId?: string;
            nome?: string;
            unidade?: string;
            quantidadePorEmbalagem?: number;
            quantidadeSolicitada?: number;
            ultimoPrecoUnitario?: number;
            ultimaCompraEmpresa?: string;
            /** Format: date-time */
            ultimaCompraEm?: string;
            menorPrecoUnitario?: number;
            precos?: components["schemas"]["Celula"][];
            /** Format: date-time */
            criadoEm?: string;
        };
        SseEmitter: {
            /** Format: int64 */
            timeout?: number;
        };
        ParticipanteDaCotacaoResponse: {
            /** Format: uuid */
            participanteId?: string;
            /** Format: uuid */
            empresaId?: string;
            empresaNome?: string;
            representanteNome?: string;
            /** @enum {string} */
            conviteStatus?: "ENVIADO" | "FALHOU";
            /** @enum {string} */
            participanteStatus?: "CONVIDADO" | "VISUALIZOU" | "RESPONDIDO";
            linkMagico?: string;
            /** Format: date-time */
            conviteEnviadoEm?: string;
            /** Format: date-time */
            visualizadoEm?: string;
            /** Format: date-time */
            respondidoEm?: string;
            emailRepresentante?: string;
            whatsappRepresentante?: string;
            pedidoMinimo?: number;
        };
        AvisoResponse: {
            /** Format: uuid */
            id?: string;
            titulo?: string;
            corpo?: string;
            /** @enum {string} */
            nivel?: "INFO" | "ATENCAO" | "CRITICO";
            /** Format: date-time */
            publicadoEm?: string;
            /** Format: date-time */
            expiraEm?: string;
        };
        InsightProdutoDTO: {
            ultimaCompra?: components["schemas"]["UltimaCompraDTO"];
            menorPrecoUnitario?: number;
            precoMedioUnitario90d?: number;
            variacaoPct?: number;
            /** Format: int64 */
            fornecedoresDistintos?: number;
            /** Format: int64 */
            compras?: number;
            serie?: components["schemas"]["PontoSerie"][];
        };
        PontoSerie: {
            /** Format: date-time */
            data?: string;
            precoUnitario?: number;
        };
        UltimaCompraDTO: {
            empresa?: string;
            representante?: string;
            precoUnitario?: number;
            /** Format: date-time */
            data?: string;
            /** Format: int32 */
            quantidade?: number;
            /** Format: uuid */
            cotacaoId?: string;
        };
        InsightEmpresaDTO: {
            /** Format: int64 */
            convidadaEm?: number;
            /** Format: int64 */
            respondeuEm?: number;
            taxaResposta?: number;
            /** Format: int64 */
            itensVencidos?: number;
            valorCompradoTotal?: number;
            valorComprado90d?: number;
            /** Format: date-time */
            ultimaCompraData?: string;
            ultimaCompraValor?: number;
            /** Format: int64 */
            vezesMaisBarata?: number;
            /** Format: int64 */
            vezes2oLugar?: number;
            /** Format: int64 */
            produtosFornecidos?: number;
            /** Format: int64 */
            tempoMedioRespostaSegundos?: number;
        };
        ContagemPorStatus: {
            /** Format: int64 */
            rascunho?: number;
            /** Format: int64 */
            aberta?: number;
            /** Format: int64 */
            encerrada?: number;
            /** Format: int64 */
            apurada?: number;
            /** Format: int64 */
            cancelada?: number;
        };
        DashboardDTO: {
            porStatus?: components["schemas"]["ContagemPorStatus"];
            /** Format: int64 */
            encerradasSemApurar?: number;
            /** Format: int64 */
            apuradasSemPedidoEnviado?: number;
            proximosPrazos?: components["schemas"]["PrazoProximo"][];
            gastoMes?: number;
            gastoMesAnterior?: number;
            economiaEstimada90d?: number;
            topProdutos?: components["schemas"]["TopGasto"][];
            topEmpresas?: components["schemas"]["TopGasto"][];
        };
        PrazoProximo: {
            /** Format: uuid */
            cotacaoId?: string;
            titulo?: string;
            /** Format: date-time */
            fechaEm?: string;
        };
        TopGasto: {
            nome?: string;
            valor?: number;
        };
        AnaliseComprasDTO: {
            periodo?: components["schemas"]["Periodo"];
            totais?: components["schemas"]["TotalPorEmpresa"][];
            itemMaisComprado?: components["schemas"]["ItemAgg"];
            itemMenosComprado?: components["schemas"]["ItemAgg"];
            ultimosPrecos?: components["schemas"]["UltimoPreco"][];
        };
        ItemAgg: {
            nome?: string;
            /** Format: int64 */
            quantidade?: number;
        };
        Periodo: {
            /** Format: date */
            de?: string;
            /** Format: date */
            ate?: string;
        };
        TotalPorEmpresa: {
            empresa?: string;
            total?: number;
        };
        UltimoPreco: {
            produto?: string;
            precoUnitario?: number;
            empresa?: string;
            /** Format: date-time */
            data?: string;
        };
        FunilAtivacao: {
            /** Format: int64 */
            cadastraram?: number;
            /** Format: int64 */
            verificaram?: number;
            /** Format: int64 */
            criaramCotacao?: number;
            /** Format: int64 */
            apuraram?: number;
        };
        LojasResumo: {
            /** Format: int64 */
            total?: number;
            /** Format: int64 */
            emTeste?: number;
            /** Format: int64 */
            prazoVencido?: number;
            /** Format: int64 */
            suspensas?: number;
        };
        ResumoSaasResponse: {
            lojas?: components["schemas"]["LojasResumo"];
            /** Format: int64 */
            lojasAtivas30d?: number;
            /** Format: int64 */
            cotacoesNoMes?: number;
            gmvTotal?: number;
            cadastros30d?: components["schemas"]["PontoSerie"][];
            funil?: components["schemas"]["FunilAtivacao"];
        };
        Admin: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            email?: string;
            papel?: string;
            emailVerificado?: boolean;
        };
        CompradorAdminResponse: {
            /** Format: uuid */
            id?: string;
            nome?: string;
            slug?: string;
            statusAssinatura?: string;
            /** Format: date-time */
            criadoEm?: string;
            /** Format: date-time */
            ultimoAcessoEm?: string;
            /** Format: date-time */
            trialExpiraEm?: string;
            /** Format: int64 */
            cotacoes?: number;
            /** Format: int64 */
            usuarios?: number;
            /** Format: int64 */
            representantes?: number;
            suspenso?: boolean;
            valorTotalComprado?: number;
            cotacoesPorStatus?: {
                [key: string]: number;
            };
            /** Format: date-time */
            primeiraCotacaoEm?: string;
            /** Format: date-time */
            ultimaAtividadeEm?: string;
            admins?: components["schemas"]["Admin"][];
        };
        TimelineItemResponse: {
            tipo?: string;
            /** Format: date-time */
            quando?: string;
            ator?: string;
            descricao?: string;
        };
        CatalogoGlobalItemDTO: {
            /** Format: uuid */
            id?: string;
            codigoBarras?: string;
            nome?: string;
            marca?: string;
            revisado?: boolean;
            /** Format: date-time */
            criadoEm?: string;
        };
        PaginaCatalogoGlobalDTO: {
            itens?: components["schemas"]["CatalogoGlobalItemDTO"][];
            /** Format: int64 */
            total?: number;
            /** Format: int32 */
            pagina?: number;
            /** Format: int32 */
            tamanhoPagina?: number;
        };
        MetricasCatalogoGlobalDTO: {
            /** Format: int64 */
            totalProdutos?: number;
            /** Format: int64 */
            totalReaproveitamentos?: number;
            /** Format: int64 */
            compradoresQueReaproveitaram?: number;
            /** Format: int64 */
            naoRevisados?: number;
        };
        ExclusaoRepresentanteResponse: {
            /** @enum {string} */
            resultado?: "REMOVIDO" | "ANONIMIZADO";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    registrarLances: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrarLancesRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoParticipanteResponse"];
                };
            };
        };
    };
    registrarCondicoes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrarCondicoesRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoParticipanteResponse"];
                };
            };
        };
    };
    buscar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UsuarioResponse"];
                };
            };
        };
    };
    atualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarUsuarioRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UsuarioResponse"];
                };
            };
        };
    };
    atualizar_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarRepresentanteRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RepresentanteResponse"];
                };
            };
        };
    };
    excluir: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ExclusaoRepresentanteResponse"];
                };
            };
        };
    };
    atualizar_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarProdutoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProdutoResponse"];
                };
            };
        };
    };
    editarItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EditarItemPedidoAvulsoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    removerItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    corrigirLance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participanteId: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorrigirLanceRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    dispensar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DispensarOnboardingRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    atualizar_3: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarEmpresaRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmpresaResponse"];
                };
            };
        };
    };
    excluir_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    buscar_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConfiguracaoResponse"];
                };
            };
        };
    };
    atualizar_4: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarConfiguracaoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConfiguracaoResponse"];
                };
            };
        };
    };
    corrigir: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorrigirCatalogoGlobalRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ConfirmarPedidoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoDTO"];
                };
            };
        };
    };
    finalizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    contexto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConviteContextoResponse"];
                };
            };
        };
    };
    aceitar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AceitarConviteRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConviteAceitoResponse"];
                };
            };
        };
    };
    cadastrarItemBipado: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ColaboradorCadastrarItemBipadoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ItemCotacaoResponse"];
                };
            };
        };
    };
    adicionarItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ColaboradorAdicionarItemRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ItemCotacaoResponse"];
                };
            };
        };
    };
    cadastrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CadastroRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verificar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerificarEmailRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["VerificarEmailResponse"];
                };
            };
        };
    };
    listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UsuarioResponse"][];
                };
            };
        };
    };
    criar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarUsuarioRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UsuarioResponse"];
                };
            };
        };
    };
    alterarSenha: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlterarSenhaRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    inativar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RepresentanteResponse"][];
                };
            };
        };
    };
    criar_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarRepresentanteRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RepresentanteResponse"];
                };
            };
        };
    };
    inativar_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_2: {
        parameters: {
            query?: {
                incluirInativos?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProdutoResponse"][];
                };
            };
        };
    };
    criar_2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarProdutoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProdutoResponse"];
                };
            };
        };
    };
    inativar_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ativar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    importar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    arquivo: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ResultadoImportacaoDTO"];
                };
            };
        };
    };
    bipado: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CadastrarProdutoBipadoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProdutoResponse"];
                };
            };
        };
    };
    enviar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoDTO"];
                };
            };
        };
    };
    criar_3: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarPedidoAvulsoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    adicionarItem_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdicionarItemPedidoAvulsoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    fechar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    reenviarConvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participanteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ParticipanteResponse"];
                };
            };
        };
    };
    reabrir: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participanteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    finalizar_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participanteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    convidar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConvidarRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConviteResponse"];
                };
            };
        };
    };
    reenviar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    semearExemplo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    limparExemplo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_3: {
        parameters: {
            query?: {
                incluirInativos?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmpresaResponse"][];
                };
            };
        };
    };
    criar_4: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarEmpresaRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmpresaResponse"];
                };
            };
        };
    };
    inativar_3: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ativar_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_4: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResumoResponse"][];
                };
            };
        };
    };
    criar_5: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarCotacaoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    recotarSemVencedor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoDuplicadaResponse"];
                };
            };
        };
    };
    reabrir_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    adicionarItem_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdicionarItemRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ItemCotacaoResponse"];
                };
            };
        };
    };
    biparItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BiparItemRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": Record<string, never>;
                };
            };
        };
    };
    encerrar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    duplicar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoDuplicadaResponse"];
                };
            };
        };
    };
    cancelar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    apurar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ResultadoDTO"];
                };
            };
        };
    };
    abrir: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AbrirCotacaoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    listar_5: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cotacaoId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ParticipanteDaCotacaoResponse"][];
                };
            };
        };
    };
    convidar_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cotacaoId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConvidarEmpresasRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ParticipanteResponse"][];
                };
            };
        };
    };
    enviarLinkColaborador: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnviarLinkColaboradorRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_6: {
        parameters: {
            query?: {
                incluirInativos?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CondicaoPagamentoResponse"][];
                };
            };
        };
    };
    criar_6: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CriarCondicaoPagamentoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CondicaoPagamentoResponse"];
                };
            };
        };
    };
    inativar_4: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ativar_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: {
                Authorization?: string;
            };
            path?: never;
            cookie?: {
                simplecote_refresh_token?: string;
            };
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    redefinirSenha: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RedefinirSenhaRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MensagemResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: {
                simplecote_refresh_token?: string;
            };
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    esqueciSenha: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EsqueciSenhaRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MensagemResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    suspender: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    suporte: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SuporteRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SuporteResponse"];
                };
            };
        };
    };
    resetarSenhaAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetarSenhaAdminRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    reenviarVerificacao: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    reativar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    definirPrazo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PrazoRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    notas: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NotaResponse"][];
                };
            };
        };
    };
    adicionarNota: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotaRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NotaResponse"];
                };
            };
        };
    };
    excluir_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revisar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listar_7: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AvisoAdminResponse"][];
                };
            };
        };
    };
    criar_7: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AvisoRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AvisoAdminResponse"];
                };
            };
        };
    };
    alterarPrazo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AbrirCotacaoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    atualizarQuantidadeItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtualizarQuantidadeItemRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    remover: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    alternarAtivo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AvisoAtivoRequest"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    buscar_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoDTO"];
                };
            };
        };
    };
    pdf: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    visualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoParticipanteResponse"];
                };
            };
        };
    };
    existe: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SlugExisteResponse"];
                };
            };
        };
    };
    validarSlug: {
        parameters: {
            query: {
                slug: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": "LIVRE" | "EM_USO" | "RESERVADO" | "INVALIDO";
                };
            };
        };
    };
    estado: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EstadoColaboradorResponse"];
                };
            };
        };
    };
    produtos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProdutoResponse"][];
                };
            };
        };
    };
    lookupProduto: {
        parameters: {
            query: {
                gtin: string;
            };
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DadosProdutoExternoDTO"];
                };
            };
        };
    };
    sugerir: {
        parameters: {
            query: {
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SugestoesCadastroDTO"];
                };
            };
        };
    };
    sugerirMaisDoCatalogoGlobal: {
        parameters: {
            query: {
                q: string;
                pagina?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SugestaoCatalogoGlobalDTO"][];
                };
            };
        };
    };
    lookup: {
        parameters: {
            query: {
                gtin: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DadosProdutoExternoDTO"];
                };
            };
        };
    };
    listarAgregado: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidosAgrupadosResponse"];
                };
            };
        };
    };
    pdf_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    buscar_3: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoAvulsoResponse"];
                };
            };
        };
    };
    membros: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MembroResponse"][];
                };
            };
        };
    };
    exportar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    estado_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OnboardingEstadoResponse"];
                };
            };
        };
    };
    buscar_4: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResponse"];
                };
            };
        };
    };
    excluir_3: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resultado: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ResultadoDTO"];
                };
            };
        };
    };
    resultadoXlsx: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    pedidos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PedidoDTO"][];
                };
            };
        };
    };
    correcoes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CorrecaoLanceDTO"][];
                };
            };
        };
    };
    previaApuracao: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ResultadoDTO"];
                };
            };
        };
    };
    aoVivo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GridAoVivoDTO"];
                };
            };
        };
    };
    aoVivoStream: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SseEmitter"];
                };
            };
        };
    };
    vigentes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AvisoResponse"][];
                };
            };
        };
    };
    insightProdutos: {
        parameters: {
            query?: {
                ids?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": {
                        [key: string]: components["schemas"]["InsightProdutoDTO"];
                    };
                };
            };
        };
    };
    insightEmpresa: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InsightEmpresaDTO"];
                };
            };
        };
    };
    dashboard: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DashboardDTO"];
                };
            };
        };
    };
    compras: {
        parameters: {
            query?: {
                de?: string;
                ate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnaliseComprasDTO"];
                };
            };
        };
    };
    resumo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ResumoSaasResponse"];
                };
            };
        };
    };
    listar_8: {
        parameters: {
            query?: {
                status?: string;
                busca?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CompradorAdminResponse"][];
                };
            };
        };
    };
    detalhe: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CompradorAdminResponse"];
                };
            };
        };
    };
    timeline: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TimelineItemResponse"][];
                };
            };
        };
    };
    relatorio: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": string;
                };
            };
        };
    };
    cotacoes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CotacaoResumoResponse"][];
                };
            };
        };
    };
    listar_9: {
        parameters: {
            query?: {
                q?: string;
                apenasNaoRevisados?: boolean;
                pagina?: number;
                tamanho?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PaginaCatalogoGlobalDTO"];
                };
            };
        };
    };
    metricas: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MetricasCatalogoGlobalDTO"];
                };
            };
        };
    };
    desconvidar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participanteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    encerrar_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revogar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    removerItem_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    removerNota: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                notaId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
