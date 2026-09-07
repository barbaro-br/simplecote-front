// Papéis de quem opera o painel (change papeis-e-convites-da-organizacao,
// espelha `PapelUsuario` do back). Hierarquia fixa OWNER > ADMIN > OPERADOR.
// O OWNER é único por Comprador e só nasce pelo cadastro público — nunca pelo
// CRUD admin nem por convite. Fonte da verdade: back (enforcement no servidor).
export type Papel = 'OWNER' | 'ADMIN' | 'OPERADOR'

export const ROTULO_PAPEL: Record<Papel, string> = {
  OWNER: 'Dono',
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
}

// Áreas sensíveis: só OWNER/ADMIN veem (OPERADOR toma 403 no back).
export type AreaSensivel = 'membros' | 'cobranca'

export function podeVerArea(papel: Papel | null, area: AreaSensivel): boolean {
  // OWNER e ADMIN veem as áreas sensíveis; OPERADOR não. Hoje as duas áreas
  // (membros e cobrança) têm a mesma regra — `area` fica para divergência futura.
  void area
  return papel === 'OWNER' || papel === 'ADMIN'
}
