import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Result } from '@zxing/library'

type UseBarcodeScannerProps = {
  onScan: (result: string) => void
  paused?: boolean
}

export function useBarcodeScanner({ onScan, paused = false }: UseBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  const onScanRef = useRef(onScan)
  const pausedRef = useRef(paused)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    if (!videoRef.current) return

    const codeReader = new BrowserMultiFormatReader()
    let controls: { stop: () => void } | null = null
    let mounted = true

    const start = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (videoInputDevices.length === 0) {
          setError('Nenhuma câmera encontrada.')
          return
        }

        // Tenta pegar a câmera traseira
        const selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId

        if (!mounted) return

        controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result: Result | undefined) => {
            if (result && !pausedRef.current) {
              onScanRef.current(result.getText())
            }
          }
        )
      } catch (err: any) {
        if (mounted) setError(err.message || 'Erro ao acessar a câmera.')
      }
    }

    start()

    return () => {
      mounted = false
      if (controls) {
        controls.stop()
      }
    }
  }, [])

  return { videoRef, error }
}
