import { dataHoraBr } from '@/shared/format/formatters'

type MensagemArgs = {
  representanteNome: string
  titulo: string
  empresaNome: string
  prazo: string | null
  link: string
}

export function montarMensagemConvite({ representanteNome, titulo, empresaNome, prazo, link }: MensagemArgs): string {
  let msg = `Olá ${representanteNome}, aqui está o link da cotação ${titulo} da ${empresaNome}.`
  if (prazo) {
    msg += ` O prazo é até ${dataHoraBr(prazo)}.`
  }
  msg += ` Acesse: ${link}`
  return msg
}

export function urlWhatsApp(msg: string, telefone?: string | null): string {
  const t = telefone ? telefone.replace(/\D/g, '') : ''
  const path = t ? `${t}` : ''
  return `https://wa.me/${path}?text=${encodeURIComponent(msg)}`
}

export function urlMailto(msg: string, assunto: string, email?: string | null): string {
  const dest = email ? email : ''
  return `mailto:${dest}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(msg)}`
}
