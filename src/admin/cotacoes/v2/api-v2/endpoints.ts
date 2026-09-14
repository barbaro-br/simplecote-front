import { api } from './client'
import type {
  DashboardDTO,
  AnaliseComprasDTO,
  InsightEmpresaDTO,
  InsightProdutoDTO,
  CotacaoResumoResponse,
  CotacaoResponse,
  CriarCotacaoRequest,
  AbrirCotacaoRequest,
  PrazoRequest,
  ParticipanteDaCotacaoResponse,
  ParticipanteResponse,
  ConvidarEmpresasRequest,
  GridAoVivoDTO,
  ResultadoDTO,
  CorrigirLanceRequest,
  CorrecaoLanceDTO,
  AdicionarItemRequest,
  BiparItemRequest,
  AtualizarQuantidadeItemRequest,
  CotacaoDuplicadaResponse,
  PedidosAgrupadosResponse,
  PedidoAvulsoResponse,
  CriarPedidoAvulsoRequest,
  AdicionarItemPedidoAvulsoRequest,
  EditarItemPedidoAvulsoRequest,
  ProdutoResponse,
  CriarProdutoRequest,
  AtualizarProdutoRequest,
  CadastrarProdutoBipadoRequest,
  DadosProdutoExternoDTO,
  ResultadoImportacaoDTO,
  SugestoesCadastroDTO,
  SugestaoCatalogoGlobalDTO,
  EmpresaResponse,
  CriarEmpresaRequest,
  AtualizarEmpresaRequest,
  RepresentanteResponse,
  CriarRepresentanteRequest,
  AtualizarRepresentanteRequest,
  ExclusaoRepresentanteResponse,
  CondicaoPagamentoResponse,
  CriarCondicaoPagamentoRequest,
  MembroResponse,
  ConvidarRequest,
  ConviteResponse,
  ConfiguracaoResponse,
  AtualizarConfiguracaoRequest,
  EnviarLinkColaboradorRequest,
  MensagemResponse,
  UsuarioResponse,
  CriarUsuarioRequest,
  AtualizarUsuarioRequest,
  AlterarSenhaRequest,
  ResumoSaasResponse,
  CompradorAdminResponse,
  TimelineItemResponse,
  NotaResponse,
  NotaRequest,
  SuporteRequest,
  SuporteResponse,
  ResetarSenhaAdminRequest,
  AvisoAdminResponse,
  AvisoRequest,
  AvisoAtivoRequest,
  AvisoResponse,
  PaginaCatalogoGlobalDTO,
  MetricasCatalogoGlobalDTO,
  CorrigirCatalogoGlobalRequest,
  CatalogoGlobalItemDTO,
  OnboardingEstadoResponse,
  DispensarOnboardingRequest,
  CadastroRequest,
  VerificarEmailRequest,
  VerificarEmailResponse,
  SlugExisteResponse,
  CotacaoParticipanteResponse,
  RegistrarLancesRequest,
  RegistrarCondicoesRequest,
  PedidoDTO,
  ConfirmarPedidoRequest,
  EstadoColaboradorResponse,
  ColaboradorAdicionarItemRequest,
  ColaboradorCadastrarItemBipadoRequest,
  ConviteContextoResponse,
  AceitarConviteRequest,
  ConviteAceitoResponse,
} from './types'

// ============================================================
// Análises
// ============================================================
export const analisesApi = {
  dashboard: () => api.get<DashboardDTO>('/api/analises/dashboard'),
  compras: (params?: { inicio?: string; fim?: string }) =>
    api.get<AnaliseComprasDTO>(`/api/analises/compras${qs(params)}`),
  insightEmpresa: (id: string) => api.get<InsightEmpresaDTO>(`/api/analises/empresas/${id}/insight`),
  insightProduto: (produtoId: string) => api.get<InsightProdutoDTO>(`/api/analises/produtos/insight${qs({ produtoId })}`),
}

// ============================================================
// Avisos (visíveis ao tenant logado)
// ============================================================
export const avisosApi = {
  vigentes: () => api.get<AvisoResponse[]>('/api/avisos'),
}

// ============================================================
// Onboarding
// ============================================================
export const onboardingApi = {
  estado: () => api.get<OnboardingEstadoResponse>('/api/onboarding'),
  dispensar: (body: DispensarOnboardingRequest) => api.put<void>('/api/onboarding/dispensar', body),
  semearExemplo: () => api.post<void>('/api/onboarding/dados-exemplo'),
  limparExemplo: () => api.delete<void>('/api/onboarding/dados-exemplo'),
}

// ============================================================
// Cotações
// ============================================================
export const cotacoesApi = {
  listar: () => api.get<CotacaoResumoResponse[]>('/api/cotacoes'),
  criar: (body: CriarCotacaoRequest) => api.post<CotacaoResponse>('/api/cotacoes', body),
  buscar: (id: string) => api.get<CotacaoResponse>(`/api/cotacoes/${id}`),
  excluir: (id: string) => api.delete<void>(`/api/cotacoes/${id}`),
  abrir: (id: string, body: AbrirCotacaoRequest) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/abrir`, body),
  encerrar: (id: string) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/encerrar`),
  cancelar: (id: string) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/cancelar`),
  reabrir: (id: string) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/reabrir`),
  duplicar: (id: string) => api.post<CotacaoDuplicadaResponse>(`/api/cotacoes/${id}/duplicar`),
  apurar: (id: string) => api.post<ResultadoDTO>(`/api/cotacoes/${id}/apurar`),
  recotarSemVencedor: (id: string) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/recotar-sem-vencedor`),
  alterarPrazo: (id: string, body: PrazoRequest) => api.patch<CotacaoResponse>(`/api/cotacoes/${id}/prazo`, body),
  adicionarItem: (id: string, body: AdicionarItemRequest) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/itens`, body),
  biparItem: (id: string, body: BiparItemRequest) => api.post<CotacaoResponse>(`/api/cotacoes/${id}/itens/bipar`, body),
  removerItem: (id: string, itemId: string) => api.delete<void>(`/api/cotacoes/${id}/itens/${itemId}`),
  atualizarQuantidadeItem: (id: string, itemId: string, body: AtualizarQuantidadeItemRequest) =>
    api.patch<void>(`/api/cotacoes/${id}/itens/${itemId}/quantidade`, body),
  participantes: (id: string) => api.get<ParticipanteDaCotacaoResponse[]>(`/api/cotacoes/${id}/participantes`),
  convidarParticipantes: (id: string, body: ConvidarEmpresasRequest) =>
    api.post<ParticipanteResponse[]>(`/api/cotacoes/${id}/participantes`, body),
  aoVivo: (id: string) => api.get<GridAoVivoDTO>(`/api/cotacoes/${id}/ao-vivo`),
  aoVivoStreamUrl: (id: string) => `/api/cotacoes/${id}/ao-vivo/stream`,
  resultado: (id: string) => api.get<ResultadoDTO>(`/api/cotacoes/${id}/resultado`),
  resultadoXlsxUrl: (id: string) => `/api/cotacoes/${id}/resultado.xlsx`,
  pedidos: (id: string) => api.get<PedidoDTO[]>(`/api/cotacoes/${id}/pedidos`),
  correcoes: (id: string) => api.get<CorrecaoLanceDTO[]>(`/api/cotacoes/${id}/correcoes`),
  previaApuracao: (id: string) => api.get<ResultadoDTO>(`/api/cotacoes/${id}/apuracao/previa`),
}

// ============================================================
// Participantes (dentro de uma cotação)
// ============================================================
export const participantesApi = {
  desconvidar: (participanteId: string) => api.delete<void>(`/api/participantes/${participanteId}`),
  reenviarConvite: (participanteId: string) => api.post<void>(`/api/participantes/${participanteId}/reenviar-convite`),
  reabrir: (participanteId: string) => api.post<void>(`/api/participantes/${participanteId}/reabrir`),
  finalizar: (participanteId: string) => api.post<void>(`/api/participantes/${participanteId}/finalizar`),
  corrigirLance: (participanteId: string, itemId: string, body: CorrigirLanceRequest) =>
    api.put<void>(`/api/participantes/${participanteId}/lances/${itemId}`, body),
}

// ============================================================
// Pedidos
// ============================================================
export const pedidosApi = {
  listar: () => api.get<PedidosAgrupadosResponse>('/api/pedidos'),
  enviar: (id: string) => api.post<void>(`/api/pedidos/${id}/enviar`),
  pdfUrl: (id: string) => `/api/pedidos/${id}.pdf`,
}

export const pedidosAvulsosApi = {
  criar: (body: CriarPedidoAvulsoRequest) => api.post<PedidoAvulsoResponse>('/api/pedidos/avulsos', body),
  buscar: (id: string) => api.get<PedidoAvulsoResponse>(`/api/pedidos/avulsos/${id}`),
  fechar: (id: string) => api.post<PedidoAvulsoResponse>(`/api/pedidos/avulsos/${id}/fechar`),
  adicionarItem: (id: string, body: AdicionarItemPedidoAvulsoRequest) =>
    api.post<PedidoAvulsoResponse>(`/api/pedidos/avulsos/${id}/itens`, body),
  editarItem: (id: string, itemId: string, body: EditarItemPedidoAvulsoRequest) =>
    api.put<PedidoAvulsoResponse>(`/api/pedidos/avulsos/${id}/itens/${itemId}`, body),
  removerItem: (id: string, itemId: string) => api.delete<PedidoAvulsoResponse>(`/api/pedidos/avulsos/${id}/itens/${itemId}`),
}

// ============================================================
// Produtos
// ============================================================
export const produtosApi = {
  listar: () => api.get<ProdutoResponse[]>('/api/produtos'),
  criar: (body: CriarProdutoRequest) => api.post<ProdutoResponse>('/api/produtos', body),
  atualizar: (id: string, body: AtualizarProdutoRequest) => api.put<ProdutoResponse>(`/api/produtos/${id}`, body),
  ativar: (id: string) => api.post<ProdutoResponse>(`/api/produtos/${id}/ativar`),
  inativar: (id: string) => api.post<ProdutoResponse>(`/api/produtos/${id}/inativar`),
  cadastrarBipado: (body: CadastrarProdutoBipadoRequest) => api.post<ProdutoResponse>('/api/produtos/bipado', body),
  lookup: (gtin: string) => api.get<DadosProdutoExternoDTO | null>(`/api/produtos/lookup${qs({ gtin })}`, { lookup: true }),
  sugestoes: (q: string) => api.get<SugestoesCadastroDTO>(`/api/produtos/sugestoes${qs({ q })}`),
  sugestoesCatalogoGlobal: (q: string, pagina = 1) =>
    api.get<SugestaoCatalogoGlobalDTO[]>(`/api/produtos/sugestoes/catalogo-global${qs({ q, pagina: String(pagina) })}`),
  importar: (arquivo: File) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    return api.post<ResultadoImportacaoDTO>('/api/produtos/importar', form)
  },
}

// ============================================================
// Empresas
// ============================================================
export const empresasApi = {
  listar: () => api.get<EmpresaResponse[]>('/api/empresas'),
  criar: (body: CriarEmpresaRequest) => api.post<EmpresaResponse>('/api/empresas', body),
  atualizar: (id: string, body: AtualizarEmpresaRequest) => api.put<EmpresaResponse>(`/api/empresas/${id}`, body),
  excluir: (id: string) => api.delete<void>(`/api/empresas/${id}`),
  ativar: (id: string) => api.post<EmpresaResponse>(`/api/empresas/${id}/ativar`),
  inativar: (id: string) => api.post<EmpresaResponse>(`/api/empresas/${id}/inativar`),
}

// ============================================================
// Representantes
// ============================================================
export const representantesApi = {
  listar: () => api.get<RepresentanteResponse[]>('/api/representantes'),
  criar: (body: CriarRepresentanteRequest) => api.post<RepresentanteResponse>('/api/representantes', body),
  atualizar: (id: string, body: AtualizarRepresentanteRequest) => api.put<RepresentanteResponse>(`/api/representantes/${id}`, body),
  excluir: (id: string) => api.delete<ExclusaoRepresentanteResponse>(`/api/representantes/${id}`),
  inativar: (id: string) => api.post<RepresentanteResponse>(`/api/representantes/${id}/inativar`),
}

// ============================================================
// Condições de pagamento
// ============================================================
export const condicoesPagamentoApi = {
  listar: () => api.get<CondicaoPagamentoResponse[]>('/api/condicoes-pagamento'),
  criar: (body: CriarCondicaoPagamentoRequest) => api.post<CondicaoPagamentoResponse>('/api/condicoes-pagamento', body),
  ativar: (id: string) => api.post<CondicaoPagamentoResponse>(`/api/condicoes-pagamento/${id}/ativar`),
  inativar: (id: string) => api.post<CondicaoPagamentoResponse>(`/api/condicoes-pagamento/${id}/inativar`),
}

// ============================================================
// Organização
// ============================================================
export const organizacaoApi = {
  membros: () => api.get<MembroResponse[]>('/api/organizacao/membros'),
  convidar: (body: ConvidarRequest) => api.post<ConviteResponse>('/api/organizacao/convites', body),
  revogarConvite: (id: string) => api.delete<void>(`/api/organizacao/convites/${id}`),
  reenviarConvite: (id: string) => api.post<void>(`/api/organizacao/convites/${id}/reenviar`),
  exportacaoUrl: () => `/api/organizacao/exportacao`,
  encerrarConta: () => api.delete<void>('/api/organizacao'),
}

// ============================================================
// Configurações
// ============================================================
export const configuracoesApi = {
  buscar: () => api.get<ConfiguracaoResponse>('/api/configuracoes'),
  atualizar: (body: AtualizarConfiguracaoRequest) => api.put<ConfiguracaoResponse>('/api/configuracoes', body),
  enviarLinkColaborador: (body: EnviarLinkColaboradorRequest) =>
    api.post<MensagemResponse>('/api/configuracoes/colaborador/enviar-link', body),
}

// ============================================================
// Usuários internos
// ============================================================
export const usuariosApi = {
  listar: () => api.get<UsuarioResponse[]>('/api/usuarios'),
  criar: (body: CriarUsuarioRequest) => api.post<UsuarioResponse>('/api/usuarios', body),
  buscar: (id: string) => api.get<UsuarioResponse>(`/api/usuarios/${id}`),
  atualizar: (id: string, body: AtualizarUsuarioRequest) => api.put<UsuarioResponse>(`/api/usuarios/${id}`, body),
  alterarSenha: (id: string, body: AlterarSenhaRequest) => api.post<void>(`/api/usuarios/${id}/senha`, body),
  inativar: (id: string) => api.post<UsuarioResponse>(`/api/usuarios/${id}/inativar`),
}

// ============================================================
// Backoffice (SUPER_ADMIN)
// ============================================================
export const adminApi = {
  resumo: () => api.get<ResumoSaasResponse>('/api/admin/resumo'),
  compradores: () => api.get<CompradorAdminResponse[]>('/api/admin/compradores'),
  comprador: (id: string) => api.get<CompradorAdminResponse>(`/api/admin/compradores/${id}`),
  timeline: (id: string) => api.get<TimelineItemResponse[]>(`/api/admin/compradores/${id}/timeline`),
  relatorio: (id: string) => api.get<unknown>(`/api/admin/compradores/${id}/relatorio`),
  cotacoes: (id: string) => api.get<CotacaoResumoResponse[]>(`/api/admin/compradores/${id}/cotacoes`),
  notas: (id: string) => api.get<NotaResponse[]>(`/api/admin/compradores/${id}/notas`),
  adicionarNota: (id: string, body: NotaRequest) => api.post<NotaResponse>(`/api/admin/compradores/${id}/notas`, body),
  removerNota: (id: string, notaId: string) => api.delete<void>(`/api/admin/compradores/${id}/notas/${notaId}`),
  suspender: (id: string) => api.post<CompradorAdminResponse>(`/api/admin/compradores/${id}/suspender`),
  reativar: (id: string) => api.post<CompradorAdminResponse>(`/api/admin/compradores/${id}/reativar`),
  excluir: (id: string) => api.post<void>(`/api/admin/compradores/${id}/excluir`),
  reenviarVerificacao: (id: string) => api.post<void>(`/api/admin/compradores/${id}/reenviar-verificacao`),
  resetarSenhaAdmin: (id: string, body: ResetarSenhaAdminRequest) =>
    api.post<void>(`/api/admin/compradores/${id}/resetar-senha-admin`, body),
  definirPrazo: (id: string, body: PrazoRequest) => api.post<CompradorAdminResponse>(`/api/admin/compradores/${id}/prazo`, body),
  suporte: (id: string, body: SuporteRequest) => api.post<SuporteResponse>(`/api/admin/compradores/${id}/suporte`, body),
  avisos: () => api.get<AvisoAdminResponse[]>('/api/admin/avisos'),
  criarAviso: (body: AvisoRequest) => api.post<AvisoAdminResponse>('/api/admin/avisos', body),
  removerAviso: (id: string) => api.delete<void>(`/api/admin/avisos/${id}`),
  alternarAtivoAviso: (id: string, body: AvisoAtivoRequest) => api.patch<AvisoAdminResponse>(`/api/admin/avisos/${id}`, body),
  catalogoGlobal: (cursor?: string) => api.get<PaginaCatalogoGlobalDTO>(`/api/admin/catalogo-global${qs({ cursor })}`),
  catalogoGlobalMetricas: () => api.get<MetricasCatalogoGlobalDTO>('/api/admin/catalogo-global/metricas'),
  corrigirCatalogoGlobal: (id: string, body: CorrigirCatalogoGlobalRequest) =>
    api.put<CatalogoGlobalItemDTO>(`/api/admin/catalogo-global/${id}`, body),
  revisarCatalogoGlobal: (id: string) => api.post<CatalogoGlobalItemDTO>(`/api/admin/catalogo-global/${id}/revisar`),
}

// ============================================================
// Público (sem autenticação)
// ============================================================
export const publicApi = {
  cadastrar: (body: CadastroRequest) => api.post<void>('/public/cadastro', body),
  verificarCadastro: (body: VerificarEmailRequest) => api.post<VerificarEmailResponse>('/public/cadastro/verificar', body),
  validarSlug: (slug: string) => api.get<SlugExisteResponse>(`/public/compradores/validar-slug${qs({ slug })}`),
  slugExiste: (slug: string) => api.get<SlugExisteResponse>(`/public/compradores/${slug}/existe`),

  cotacaoPorToken: (token: string) => api.get<CotacaoParticipanteResponse>(`/public/cotacoes/${token}`),
  registrarLances: (token: string, body: RegistrarLancesRequest) => api.put<void>(`/public/cotacoes/${token}/lances`, body),
  registrarCondicoes: (token: string, body: RegistrarCondicoesRequest) => api.put<void>(`/public/cotacoes/${token}/condicoes`, body),
  finalizarCotacao: (token: string) => api.post<void>(`/public/cotacoes/${token}/finalizar`),

  pedidoPorToken: (token: string) => api.get<PedidoDTO>(`/public/pedidos/${token}`),
  pedidoPdfUrl: (token: string) => `/public/pedidos/${token}.pdf`,
  confirmarPedido: (token: string, body: ConfirmarPedidoRequest) => api.post<void>(`/public/pedidos/${token}/confirmar`, body),

  colaboradorEstado: (token: string) => api.get<EstadoColaboradorResponse>(`/public/colaborador/${token}`),
  colaboradorProdutos: (token: string) => api.get<ProdutoResponse[]>(`/public/colaborador/${token}/produtos`),
  colaboradorLookupProduto: (token: string, gtin: string) =>
    api.get<DadosProdutoExternoDTO | null>(`/public/colaborador/${token}/produtos/lookup${qs({ gtin })}`, { lookup: true }),
  colaboradorAdicionarItem: (token: string, body: ColaboradorAdicionarItemRequest) =>
    api.post<void>(`/public/colaborador/${token}/itens`, body),
  colaboradorCadastrarItemBipado: (token: string, body: ColaboradorCadastrarItemBipadoRequest) =>
    api.post<void>(`/public/colaborador/${token}/produtos/bipado`, body),

  conviteContexto: (token: string) => api.get<ConviteContextoResponse>(`/public/convites/${token}`),
  aceitarConvite: (token: string, body: AceitarConviteRequest) => api.post<ConviteAceitoResponse>(`/public/convites/${token}`, body),
}

function qs(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (entries.length === 0) return ''
  const sp = new URLSearchParams()
  for (const [k, v] of entries) sp.set(k, String(v))
  return `?${sp.toString()}`
}
