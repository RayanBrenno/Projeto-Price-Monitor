import { useState } from 'react'
import { removeProduct } from '../services/api'
import { CATEGORY_LABELS } from '../constants'
import { fmtDateTime } from '../utils'
import ConfirmModal from './ConfirmModal'

const STORE = {
  kabum: {
    stripe: 'bg-[#ff6b2b]',
    badge:  'text-[#ff6b2b] bg-[#ff6b2b]/10 border border-[#ff6b2b]/25',
    glow:   'hover:shadow-[0_6px_28px_rgba(255,107,43,0.12)]',
    label:  'KaBuM',
  },
  pichau: {
    stripe: 'bg-[#3b82f6]',
    badge:  'text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/25',
    glow:   'hover:shadow-[0_6px_28px_rgba(59,130,246,0.12)]',
    label:  'Pichau',
  },
  terabyte: {
    stripe: 'bg-[#22c55e]',
    badge:  'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/25',
    glow:   'hover:shadow-[0_6px_28px_rgba(34,197,94,0.12)]',
    label:  'Terabyte',
  },
  comprasparaguai: {
    stripe: 'bg-[#a855f7]',
    badge:  'text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/25',
    glow:   'hover:shadow-[0_6px_28px_rgba(168,85,247,0.12)]',
    label:  'C. Paraguai',
  },
}

export default function ProductCard({ product: p, index, onHistory, onRemove }) {
  const store = STORE[p.site] ?? {
    stripe: 'bg-faint',
    badge: 'text-soft bg-card border border-edge',
    glow: '',
    label: p.site,
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(null)

  function openConfirm() {
    setRemoveError(null)
    setConfirmOpen(true)
  }

  async function handleRemove() {
    setRemoving(true)
    setRemoveError(null)
    try {
      await removeProduct(p.id)
      setConfirmOpen(false)
      onRemove()
    } catch (e) {
      setRemoveError(e.message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div
      className={`bg-surface border border-edge rounded-lg overflow-hidden flex flex-col animate-card-in transition-all duration-200 hover:border-edge2 hover:-translate-y-0.5 ${store.glow}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Store color stripe */}
      <div className={`h-[3px] w-full shrink-0 ${store.stripe}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name */}
        <p className="font-ui font-semibold text-[15px] text-[#e6edf3] leading-snug tracking-[.01em]">
          {p.name}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-1.5 py-px rounded-[3px] font-ui text-[11px] font-bold tracking-[.07em] uppercase ${store.badge}`}>
            {store.label}
          </span>
          <span className="inline-flex items-center px-1.5 py-px rounded-[3px] font-ui text-[11px] font-bold tracking-[.07em] uppercase text-soft bg-card border border-edge">
            {CATEGORY_LABELS[p.category] ?? p.category}
          </span>
        </div>

        {/* Price */}
        <div className="flex-1">
          {p.latest_price_brl != null ? (
            <>
              <p className="font-data font-bold text-[26px] text-[#e6edf3] tracking-[-0.02em] leading-none">
                <span className="text-[13px] font-medium text-soft mr-0.5">R$</span>
                {Number(p.latest_price_brl).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {p.currency && p.currency !== 'BRL' && p.latest_price_original != null && (
                <p className="font-data text-[11px] text-faint mt-1.5">
                  {p.currency}{' '}
                  {Number(p.latest_price_original).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  · convertido
                </p>
              )}
            </>
          ) : (
            <p className="font-data text-[18px] text-faint">Sem dados</p>
          )}
        </div>

        {/* Below target badge */}
        {p.price_drop && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-ok/10 border border-ok/25 text-ok font-ui font-bold text-[11px] uppercase tracking-[.07em] w-fit animate-pulse-target">
            ↓ Abaixo do alvo!
          </div>
        )}

        {/* Last checked */}
        <p className="font-data text-[11px] text-faint">
          Verificado: {fmtDateTime(p.last_checked) ?? 'Nunca verificado'}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onHistory(p.id, p.name)}
            className="flex-1 py-[7px] px-3 rounded border border-edge bg-transparent text-soft font-ui font-semibold text-[13px] tracking-[.04em] hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer"
          >
            Ver histórico
          </button>
          <button
            onClick={openConfirm}
            className="py-[7px] px-3 rounded border border-edge bg-transparent text-faint font-ui text-[15px] leading-none hover:border-err hover:text-err hover:bg-err/8 transition-all duration-200 cursor-pointer flex items-center"
          >
            ✕
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Remover produto"
        message={
          <>
            Remover <b className="text-[#e6edf3]">"{p.name}"</b>?
          </>
        }
        detail="O histórico de preços também será apagado."
        loading={removing}
        error={removeError}
        onConfirm={handleRemove}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
