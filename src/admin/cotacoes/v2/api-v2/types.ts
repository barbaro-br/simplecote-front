// GERADO a partir de components.schemas do simplecote-openapi.json — não editar campos à mão sem checar a spec.

export interface AbrirCotacaoRequest {
  prazo: string
}

export interface AceitarConviteRequest {
  senha: string
}

export interface AdicionarItemPedidoAvulsoRequest {
  produtoId: string
  precoEmbalagem: number
  quantidade: number
}

export interface AdicionarItemRequest {
  produtoId: string
  quantidade: number
}

export interface Admin {
  id?: string
  nome?: string
  email?: string
  papel?: string
  emailVerificado?: boolean
}

export interface AlterarSenhaRequest {
  senha: string
}

export interface AnaliseComprasDTO {
  periodo?: Periodo
  totais?: (TotalPorEmpresa)[]
  itemMaisComprado?: ItemAgg
  itemMenosComprado?: ItemAgg
  ultimosPrecos?: (UltimoPreco)[]
}

export interface AtualizarConfiguracaoRequest {
  nome: string
  corPrimaria: string
  telefone: string
  layoutEmail: string
  estiloNavegacao: 'LATERAL' | 'INFERIOR'
  tema: 'CLARO' | 'ESCURO'
  emailContato?: string
  mostrarMargemLucro?: boolean
}

export interface AtualizarEmpresaRequest {
  nome: string
}

export interface AtualizarProdutoRequest {
  nome: string
  unidade: string
  quantidadePorEmbalagem: number
}

export interface AtualizarQuantidadeItemRequest {
  quantidade: number
}

export interface AtualizarRepresentanteRequest {
  nome: string
  email: string
  whatsapp?: string
}

export interface AtualizarUsuarioRequest {
  nome: string
  email: string
  papel: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
}

export interface AvisoAdminResponse {
  id?: string
  titulo?: string
  corpo?: string
  nivel?: 'INFO' | 'ATENCAO' | 'CRITICO'
  publicadoEm?: string
  expiraEm?: string
  ativo?: boolean
  criadoPor?: string
}

export interface AvisoAtivoRequest {
  ativo: boolean
}

export interface AvisoRequest {
  titulo: string
  corpo: string
  nivel: 'INFO' | 'ATENCAO' | 'CRITICO'
  expiraEm?: string
}

export interface AvisoResponse {
  id?: string
  titulo?: string
  corpo?: string
  nivel?: 'INFO' | 'ATENCAO' | 'CRITICO'
  publicadoEm?: string
  expiraEm?: string
}

export interface BiparItemRequest {
  gtin: string
}

export interface CadastrarProdutoBipadoRequest {
  gtin: string
  nome: string
  unidade: string
  quantidadePorEmbalagem?: number
  cotacaoId?: string
}

export interface CadastroRequest {
  nomeSupermercado: string
  slug: string
  email: string
  senha: string
}

export interface CatalogoGlobalItemDTO {
  id?: string
  codigoBarras?: string
  nome?: string
  marca?: string
  revisado?: boolean
  criadoEm?: string
}

export interface Celula {
  participanteId?: string
  empresaId?: string
  empresa?: string
  preco?: number
  precoUnitario?: number
  status?: 'COTADO' | 'NAO_COTADO' | 'PENDENTE'
}

export interface ColaboradorAdicionarItemRequest {
  cotacaoId: string
  produtoId: string
  quantidade: number
}

export interface ColaboradorCadastrarItemBipadoRequest {
  cotacaoId: string
  gtin: string
  nome: string
  unidade: string
  quantidadePorEmbalagem?: number
  quantidade?: number
}

export interface CompradorAdminResponse {
  id?: string
  nome?: string
  slug?: string
  statusAssinatura?: string
  criadoEm?: string
  ultimoAcessoEm?: string
  trialExpiraEm?: string
  cotacoes?: number
  usuarios?: number
  representantes?: number
  suspenso?: boolean
  valorTotalComprado?: number
  cotacoesPorStatus?: Record<string, unknown>
  primeiraCotacaoEm?: string
  ultimaAtividadeEm?: string
  admins?: (Admin)[]
}

export interface CondicaoPagamentoResponse {
  id?: string
  descricao?: string
  ativo?: boolean
}

export interface ConfiguracaoResponse {
  nome?: string
  corPrimaria?: string
  telefone?: string
  layoutEmail?: string
  estiloNavegacao?: 'LATERAL' | 'INFERIOR'
  tema?: 'CLARO' | 'ESCURO'
  linkColaboradorToken?: string
  emailContato?: string
  mostrarMargemLucro?: boolean
}

export interface ConfirmarPedidoRequest {
  observacao?: string
}

export interface ContagemPorStatus {
  rascunho?: number
  aberta?: number
  encerrada?: number
  apurada?: number
  cancelada?: number
}

export interface ConvidarEmpresasRequest {
  empresaIds: (string)[]
}

export interface ConvidarRequest {
  email: string
  papel: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
}

export interface ConviteAceitoResponse {
  slug?: string
}

export interface ConviteContextoResponse {
  nomeLoja?: string
  papel?: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
}

export interface ConviteResponse {
  id?: string
}

export interface CorrecaoLanceDTO {
  id?: string
  lanceId?: string
  participanteId?: string
  itemCotacaoId?: string
  usuarioId?: string
  statusAnterior?: string
  statusNovo?: string
  precoAnterior?: number
  precoNovo?: number
  criadoEm?: string
}

export interface CorrigirCatalogoGlobalRequest {
  nome: string
  marca?: string
}

export interface CorrigirLanceRequest {
  preco?: number
  naoCotado?: boolean
}

export interface CotacaoAbertaResumo {
  id?: string
  titulo?: string
}

export interface CotacaoDuplicadaResponse {
  cotacao?: CotacaoResponse
  omitidos?: (ItemOmitido)[]
}

export interface CotacaoParticipanteResponse {
  cotacaoId?: string
  titulo?: string
  status?: 'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'
  prazo?: string
  podeEditar?: boolean
  participanteStatus?: 'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO'
  representanteNome?: string
  empresaNome?: string
  compradorNome?: string
  itens?: (ItemLanceResponse)[]
  condicaoPagamento?: string
  prazoEntregaEstimado?: string
  condicoesPagamentoDisponiveis?: (CondicaoPagamentoResponse)[]
}

export interface CotacaoResponse {
  id?: string
  titulo?: string
  status?: 'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'
  prazo?: string
  criadaEm?: string
  encerradaEm?: string
  itens?: (ItemCotacaoResponse)[]
  prazoVencido?: boolean
  condicaoPagamentoPreferencial?: string
}

export interface CotacaoResumoResponse {
  id?: string
  titulo?: string
  status?: 'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'
  prazo?: string
  criadaEm?: string
  encerradaEm?: string
  valorTotalComprado?: number
  prazoVencido?: boolean
}

export interface CriarCondicaoPagamentoRequest {
  descricao: string
}

export interface CriarCotacaoRequest {
  titulo: string
  condicaoPagamentoPreferencialId?: string
}

export interface CriarEmpresaRequest {
  nome: string
}

export interface CriarPedidoAvulsoRequest {
  empresaId: string
  produtoId?: string
  precoEmbalagem?: number
  quantidade?: number
  condicaoPagamentoId?: string
  condicaoPagamentoTexto?: string
  prazoEntregaEstimado?: string
}

export interface CriarProdutoRequest {
  nome: string
  codigoBarras?: string
  unidade: string
  quantidadePorEmbalagem: number
}

export interface CriarRepresentanteRequest {
  empresaId: string
  nome: string
  email: string
  whatsapp?: string
}

export interface CriarUsuarioRequest {
  nome: string
  email: string
  papel: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
  senha: string
}

export interface DadosProdutoExternoDTO {
  gtin?: string
  nome?: string
  marca?: string
}

export interface DashboardDTO {
  porStatus?: ContagemPorStatus
  encerradasSemApurar?: number
  apuradasSemPedidoEnviado?: number
  proximosPrazos?: (PrazoProximo)[]
  gastoMes?: number
  gastoMesAnterior?: number
  economiaEstimada90d?: number
  topProdutos?: (TopGasto)[]
  topEmpresas?: (TopGasto)[]
}

export interface DispensarOnboardingRequest {
  dispensado?: boolean
}

export interface EditarItemPedidoAvulsoRequest {
  precoEmbalagem: number
  quantidade: number
}

export interface EmpresaResponse {
  id?: string
  nome?: string
  ativo?: boolean
}

export interface EnviarLinkColaboradorRequest {
  email: string
}

export interface EsqueciSenhaRequest {
  email: string
}

export interface EstadoColaboradorResponse {
  nomeLoja?: string
  cotacoesAbertas?: (CotacaoAbertaResumo)[]
}

export interface ExclusaoRepresentanteResponse {
  resultado?: 'REMOVIDO' | 'ANONIMIZADO'
}

export interface FunilAtivacao {
  cadastraram?: number
  verificaram?: number
  criaramCotacao?: number
  apuraram?: number
}

export interface GridAoVivoDTO {
  status?: 'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'
  respondidos?: number
  totalParticipantes?: number
  itens?: (ItemGrid)[]
}

export interface GrupoCotacaoDTO {
  cotacaoId?: string
  tituloCotacao?: string
  pedidos?: (PedidoResumoDTO)[]
}

export interface InsightEmpresaDTO {
  convidadaEm?: number
  respondeuEm?: number
  taxaResposta?: number
  itensVencidos?: number
  valorCompradoTotal?: number
  valorComprado90d?: number
  ultimaCompraData?: string
  ultimaCompraValor?: number
  vezesMaisBarata?: number
  vezes2oLugar?: number
  produtosFornecidos?: number
  tempoMedioRespostaSegundos?: number
}

export interface InsightProdutoDTO {
  ultimaCompra?: UltimaCompraDTO
  menorPrecoUnitario?: number
  precoMedioUnitario90d?: number
  variacaoPct?: number
  fornecedoresDistintos?: number
  compras?: number
  serie?: (PontoSerie)[]
}

export interface ItemAgg {
  nome?: string
  quantidade?: number
}

export interface ItemCotacaoResponse {
  id?: string
  produtoId?: string
  nomeSnapshot?: string
  codigoBarrasSnapshot?: string
  unidadeSnapshot?: string
  quantidadeSolicitada?: number
  quantidadePorEmbalagemSnapshot?: number
  criadoEm?: string
}

export interface ItemGrid {
  itemCotacaoId?: string
  nome?: string
  unidade?: string
  quantidadePorEmbalagem?: number
  quantidadeSolicitada?: number
  ultimoPrecoUnitario?: number
  ultimaCompraEmpresa?: string
  ultimaCompraEm?: string
  menorPrecoUnitario?: number
  precos?: (Celula)[]
  criadoEm?: string
}

export interface ItemLanceRequest {
  itemCotacaoId: string
  preco?: number
  naoCotado?: boolean
}

export interface ItemLanceResponse {
  itemCotacaoId?: string
  nome?: string
  codigoBarras?: string
  unidade?: string
  quantidadeSolicitada?: number
  quantidadePorEmbalagemSnapshot?: number
  preco?: number
  precoUnitario?: number
  statusLance?: 'PENDENTE' | 'COTADO' | 'NAO_COTADO'
}

export interface ItemOmitido {
  produtoId?: string
  nome?: string
  motivo?: string
}

export interface ItemPedidoAvulsoDTO {
  id?: string
  produtoId?: string
  nomeSnapshot?: string
  unidadeSnapshot?: string
  quantidadePorEmbalagemSnapshot?: number
  precoEmbalagem?: number
  precoUnitario?: number
  quantidade?: number
  subtotal?: number
}

export interface ItemPedidoDTO {
  id?: string
  itemCotacaoId?: string
  lanceId?: string
  nomeSnapshot?: string
  unidadeSnapshot?: string
  quantidadePorEmbalagemSnapshot?: number
  quantidade?: number
  precoEmbalagem?: number
  precoUnitario?: number
  subtotal?: number
  decididoPorDesempate?: boolean
}

export interface LinhaIgnorada {
  linha?: number
  motivo?: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface LojasResumo {
  total?: number
  emTeste?: number
  prazoVencido?: number
  suspensas?: number
}

export interface MembroResponse {
  id?: string
  nome?: string
  email?: string
  papel?: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
  status?: 'ATIVO' | 'INATIVO' | 'CONVITE_PENDENTE'
}

export interface MensagemResponse {
  mensagem?: string
}

export interface MetricasCatalogoGlobalDTO {
  totalProdutos?: number
  totalReaproveitamentos?: number
  compradoresQueReaproveitaram?: number
  naoRevisados?: number
}

export interface NotaRequest {
  texto?: string
}

export interface NotaResponse {
  id?: string
  texto?: string
  autorSuperAdminId?: string
  criadoEm?: string
}

export interface OnboardingEstadoResponse {
  temProduto?: boolean
  temRepresentante?: boolean
  temCotacao?: boolean
  dispensado?: boolean
  modoTeste?: boolean
}

export interface PaginaCatalogoGlobalDTO {
  itens?: (CatalogoGlobalItemDTO)[]
  total?: number
  pagina?: number
  tamanhoPagina?: number
}

export interface ParticipanteDaCotacaoResponse {
  participanteId?: string
  empresaId?: string
  empresaNome?: string
  representanteNome?: string
  conviteStatus?: 'ENVIADO' | 'FALHOU'
  participanteStatus?: 'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO'
  linkMagico?: string
  conviteEnviadoEm?: string
  visualizadoEm?: string
  respondidoEm?: string
  emailRepresentante?: string
  whatsappRepresentante?: string
  pedidoMinimo?: number | null
}

export interface ParticipanteResponse {
  id?: string
  representanteId?: string
  status?: 'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO'
  linkMagico?: string
}

export interface PedidoAvulsoResponse {
  id?: string
  status?: string
  itens?: (ItemPedidoAvulsoDTO)[]
  quantidadeItens?: number
  total?: number
  geradoEm?: string
  condicaoPagamento?: string
  prazoEntregaEstimado?: string
  empresaNome?: string
  representanteNome?: string
  pedidoMinimo?: number | null
}

export interface PedidoDTO {
  id?: string
  cotacaoId?: string
  participanteId?: string
  origem?: string
  empresaNome?: string
  status?: string
  observacao?: string
  geradoEm?: string
  enviadoEm?: string
  confirmadoEm?: string
  itens?: (ItemPedidoDTO)[]
  total?: number
  condicaoPagamento?: string
  prazoEntregaEstimado?: string
  pedidoMinimo?: number | null
}

export interface PedidoResumoDTO {
  id?: string
  origem?: string
  status?: string
  empresaNome?: string
  total?: number
  quantidadeItens?: number
  condicaoPagamento?: string
  prazoEntregaEstimado?: string
  geradoEm?: string
  pedidoMinimo?: number | null
}

export interface PedidosAgrupadosResponse {
  grupos?: (GrupoCotacaoDTO)[]
  avulsos?: (PedidoResumoDTO)[]
}

export interface Periodo {
  de?: string
  ate?: string
}

export interface PontoSerie {
  data?: string
  precoUnitario?: number
}

export interface PrazoProximo {
  cotacaoId?: string
  titulo?: string
  fechaEm?: string
}

export interface PrazoRequest {
  expiraEm?: string
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  properties?: Record<string, unknown>
}

export interface ProdutoResponse {
  id?: string
  nome?: string
  codigoBarras?: string
  unidade?: string
  quantidadePorEmbalagem?: number
  ativo?: boolean
}

export interface RedefinirSenhaRequest {
  email: string
  codigo: string
  novaSenha: string
}

export interface RegistrarCondicoesRequest {
  condicaoPagamentoId?: string
  prazoEntregaEstimado?: string
}

export interface RegistrarLancesRequest {
  lances: (ItemLanceRequest)[]
}

export interface RepresentanteResponse {
  id?: string
  empresaId?: string
  nome?: string
  email?: string
  whatsapp?: string
  ativo?: boolean
}

export interface ResetarSenhaAdminRequest {
  usuarioId: string
}

export interface ResultadoDTO {
  pedidos?: (PedidoDTO)[]
  itensSemVencedor?: (ItemCotacaoResponse)[]
}

export interface ResultadoImportacaoDTO {
  criados?: number
  ignorados?: number
  detalhes?: (LinhaIgnorada)[]
}

export interface ResumoSaasResponse {
  lojas?: LojasResumo
  lojasAtivas30d?: number
  cotacoesNoMes?: number
  gmvTotal?: number
  cadastros30d?: (PontoSerie)[]
  funil?: FunilAtivacao
}

export interface SlugExisteResponse {
  existe?: boolean
}

export interface SseEmitter {
  timeout?: number
}

export interface SugestaoCatalogoGlobalDTO {
  codigoBarras?: string
  nome?: string
  marca?: string
}

export interface SugestoesCadastroDTO {
  doProprioCatalogo?: (ProdutoResponse)[]
  doCatalogoGlobal?: (SugestaoCatalogoGlobalDTO)[]
}

export interface SuporteRequest {
  motivo: string
}

export interface SuporteResponse {
  token?: string
  expiraEm?: string
}

export interface TimelineItemResponse {
  tipo?: string
  quando?: string
  ator?: string
  descricao?: string
}

export interface TokenResponse {
  token?: string
}

export interface TopGasto {
  nome?: string
  valor?: number
}

export interface TotalPorEmpresa {
  empresa?: string
  total?: number
}

export interface UltimaCompraDTO {
  empresa?: string
  representante?: string
  precoUnitario?: number
  data?: string
  quantidade?: number
  cotacaoId?: string
}

export interface UltimoPreco {
  produto?: string
  precoUnitario?: number
  empresa?: string
  data?: string
}

export interface UsuarioResponse {
  id?: string
  nome?: string
  email?: string
  papel?: 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'
  ativo?: boolean
}

export interface VerificarEmailRequest {
  token: string
}

export interface VerificarEmailResponse {
  slug?: string
}
