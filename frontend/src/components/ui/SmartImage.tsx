import { useState } from 'react'
import type { SiteImage } from '../../data/images'
import { cn } from '../../lib/cn'

interface SmartImageProps {
  image: SiteImage
  className?: string
  imgClassName?: string
  /** Set on above-the-fold imagery only. */
  priority?: boolean
  sizes?: string
}

/**
 * Image with a soft skeleton, fade-in and a branded fallback if the file
 * cannot be loaded. Always reserves space to avoid layout shift.
 */
export function SmartImage({ image, className, imgClassName, priority = false, sizes }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-night', className)}>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br from-night via-ink to-coal transition-opacity duration-700',
          loaded ? 'opacity-0' : 'opacity-100 animate-pulse',
        )}
      />

      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-night px-4 text-center">
          <span className="font-display text-2xl tracking-brand text-gold/80">ZEESHAN</span>
          <span className="text-[9px] uppercase tracking-label text-cream/35">Mutton &amp; Chicken</span>
        </div>
      ) : (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...{ fetchpriority: priority ? 'high' : 'auto' }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true)
            setLoaded(true)
          }}
          className={cn(
            'h-full w-full object-cover transition-[opacity,transform,filter] duration-[1100ms] ease-premium',
            loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.04] opacity-0 blur-md',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
