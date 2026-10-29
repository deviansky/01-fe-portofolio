import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from './gsap'

/**
 * Animasi masuk deklaratif. Cukup beri atribut pada elemen di dalam `ref`:
 *   data-reveal="words"  → kata naik dari balik mask (pakai <SplitWords>)
 *   data-reveal="scrub"  → kata menyala satu per satu mengikuti scroll
 *   data-reveal="up"     → fade + naik
 *   data-reveal="clip"   → kartu "membuka" dari inset membulat
 *   data-parallax        → isi bergeser pelan saat discroll (beri pada pembungkus overflow:hidden)
 *   data-reveal-now      → main langsung saat mount, tanpa menunggu scroll
 * Semua dibersihkan lewat gsap.context saat deps berubah atau unmount.
 */
export function useReveal(ref, deps = []) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const trigger = (el, start = 'top 88%') =>
        el.hasAttribute('data-reveal-now') ? undefined : { trigger: el, start, once: true }
      const delay = (el) => Number(el.dataset.revealDelay || 0)

      root.querySelectorAll('[data-reveal="words"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.sw-i'), {
          yPercent: 115,
          rotate: 3,
          duration: 1.3,
          ease: EASE,
          stagger: 0.05,
          delay: delay(el),
          scrollTrigger: trigger(el),
        })
      })

      root.querySelectorAll('[data-reveal="scrub"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.sw-i'),
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true },
          },
        )
      })

      root.querySelectorAll('[data-reveal="up"]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1.2,
          ease: EASE,
          delay: delay(el),
          scrollTrigger: trigger(el, 'top 92%'),
        })
      })

      root.querySelectorAll('[data-reveal="clip"]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(6% 10% round 2rem)', scale: 0.92 },
          {
            clipPath: 'inset(0% 0% round 2rem)',
            scale: 1,
            duration: 1.8,
            ease: EASE,
            delay: delay(el),
            scrollTrigger: trigger(el, 'top 90%'),
            clearProps: 'clipPath,scale',
          },
        )
      })

      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const target = el.firstElementChild
        if (!target) return
        gsap.set(target, { scale: 1.12 })
        gsap.fromTo(
          target,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, root)

    // posisi trigger dihitung ulang setelah font web selesai dimuat
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
