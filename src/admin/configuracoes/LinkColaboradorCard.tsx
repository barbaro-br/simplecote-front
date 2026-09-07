import { useState } from 'react'
import { Check, Copy, LinkSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ApiError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useConfiguracaoLoja, useEnviarLinkColaborador } from './configuracoes.api'

const emailSchema = z.string().email('E-mail inválido')

export function LinkColaboradorCard() {
  const { data, isLoading } = useConfiguracaoLoja()
  const enviarLink = useEnviarLinkColaborador()
  const [copiado, setCopiado] = useState(false)
  const [email, setEmail] = useState('')

  if (isLoading) return null

  const token = data?.linkColaboradorToken ?? ''
  const link = `${window.location.origin}/colaborador/${token}`

  const emailValido = emailSchema.safeParse(email).success

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      toast.success('Link copiado')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  async function enviar() {
    try {
      await enviarLink.mutateAsync({ email })
      toast.success(`Link enviado para ${email}`)
    } catch (e: unknown) {
      toast.error(e instanceof ApiError ? e.message : 'Erro inesperado ao enviar o link.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkSimple size={16} /> Link do colaborador
        </CardTitle>
      </CardHeader>
      <div className="space-y-4 p-4">
        <p className="text-xs text-muted-foreground">
          Qualquer pessoa com este link pode adicionar itens às cotações abertas.
        </p>

        <div className="flex items-center gap-2">
          <Input value={link} readOnly aria-label="Link do colaborador" className="font-mono text-xs" />
          <Button type="button" variant="secondary" onClick={copiar} className="shrink-0">
            {copiado ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            aria-label="E-mail para enviar o link"
          />
          <Button
            type="button"
            onClick={enviar}
            disabled={!emailValido || enviarLink.isPending}
            className="shrink-0"
          >
            {enviarLink.isPending ? 'Enviando…' : 'Enviar por e-mail'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
