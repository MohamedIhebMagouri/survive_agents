export async function biaApi(path, options = {}) {
  const response = await fetch(`/api/bia${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Une erreur est survenue')
  return payload.data
}

