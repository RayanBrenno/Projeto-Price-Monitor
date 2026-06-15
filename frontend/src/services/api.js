const BASE = `${import.meta.env.VITE_API_URL || ''}/api`

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options)

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.detail || data?.error || `Erro ${res.status}`)
  }

  return data
}

export function fetchProducts() {
  return request('/products')
}

export function createProduct(data) {
  return request('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function removeProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

export function fetchHistory(id) {
  return request(`/products/${id}/history`)
}

export function checkProductPrice(id) {
  return request(`/products/${id}/check-price`, { method: 'POST' })
}
