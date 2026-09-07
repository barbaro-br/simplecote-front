// Fonte única da descrição dos planos e quotas (RISCOS-TRANSVERSAIS §G).
// A change `planos-e-cobranca` IMPORTA daqui — nunca duplica. Se um dia os
// planos vierem do back (`GET /api/assinatura`), este módulo vira o fetch — um
// ponto de mudança. Valores iniciais; copy/preços são iteráveis.

export interface QuotaPlano {
  rotulo: string
  /** null = ilimitado */
  limite: number | null
}

export interface Plano {
  id: string
  nome: string
  /** em reais; 0 = gratuito (teste) */
  precoMensal: number
  descricao: string
  destaque?: boolean
  quotas: QuotaPlano[]
}

export const PLANOS: Plano[] = [
  {
    id: 'teste',
    nome: 'Teste grátis',
    precoMensal: 0,
    descricao: 'Para experimentar o SimpleCote sem compromisso.',
    quotas: [
      { rotulo: 'Cotações por mês', limite: 5 },
      { rotulo: 'Usuários', limite: 2 },
      { rotulo: 'Representantes', limite: 10 },
    ],
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    precoMensal: 149,
    descricao: 'Para supermercados que querem cotar com regularidade.',
    destaque: true,
    quotas: [
      { rotulo: 'Cotações por mês', limite: 100 },
      { rotulo: 'Usuários', limite: 10 },
      { rotulo: 'Representantes', limite: 200 },
    ],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    precoMensal: 299,
    descricao: 'Para operações maiores, com volume e equipe dedicados.',
    quotas: [
      { rotulo: 'Cotações por mês', limite: null },
      { rotulo: 'Usuários', limite: null },
      { rotulo: 'Representantes', limite: null },
    ],
  },
]
