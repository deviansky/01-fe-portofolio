import { useEffect, useRef } from 'react'
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion/gsap'

/**
 * Kursor bola yang mengikuti mouse dengan sedikit lambat, memanjang sesuai
 * kecepatan, membesar di atas link, dan berubah jadi label berwarna di atas
 * elemen ber-`data-cursor-text` (+ `data-cursor-color`, `data-cursor-ink`). Sekaligus menangani
 * efek magnet untuk elemen ber-`data-magnetic`.
 * Hanya aktif untuk pointer halus (mouse/trackpad) dan tanpa reduced motion.
 */
export default function Cursor() {
  const wrapRef = useRef(null)
  const ballRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const wrap = wrapRef.current
    const ball = ballRef.current
    const label = labelRef.current
    const html = document.documentElement
    html.classList.add('has-cursor')

    const mouse = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    let state = 'default'
    let magnet = null

    const setState = (next, text = '', color = '', ink = '') => {
      if (next === state && label.textContent === text) return
      state = next
      wrap.dataset.state = next
      label.textContent = text
      ball.style.background = color
      label.style.color = ink
    }

    const tick = () => {
      const dx = mouse.x - pos.x
      const dy = mouse.y - pos.y
      pos.x += dx * 0.18
      pos.y += dy * 0.18
      // memanjang searah gerak, hanya pada bola biasa supaya label tetap terbaca
      const speed = Math.min(Math.hypot(dx, dy) / 160, 0.4)
      const stretch = state === 'default' || state === 'hover' ? speed : 0
      const angle = stretch ? Math.atan2(dy, dx) * (180 / Math.PI) : 0
      wrap.style.transform =
        `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch * 0.6})`
    }
    gsap.ticker.add(tick)

    const resetMagnet = () => {
      if (!magnet) return
      gsap.to(magnet, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
      magnet = null
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      wrap.classList.add('is-visible')

      const m = e.target.closest?.('[data-magnetic]')
      if (m !== magnet) resetMagnet()
      if (m) {
        magnet = m
        const r = m.getBoundingClientRect()
        const strength = Number(m.dataset.magnetic) || 0.35
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.6,
          ease: 'power3.out',
        })
      }
    }

    const onOver = (e) => {
      const t = e.target
      const labelled = t.closest?.('[data-cursor-text]')
      if (labelled) {
        const { cursorText, cursorColor = '', cursorInk = '' } = labelled.dataset
        return setState('text', cursorText, cursorColor, cursorInk)
      }
      if (t.closest?.('input, textarea, select, [contenteditable="true"]')) return setState('hidden')
      if (t.closest?.('a, button, [role="button"], label')) return setState('hover')
      setState('default')
    }

    const onLeave = () => wrap.classList.remove('is-visible')
    const onDown = () => wrap.classList.add('is-down')
    const onUp = () => wrap.classList.remove('is-down')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      html.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={wrapRef} className="cursor" data-state="default" aria-hidden="true">
      <div ref={ballRef} className="cursor-ball">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </div>
  )
}
