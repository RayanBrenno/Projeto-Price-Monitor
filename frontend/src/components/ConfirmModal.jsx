import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmModal({
  open,
  title,
  message,
  detail,
  confirmLabel = 'Remover',
  loadingLabel = 'Removendo...',
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, loading, onClose])

  if (!open) return null

  // Portal: este modal é renderizado dentro do card, que tem transform
  // (animate-card-in / hover) — transform em ancestral faz `fixed` se
  // ancorar no card em vez da viewport. O portal escapa para o body.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-surface border border-edge rounded-lg w-full max-w-sm animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-edge">
          <span className="font-ui font-bold text-[15px] uppercase tracking-[.07em] text-[#e6edf3]">
            {title}
          </span>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-[26px] h-[26px] flex items-center justify-center border border-edge rounded text-soft text-lg leading-none hover:border-err hover:text-err transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-[18px] flex flex-col gap-3.5">
          <p className="font-ui text-[14px] text-[#e6edf3] leading-relaxed">{message}</p>
          {detail && <p className="font-data text-xs text-faint">{detail}</p>}

          {error && (
            <div className="font-ui text-[13px] text-err px-3 py-2.5 bg-err/8 border border-err/20 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1.5 border-t border-edge mt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-edge rounded bg-transparent text-soft font-ui font-semibold text-[14px] hover:border-edge2 hover:text-[#e6edf3] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-err text-white rounded font-ui font-bold text-sm uppercase tracking-[.06em] shadow-[0_0_18px_rgba(248,81,73,.25)] hover:brightness-110 hover:shadow-[0_0_28px_rgba(248,81,73,.4)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? loadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
