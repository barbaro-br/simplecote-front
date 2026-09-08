/**
 * Slot de embed do YouTube. Recebe `videoId?`; sem id mostra um placeholder
 * "tutorial em breve" no mesmo formato (aspect-video, moldura glass). O iframe
 * real só monta com id (tutorial ainda não gravado).
 */
export function EmbedYouTube({
  videoId,
  titulo = 'Vídeo do SimpleCote',
  className,
}: {
  videoId?: string
  titulo?: string
  className?: string
}) {
  if (!videoId) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border bg-background/60 text-center backdrop-blur-sm ${className ?? ''}`}
      >
        <span className="text-4xl" aria-hidden="true">
          ▶
        </span>
        <p className="px-6 text-sm text-muted-foreground">
          Tutorial em vídeo em breve. Por enquanto, veja a demo ao lado.
        </p>
      </div>
    )
  }

  return (
    <div className={`aspect-video w-full overflow-hidden rounded-2xl border ${className ?? ''}`}>
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
