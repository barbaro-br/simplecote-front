import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X } from 'lucide-react'

type LeitorCodigoBarrasProps = {
  onRead: (gtin: string) => void
  onClose: () => void
}

export function LeitorCodigoBarras({ onRead, onClose }: LeitorCodigoBarrasProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let controls: any = null
    const reader = new BrowserMultiFormatReader()

    async function startCamera() {
      if (!videoRef.current) return
      try {
        controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: 'environment' } },
          videoRef.current,
          (result, err) => {
            if (result) {
              onRead(result.getText())
            }
            if (err && err.name !== 'NotFoundException') {
              console.error(err)
            }
          },
        )
      } catch (e: any) {
        if (e.name === 'NotAllowedError' || e.name === 'NotFoundError') {
          setError('Câmera indisponível ou permissão negada. Use a busca por texto.')
        } else {
          setError('Erro ao acessar a câmera.')
        }
      }
    }

    startCamera()

    return () => {
      if (controls) {
        controls.stop()
      }
    }
  }, [onRead])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-black/50 text-white absolute top-0 left-0 right-0 z-10">
        <h2 className="text-lg font-medium">Bipar código</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/20 transition-colors"
          aria-label="Fechar câmera"
        >
          <X className="size-6" />
        </button>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-white">
          <div className="space-y-4">
            <p>{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-2 border-red-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      )}
    </div>
  )
}
