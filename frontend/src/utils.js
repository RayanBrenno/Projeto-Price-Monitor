// SQLite grava CURRENT_TIMESTAMP em UTC sem marcador de fuso
// ("YYYY-MM-DD HH:MM:SS"). Anexar 'Z' faz o JS interpretar como UTC
// e converter para o fuso local do navegador (Brasil = UTC-3).
export function fmtDateTime(ts) {
  if (!ts) return null
  const iso = ts.includes('Z') || ts.includes('+') ? ts : ts.replace(' ', 'T') + 'Z'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
