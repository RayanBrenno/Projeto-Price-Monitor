import { CATEGORIES, SITES } from '../constants'

const ALL = { value: '', label: 'Todas' }
const SITE_OPTIONS = [ALL, ...SITES]
const CAT_OPTIONS = [ALL, ...CATEGORIES]

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border font-ui text-[13px] font-medium tracking-[.02em] whitespace-nowrap transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-transparent border-edge text-soft hover:border-edge2 hover:text-[#e6edf3]'
        }`}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="sticky top-[60px] z-40 bg-bg/90 backdrop-blur-sm border-b border-edge px-6 py-2.5 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-ui text-[11px] font-semibold tracking-[.13em] uppercase text-faint mr-0.5">
          Loja
        </span>
        {SITE_OPTIONS.map((s) => (
          <Pill
            key={s.value}
            label={s.label}
            active={filters.site === s.value}
            onClick={() => onChange({ ...filters, site: s.value })}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-ui text-[11px] font-semibold tracking-[.13em] uppercase text-faint mr-0.5">
          Categoria
        </span>
        {CAT_OPTIONS.map((c) => (
          <Pill
            key={c.value}
            label={c.label}
            active={filters.category === c.value}
            onClick={() => onChange({ ...filters, category: c.value })}
          />
        ))}
      </div>
    </div>
  )
}
