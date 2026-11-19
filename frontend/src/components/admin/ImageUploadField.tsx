import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { ImagePlus, Loader2, RefreshCw, TriangleAlert, Upload } from 'lucide-react'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_MB,
  adminApi,
  ApiError,
  resolveMediaUrl,
} from '../../lib/api'
import type { SiteImage } from '../../data/images'
import { cn } from '../../lib/cn'

interface ImageUploadFieldProps {
  image: SiteImage
  onChange: (image: SiteImage) => void
  disabled?: boolean
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`

/**
 * Photo picker for the menu manager: shows the current photo and uploads a new one
 * straight to the API (which validates, resizes and stores it).
 */
export function ImageUploadField({ image, onChange, disabled = false }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justUploaded, setJustUploaded] = useState(false)

  const openPicker = () => {
    if (disabled || uploading) return
    inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    setError(null)
    setJustUploaded(false)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Use a JPEG, PNG or WebP photo.')
      return
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`That photo is ${formatSize(file.size)} — the limit is ${MAX_UPLOAD_MB} MB.`)
      return
    }

    setUploading(true)

    try {
      const uploaded = await adminApi.uploadImage(file)
      onChange({
        src: uploaded.url,
        alt: image.alt || 'Dish photograph',
        width: uploaded.width,
        height: uploaded.height,
      })
      setJustUploaded(true)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0])
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    void handleFile(event.dataTransfer.files?.[0])
  }

  const uploaded = image.src.startsWith('/media/')

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-cream/45">
          Photo
        </span>
        {uploaded && (
          <span className="text-[8.5px] uppercase tracking-[0.14em] text-gold/70">Uploaded</span>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !uploading) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative mt-1.5 overflow-hidden border border-dashed transition-colors duration-300',
          dragging ? 'border-gold bg-gold/[0.06]' : 'border-cream/25 bg-ink/40',
          (disabled || uploading) && 'opacity-80',
        )}
      >
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || uploading}
          className="group relative block w-full text-left disabled:cursor-not-allowed"
          aria-label="Upload a photo for this item"
        >
          <img
            src={resolveMediaUrl(image.src)}
            alt={image.alt}
            className="h-40 w-full object-cover"
            loading="lazy"
          />

          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-coal/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Upload className="h-5 w-5 text-gold" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cream">
              {uploaded ? 'Replace photo' : 'Upload photo'}
            </span>
            <span className="text-[9px] text-cream/50">or drop a file here</span>
          </span>

          {uploading && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-coal/85">
              <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden="true" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/80">
                Uploading…
              </span>
            </span>
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10.5px] leading-relaxed text-cream/35">
          {image.width} × {image.height} px · JPEG, PNG or WebP · up to {MAX_UPLOAD_MB} MB
        </p>

        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gold transition-colors duration-300 hover:text-gold-light disabled:opacity-40"
        >
          {uploaded ? (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {uploaded ? 'Replace' : 'Choose file'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={onInputChange}
        className="sr-only"
        tabIndex={-1}
      />

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-2 border border-red-400/40 bg-red-400/10 px-3 py-2 text-[11.5px] leading-relaxed text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {justUploaded && !error && (
        <p role="status" className="mt-2 text-[11px] text-gold/80">
          Photo uploaded — save the item to keep it.
        </p>
      )}
    </div>
  )
}
