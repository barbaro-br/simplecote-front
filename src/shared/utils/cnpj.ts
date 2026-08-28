export function apenasNumeros(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function validarCNPJ(cnpj: string): boolean {
  const numeros = apenasNumeros(cnpj)
  if (numeros.length !== 14) return false
  
  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(numeros)) return false

  // Valida DVs
  let tamanho = numeros.length - 2
  let numerosSubstring = numeros.substring(0, tamanho)
  const digitos = numeros.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numerosSubstring.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numerosSubstring = numeros.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numerosSubstring.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) return false

  return true
}

export function aplicarMascaraCNPJ(valor: string): string {
  return apenasNumeros(valor)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,4})/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .substring(0, 18)
}
