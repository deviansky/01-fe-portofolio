import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion/gsap'

/**
 * Teks berjalan tanpa ujung. Arah ikut arah scroll dan makin cepat saat
 * scroll kencang. Isi digandakan dua kali supaya loop xPercent -50 → 0 mulus.
 * Murni dekoratif (aria-hidden); konten yang sama harus ada di tempat lain.
 */
export default function Marquee({ items, reverse = false, duration = 40, className = '' }) {
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const loop = gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration, ease: 'none', repeat: -1 },
      )
      // dorong jauh ke depan supaya timeScale negatif (scroll ke atas) tidak mentok di 0
      loop.totalTime(duration * 1000)
      ScrollTrigger.create({
        trigger: track,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 250, 6)
          gsap.to(loop, {
            timeScale: self.direction * (1 + boost),
            duration: 0.3,
            overwrite: true,
            onComplete: () => gsap.to(loop, { timeScale: self.direction, duration: 1.2 }),
          })
        },
      })
    }, track)
    return () => ctx.revert()
    // items dibandingkan isinya, bukan referensi array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.join('|'), reverse, duration])

  const row = items.map((it, i) => (
    <span className="mq-item" key={i}>
      {it}
      <span className="mq-star" style={{ '--i': i }}>✦</span>
    </span>
  ))

  return (
    <div className={`mq ${className}`} aria-hidden="true">
      <div ref={trackRef} className="mq-track">
        <div className="mq-row">{row}</div>
        <div className="mq-row">{row}</div>
      </div>
    </div>
  )
}
