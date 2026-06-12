import { useState, useEffect, useRef } from 'react'
import { createProduct } from '../services/api'
import { CATEGORIES } from '../constants'

const INPUT_CLS =
  'w-full bg-card border border-edge rounded px-3 py-[9px] text-[#e6edf3] font-ui text-[15px] outline-none transition-all duration-200 placeholder:text-faint focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,212,255,0.07)]'

export default function AddModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(''); setUrl(''); setCategory(''); setTarget(''); setError(null)
      setTimeout(() => nameRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleSubmit() {
    setError(null)
    if (!name.trim() || !url.trim() || !category) {
      setError('Preencha nome, URL e categoria.')
      return
    }
    setLoading(true)
    try {
      const body = { name: name.trim(), url: url.trim(), category }
      if (target) body.target_price = parseFloat(target)
      await createProduct(body)
      onClose()
      onSuccess()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function onEnter(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-edge rounded-lg w-full max-w-md max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-edge">
          <span className="font-ui font-bold text-[15px] uppercase tracking-[.07em] text-[#e6edf3]">
            Adicionar Produto
          </span>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center border border-edge rounded text-soft text-lg leading-none hover:border-err hover:text-err transition-all duration-200 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-[18px] flex flex-col gap-3.5">
          <div>
            <label className="block font-ui text-[11px] font-semibold uppercase tracking-[.11em] text-soft mb-1.5">
              Nome
            </label>
            <input
              ref={nameRef}
              className={INPUT_CLS}
              type="text"
              placeholder="Ex: Ryzen 9 9900X"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onEnter}
            />
          </div>

          <div>
            <label className="block font-ui text-[11px] font-semibold uppercase tracking-[.11em] text-soft mb-1.5">
              URL do produto
            </label>
            <input
              className={INPUT_CLS}
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={onEnter}
            />
            <p className="font-data text-[11px] text-faint mt-1.5">
              Loja detectada automaticamente pela URL
            </p>
          </div>

          <div>
            <label className="block font-ui text-[11px] font-semibold uppercase tracking-[.11em] text-soft mb-1.5">
              Categoria
            </label>
            <select
              className={INPUT_CLS}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Selecione...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-ui text-[11px] font-semibold uppercase tracking-[.11em] text-soft mb-1.5">
              Preço alvo (R$){' '}
              <span className="normal-case tracking-normal font-normal text-faint">
                — opcional
              </span>
            </label>
            <input
              className={INPUT_CLS}
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 2500.00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={onEnter}
            />
          </div>

          {error && (
            <div className="font-ui text-[13px] text-err px-3 py-2.5 bg-err/8 border border-err/20 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1.5 border-t border-edge mt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-edge rounded bg-transparent text-soft font-ui font-semibold text-[14px] hover:border-edge2 hover:text-[#e6edf3] transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-black rounded font-ui font-bold text-sm uppercase tracking-[.06em] shadow-[0_0_18px_rgba(0,212,255,.28)] hover:bg-[#33ddff] hover:shadow-[0_0_28px_rgba(0,212,255,.45)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Consultando preço...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
