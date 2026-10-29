import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'
import { registerLenis } from './pageTransition'

/**
 * Smooth scroll ala Lenis, disinkronkan dengan ticker GSAP supaya
 * ScrollTrigger membaca posisi scroll yang sama. Berhenti saat modal
 * proyek terbuka (class `pj-lock` di <html>) dan mati total untuk reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      lerp: 0.09,
      anchors: { offset: -72 },
      prevent: (node) => node.closest?.('dialog, [data-lenis-prevent]'),
    })
    lenis.on('scroll', ScrollTrigger.update)
    registerLenis(lenis)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const html = document.documentElement
    const lockObserver = new MutationObserver(() => {
      if (html.classList.contains('pj-lock') || html.classList.contains('menu-open')) lenis.stop()
      else lenis.start()
    })
    lockObserver.observe(html, { attributes: true, attributeFilter: ['class'] })

    return () => {
      lockObserver.disconnect()
      gsap.ticker.remove(tick)
      registerLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
