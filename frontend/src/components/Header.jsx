export default function Header({ onAdd }) {
  return (
    <header className="sticky top-0 z-50 h-[60px] px-6 flex items-center justify-between bg-bg/85 backdrop-blur-md border-b border-edge">
      <div className="flex items-center gap-2.5 select-none">
        <span className="text-accent text-xl leading-none drop-shadow-[0_0_14px_#00d4ff]">
          ◈
        </span>
        <span className="font-ui font-bold text-[19px] tracking-[.1em] uppercase text-[#e6edf3]">
          Price Monitor
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#00d4ff] animate-pulse-dot" />
      </div>

      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-[18px] py-2 bg-accent text-black rounded font-ui font-bold text-sm uppercase tracking-[.06em] shadow-[0_0_18px_rgba(0,212,255,.28)] hover:bg-[#33ddff] hover:shadow-[0_0_28px_rgba(0,212,255,.45)] hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer"
      >
        + Adicionar
      </button>
    </header>
  )
}
