import ProductCard from './ProductCard'

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <span className="text-[42px] text-faint leading-none">⬡</span>
      <p className="font-ui font-semibold text-lg text-soft tracking-[.04em]">
        Nenhum produto cadastrado
      </p>
      <p className="font-ui text-sm text-faint mb-2">
        Adicione URLs de produtos para começar a monitorar
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-[18px] py-2 bg-accent text-black rounded font-ui font-bold text-sm uppercase tracking-[.06em] shadow-[0_0_18px_rgba(0,212,255,.28)] hover:bg-[#33ddff] hover:shadow-[0_0_28px_rgba(0,212,255,.45)] hover:-translate-y-px transition-all duration-200 cursor-pointer"
      >
        + Adicionar Produto
      </button>
    </div>
  )
}

export default function ProductGrid({ products, isEmpty, onAdd, onHistory, onRemove }) {
  if (isEmpty) return <EmptyState onAdd={onAdd} />

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="font-ui text-base text-soft">
          Nenhum produto corresponde aos filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(310px,1fr))]">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          onHistory={onHistory}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
