import { useState, useEffect } from 'react'
import { fetchHistory, checkProductPrice } from '../services/api'
import { fmtDateTime } from '../utils'

function fmtBRL(v) {
  if (v == null) return '—'
  return (
    'R$ ' +
    Number(v).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export default function HistoryModal({ open, productId, productName, onClose, onChecked }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || productId == null) return
    setLoading(true)
    setHistory([])
    setError(null)
    setChecking(true)

    fetchHistory(productId)
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    checkProductPrice(productId)
      .then((result) => {
        if (result.changed) return fetchHistory(productId).then(setHistory)
      })
      .catch((e) => console.warn('Falha ao atualizar preço:', e))
      .finally(() => {
        setChecking(false)
        onChecked?.()
      })
  }, [open, productId])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-edge rounded-lg w-full max-w-[640px] max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-edge">
          <span className="font-ui font-bold text-[15px] uppercase tracking-[.07em] text-[#e6edf3] truncate pr-4">
            Histórico — {productName}
          </span>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] shrink-0 flex items-center justify-center border border-edge rounded text-soft text-lg leading-none hover:border-err hover:text-err transition-all duration-200 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-[18px]">
          {/* Meta */}
          <p className="font-data text-xs text-soft mb-3.5 pb-3 border-b border-edge flex items-center justify-between gap-3">
            <span>
              {loading && 'Carregando...'}
              {error && <span className="text-err">{error}</span>}
              {!loading && !error && `${history.length} registro${history.length !== 1 ? 's' : ''}`}
            </span>
            {checking && <span className="text-faint animate-pulse shrink-0">Atualizando preço...</span>}
          </p>

          {/* Table */}
          {!loading && !error && history.length === 0 && (
            <p className="text-center font-ui text-sm text-faint py-8">
              Nenhum preço registrado ainda.
            </p>
          )}

          {history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-data text-xs">
                <thead>
                  <tr>
                    {['Data/Hora', 'Preço BRL', 'Original', 'Variação'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 font-ui text-[10px] font-semibold tracking-[.12em] uppercase text-faint border-b border-edge"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => {
                    const prev = history[i + 1]
                    let changeEl = <span className="text-faint">—</span>

                    if (prev != null && entry.price_brl != null && prev.price_brl != null) {
                      const diff = entry.price_brl - prev.price_brl
                      if (diff > 0.01) {
                        changeEl = (
                          <span className="text-err">
                            ↑ +{fmtBRL(Math.abs(diff))}
                          </span>
                        )
                      } else if (diff < -0.01) {
                        changeEl = (
                          <span className="text-ok">
                            ↓ −{fmtBRL(Math.abs(diff))}
                          </span>
                        )
                      }
                    }

                    return (
                      <tr key={i} className="border-b border-edge last:border-0 hover:bg-card transition-colors duration-150">
                        <td className="px-3 py-2.5 text-soft">{fmtDateTime(entry.checked_at) ?? '—'}</td>
                        <td className="px-3 py-2.5 font-medium text-[#e6edf3]">
                          {fmtBRL(entry.price_brl)}
                        </td>
                        <td className="px-3 py-2.5 text-faint">
                          {entry.currency && entry.currency !== 'BRL' && entry.price != null
                            ? `${entry.currency} ${Number(entry.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2.5">{changeEl}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
