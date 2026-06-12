import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import AddModal from './components/AddModal'
import HistoryModal from './components/HistoryModal'
import { fetchProducts } from './services/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ site: '', category: '' })
  const [addOpen, setAddOpen] = useState(false)
  const [histModal, setHistModal] = useState({ open: false, id: null, name: '' })
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchProducts()
      setProducts(data)
      setLoadError(null)
    } catch (e) {
      console.error('Erro ao carregar produtos:', e)
      setLoadError(e.message)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = products.filter(
    (p) =>
      (!filters.site || p.site === filters.site) &&
      (!filters.category || p.category === filters.category)
  )

  function openHistory(id, name) {
    setHistModal({ open: true, id, name })
  }

  function closeHistory() {
    setHistModal((h) => ({ ...h, open: false }))
  }

  return (
    <div className="min-h-screen font-ui">
      <Header onAdd={() => setAddOpen(true)} />
      <FilterBar filters={filters} onChange={setFilters} />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {loadError && (
          <div className="mb-5 px-3 py-2.5 rounded border border-err/25 bg-err/8 font-ui text-[13px] text-err flex items-center justify-between gap-3">
            <span>Falha ao carregar produtos: {loadError}</span>
            <button
              onClick={load}
              className="shrink-0 px-3 py-1 rounded border border-err/25 font-semibold uppercase tracking-[.06em] text-[11px] hover:bg-err/10 transition-all duration-200 cursor-pointer"
            >
              Tentar de novo
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-5 min-h-5">
          {products.length > 0 && (
            <span className="font-data text-xs text-soft">
              <b className="text-accent">{filtered.length}</b>
              {filtered.length !== products.length && (
                <> de <b className="text-accent">{products.length}</b></>
              )}{' '}
              produto{products.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <ProductGrid
          products={filtered}
          isEmpty={products.length === 0}
          onAdd={() => setAddOpen(true)}
          onHistory={openHistory}
          onRemove={load}
        />
      </main>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={load} />

      <HistoryModal
        open={histModal.open}
        productId={histModal.id}
        productName={histModal.name}
        onClose={closeHistory}
        onChecked={load}
      />
    </div>
  )
}
