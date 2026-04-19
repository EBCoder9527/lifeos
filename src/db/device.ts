const DEVICE_ID_KEY = 'dayflow_device_id'

let cached: string | null = null

/** 生成 UUID，兼容非安全上下文（HTTP 局域网） */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // fallback: 用 crypto.getRandomValues 手动拼 v4 UUID
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 1
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * 获取设备唯一标识。
 * 首次调用时生成 UUID 并持久化到 localStorage，后续复用。
 */
export function getDeviceId(): string {
  if (cached) return cached
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  cached = id
  return id
}
