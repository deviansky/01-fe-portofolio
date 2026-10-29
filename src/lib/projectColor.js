// Palet sampul: tiap proyek dapat warna tetap (berdasarkan id/slug) supaya
// kartu, modal, kursor, dan halaman detail selalu senada.
export const COVER_PALETTE = [
  { bg: '#3d5afe', fg: '#ffffff' },
  { bg: '#ff5b37', fg: '#ffffff' },
  { bg: '#c8f169', fg: '#0b0b0c' },
  { bg: '#8a5cf6', fg: '#ffffff' },
  { bg: '#ffc13b', fg: '#0b0b0c' },
  { bg: '#12c9a5', fg: '#0b0b0c' },
  { bg: '#ff6fb5', fg: '#0b0b0c' },
]

export function projectColor(project) {
  const n = Number(project?.id)
  const key = Number.isFinite(n)
    ? n
    : [...String(project?.slug ?? '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  return COVER_PALETTE[key % COVER_PALETTE.length]
}
