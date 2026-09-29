export function formatDuration(seconds) {
  if (seconds == null || seconds === '') return '-'

  const totalSeconds = Math.floor(Number(seconds))
  if (isNaN(totalSeconds) || totalSeconds < 0) return '-'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const restSeconds = totalSeconds % 60
  const parts = []

  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分`)
  if (restSeconds > 0 || parts.length === 0) parts.push(`${restSeconds}秒`)

  return parts.join('')
}
