/** Utilidades compartidas para catálogo / home (Firestore Espejos). */

/**
 * Inserta `f_auto,q_auto` en la ruta de subida de Cloudinary (formato y calidad automáticos).
 * No altera URLs que no son de Cloudinary ni las que ya incluyen transformaciones equivalentes.
 * @param {string | undefined | null} url
 * @returns {string}
 */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (!trimmed.includes('res.cloudinary.com')) return trimmed
  if (trimmed.includes('f_auto,q_auto') || /\/upload\/f_auto/.test(trimmed)) return trimmed
  return trimmed.replace(/\/upload\//, '/upload/f_auto,q_auto/')
}

export const formatCurrency = (value) => {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(number)
}

export const normalizeBranch = (value) => {
  const s = String(value ?? '').trim()
  if (!s) return ''
  const lower = s.toLowerCase()
  if (lower.includes('durango')) return 'Durango'
  if (lower.includes('chihuahua')) return 'Chihuahua'
  return s
}

export const WHATSAPP_NUMBER = '526181541157'

export const buildWhatsappUrl = (productName) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa el espejo: ${productName}`)}`

/** Mensaje para la ficha de producto (página de detalle). */
export const buildWhatsappProductDetailUrl = (productName) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa el ${productName} que vi en Reflejos Outlet`,
  )}`

/** Precio visible tipo "$1,250 MXN" (sin decimales forzados). */
export const formatPriceMXNLabel = (value) => {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return '—'
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number)
  return `$${formatted} MXN`
}
