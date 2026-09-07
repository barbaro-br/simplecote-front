// Papéis de quem opera o painel (changes papeis-e-convites-da-organizacao e
// backoffice-do-saas, espelha `PapelUsuario` do back). Hierarquia fixa
// OWNER > ADMIN > OPERADOR; o OWNER é único por Comprador e só nasce pelo
// cadastro público. SUPER_ADMIN (change backoffice-do-saas) é o operador do SaaS:
// comprador_id nulo, OUTRO EIXO — FORA da hierarquia OWNER > ADMIN > OPERADOR.
// Fonte da verdade: back (enforcement no servidor).
export type Papel = 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'

export const ROTULO_PAPEL: Record<Papel, string> = {
  OWNER: 'Dono',
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
  SUPER_ADMIN: 'Super admin',
}

// Áreas sensíveis: só OWNER/ADMIN veem (OPERADOR toma 403 no back).
export type AreaSensivel = 'membros' | 'cobranca'

export function podeVerArea(papel: Papel | null, area: AreaSensivel): boolean {
  // OWNER e ADMIN veem as áreas sensíveis; OPERADOR não. Hoje as duas áreas
  // (membros e cobrança) têm a mesma regra — `area` fica para divergência futura.
  void area
  return papel === 'OWNER' || papel === 'ADMIN'
}
