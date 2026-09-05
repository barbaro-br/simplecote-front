import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Package, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useBarcodeScanner } from '@/shared/hooks/useBarcodeScanner'
import { useBiparItemCotacao, useCotacao } from '../cotacoes.api'
import { useCriarProduto } from '../../produtos/produtos.api'
import { ProdutoForm } from '../../produtos/ProdutoForm'
import { Dialog } from '@/shared/components/ui/dialog'
import { tiposDeEmbalagem } from '../../produtos/produtos.schema'
import { ApiError } from '@/shared/api/api-client'
import { Input } from '@/shared/components/ui/input'

type HistoryItem = {
  codigoBarras: string
  nome: string
  timestamp: Date
  status: 'adicionado' | 'erro'
}

export function BipagemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const cotacaoQuery = useCotacao(id!)
  const biparMutation = useBiparItemCotacao(id!)
  const criarProduto = useCriarProduto()

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [paused, setPaused] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  
  // Modals state
  const [sugestao202, setSugestao202] = useState<{ nome: string, codigoBarras: string } | null>(null)
  const [show404, setShow404] = useState(false)

  // 202 Form State
  const [unidade, setUnidade] = useState<"Fardo" | "Caixa" | "Cartela" | "Unidade">('Unidade')
  const [qtd, setQtd] = useState<number>(1)

  const handleScan = useCallback(
    async (result: string) => {
      if (paused) return
      setPaused(true)
      setLastScanned(result)

      try {
        const res = await biparMutation.mutateAsync(result)
        
        // Se retornar 202, o backend enviará algo como { nomeSugerido: '...' }
        // Se 200, retorna o próprio ItemCotacao
        if (res && res.nomeSugerido) {
          setSugestao202({ nome: res.nomeSugerido, codigoBarras: result })
        } else {
          // 200 OK
          toast.success('Produto adicionado!')
          setHistory(prev => [
            {
              codigoBarras: result,
              nome: res?.produto?.nome ?? res?.nomeSnapshot ?? 'Produto adicionado',
              timestamp: new Date(),
              status: 'adicionado' as const
            },
            ...prev
          ].slice(0, 50))
          setPaused(false)
        }
      } catch (err: any) {
        if (err instanceof ApiError && err.problem.status === 404) {
          toast.error('Produto não encontrado')
          setShow404(true)
        } else {
          toast.error(err.message || 'Erro ao processar código de barras')
          setHistory(prev => [
            {
              codigoBarras: result,
              nome: 'Erro na leitura',
              timestamp: new Date(),
              status: 'erro' as const
            },
            ...prev
          ].slice(0, 50))
          // Resume after 2s on error so it doesn't get stuck forever
          setTimeout(() => setPaused(false), 2000)
        }
      }
    },
    [biparMutation, paused]
  )

  const { videoRef, error: scannerError } = useBarcodeScanner({
    onScan: handleScan,
    paused
  })

  async function handleSalvar202(e: React.FormEvent) {
    e.preventDefault()
    if (!sugestao202) return
    
    try {
      // 1. Criar o produto local
      await criarProduto.mutateAsync({
        nome: sugestao202.nome,
        codigoBarras: sugestao202.codigoBarras,
        unidade,
        quantidadePorEmbalagem: qtd
      })
      // 2. Tentar bipar novamente
      await biparMutation.mutateAsync(sugestao202.codigoBarras)
      
      toast.success('Produto salvo e adicionado!')
      setHistory(prev => [
        {
          codigoBarras: sugestao202.codigoBarras,
          nome: sugestao202.nome,
          timestamp: new Date(),
          status: 'adicionado' as const
        },
        ...prev
      ].slice(0, 50))
      
      setSugestao202(null)
      setPaused(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar produto')
    }
  }

  function handleCancel202() {
    setSugestao202(null)
    setPaused(false)
  }

  function handleSalvar404(produtoCriado?: any) {
    setShow404(false)
    if (produtoCriado && lastScanned) {
      // Se salvou, tenta bipar de novo
      biparMutation.mutate(lastScanned, {
        onSuccess: () => {
          toast.success('Produto salvo e adicionado!')
          setHistory(prev => [
            {
              codigoBarras: lastScanned,
              nome: produtoCriado.nome,
              timestamp: new Date(),
              status: 'adicionado' as const
            },
            ...prev
          ].slice(0, 50))
        },
        onSettled: () => setPaused(false)
      })
    } else {
      setPaused(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold tracking-tight">Bipar Produtos</h1>
          {cotacaoQuery.data && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">
              {cotacaoQuery.data.titulo}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {/* Scanner Area */}
        <div className="relative flex-none bg-black flex items-center justify-center w-full max-h-[50vh] overflow-hidden aspect-video sm:aspect-auto">
          {scannerError ? (
            <div className="text-white p-4 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm">{scannerError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Overlay with scanning guide */}
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-primary/50 relative rounded-sm">
                  {/* Scanning line animation */}
                  {!paused && (
                    <div className="absolute left-0 w-full h-0.5 bg-primary/80 top-1/2 -translate-y-1/2 shadow-[0_0_8px_2px_rgba(var(--primary),0.5)] animate-pulse" />
                  )}
                </div>
              </div>
              
              {paused && !sugestao202 && !show404 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-medium px-4 py-2 bg-black/50 rounded-full animate-pulse">
                    Processando...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico da sessão
          </h2>
          
          <div className="space-y-3 flex-1">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm opacity-50 py-8">
                <Package className="w-12 h-12 mb-4" />
                <p>Nenhum item bipado ainda.</p>
                <p>Aponte a câmera para um código de barras.</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-md border ${item.status === 'erro' ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}`}
                >
                  <div className={`p-2 rounded-full ${item.status === 'erro' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {item.status === 'erro' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.codigoBarras}</p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal 202 - Cadastro Rápido */}
      <Dialog open={!!sugestao202} onClose={handleCancel202}>
          <form onSubmit={handleSalvar202} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Completar Cadastro</h2>
              <p className="text-sm text-muted-foreground mt-1">
                O código <strong>{sugestao202?.codigoBarras}</strong> foi encontrado na rede com o nome:
              </p>
              <p className="text-sm font-medium bg-muted p-2 rounded-md mt-2 border">
                {sugestao202?.nome}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="unidade-202" className="text-sm font-medium">Embalagem</label>
                <select 
                  id="unidade-202"
                  value={unidade}
                  onChange={e => setUnidade(e.target.value as "Fardo" | "Caixa" | "Cartela" | "Unidade")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {tiposDeEmbalagem.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="qtd-202" className="text-sm font-medium">Qtd. por embalagem</label>
                <Input
                  id="qtd-202"
                  type="number"
                  min={1}
                  value={qtd}
                  onChange={e => setQtd(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="ghost" onClick={handleCancel202}>Cancelar</Button>
              <Button type="submit" disabled={criarProduto.isPending || biparMutation.isPending}>
                Confirmar e Adicionar
              </Button>
            </div>
          </form>
      </Dialog>

      {/* Modal 404 - Cadastro Completo */}
      <Dialog open={show404} onClose={() => handleSalvar404()}>
          {show404 && (
             <ProdutoForm 
                aoSalvar={handleSalvar404} 
             />
          )}
      </Dialog>
    </div>
  )
}
