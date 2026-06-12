export const CATEGORIES = [
  { value: 'processador', label: 'Processador' },
  { value: 'placa_video', label: 'Placa de Vídeo' },
  { value: 'placa_mae', label: 'Placa Mãe' },
  { value: 'memoria_ram', label: 'Memória RAM' },
  { value: 'ssd', label: 'SSD' },
  { value: 'fan', label: 'Fans' },
  { value: 'water_cooler', label: 'Water Cooler' },
  { value: 'gabinete', label: 'Gabinete' },
  { value: 'fonte', label: 'Fonte' },
  { value: 'outros', label: 'Outros' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

export const SITES = [
  { value: 'kabum', label: 'KaBuM' },
  { value: 'pichau', label: 'Pichau' },
  { value: 'terabyte', label: 'Terabyte' },
  { value: 'comprasparaguai', label: 'Compras Paraguai' },
]
