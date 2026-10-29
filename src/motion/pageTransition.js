import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from './gsap'

/**
 * Transisi "ganti kertas" ala cuberto.com antar-halaman:
 * lembaran warna naik menutup layar → route diganti & scroll direset di balik
 * lembaran → lembaran terangkat → isi halaman muncul satu per satu.
 * Lenis, overlay, dan fungsi navigate didaftarkan dari SmoothScroll dan <PageTransition>.
 */
let lenis = null
let overlay = null
let navigateFn = null
let busy = false

export const registerLenis = (instance) => { lenis = instance }
export const registerOverlay = (els) => { overlay = els }
export const registerNavigate = (fn) => { navigateFn = fn }

const frames = (n = 1) => new Promise((resolve) => {
  const step = () => (--n <= 0 ? resolve() : requestAnimationFrame(step))
  requestAnimationFrame(step)
})

function decodeVisibleImages(root, timeout) {
  const vh = window.innerHeight
  const imgs = [...root.querySelectorAll('img')].filter((img) => img.getBoundingClientRect().top < vh)
  const all = Promise.all(imgs.map((img) => {
    img.loading = 'eager'
    return img.decode().catch(() => {})
  }))
  return Promise.race([all, new Promise((r) => setTimeout(r, timeout))])
}

function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

/**
 * Siapkan animasi masuk untuk elemen ber-data-reveal yang terlihat di layar.
 * Reveal bawaan (useReveal) untuk elemen tsb dimatikan dulu supaya tidak
 * bentrok; elemen di bawah layar tetap pakai reveal scroll biasa.
 */
function buildEntrance(root) {
  const vh = window.innerHeight
  const items = [...root.querySelectorAll('[data-reveal="words"], [data-reveal="up"], [data-reveal="clip"]')]
    .filter((el) => el.getBoundingClientRect().top < vh)
  if (!items.length) return null

  ScrollTrigger.getAll().forEach((st) => {
    if (!st.vars.scrub && items.includes(st.trigger)) st.kill()
  })
  items.forEach((el) => gsap.killTweensOf([el, ...el.querySelectorAll('.sw-i')]))

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE, force3D: true } })
  items.forEach((el, i) => {
    const at = Math.min(i * 0.07, 0.6)
    const type = el.dataset.reveal
    if (type === 'words') {
      tl.fromTo(el.querySelectorAll('.sw-i'), { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.04 }, at)
    } else if (type === 'clip') {
      tl.fromTo(el,
        { clipPath: 'inset(6% 10% round 2rem)', scale: 0.92 },
        { clipPath: 'inset(0% 0% round 2rem)', scale: 1, duration: 1.4, clearProps: 'clipPath,scale' }, at)
    } else {
      tl.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, clearProps: 'transform,opacity' }, at)
    }
  })
  tl.progress(0) // render keadaan awal sekarang, selagi masih tertutup lembaran
  return tl
}

/** Pindah ke route `path` dengan transisi lembaran. */
export function transitionTo(path, { label = '' } = {}) {
  if (busy || !navigateFn) return
  const html = document.documentElement

  if (path === window.location.pathname) {
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  if (prefersReducedMotion() || !overlay) {
    navigateFn(path)
    return
  }

  busy = true
  const { root, layers, curves, label: labelEl } = overlay
  labelEl.textContent = label
  html.classList.add('is-transitioning')

  // hanya transform yang dianimasikan (lengkungan = elips terpisah yang di-scaleY),
  // supaya semua jalan di compositor tanpa repaint layar penuh tiap frame
  const cover = gsap.timeline({ defaults: { force3D: true } })
  cover
    .set(root, { visibility: 'visible' })
    .set(curves.bottom, { scaleY: 0 })
    .fromTo(layers, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power3.inOut', stagger: 0.1 })
    .fromTo(curves.top, { scaleY: 1 }, { scaleY: 0, duration: 0.8, ease: 'power2.in', stagger: 0.1 }, 0)
    .fromTo(labelEl, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: EASE }, '-=0.25')

  cover.then(async () => {
    navigateFn(path)
    // tunggu React merender halaman baru, lalu reset scroll & hitung ulang trigger
    await frames(2)
    resetScroll()
    ScrollTrigger.refresh()
    const main = document.getElementById('main')
    const entrance = main ? buildEntrance(main) : null
    // decode gambar yang terlihat dulu (maks 700ms) supaya tidak tersendat saat lembaran terangkat,
    // lalu beri browser waktu untuk layout & raster halaman baru
    if (main) await decodeVisibleImages(main, 700)
    await frames(2)

    gsap.timeline({
      defaults: { force3D: true },
      onComplete: () => {
        gsap.set(root, { visibility: 'hidden' })
        gsap.set([...layers, ...curves.top, ...curves.bottom], { clearProps: 'transform' })
        html.classList.remove('is-transitioning')
        busy = false
      },
    })
      .to(labelEl, { yPercent: -120, opacity: 0, duration: 0.35, ease: 'power2.in' }, 0)
      .to([...layers].reverse(), { yPercent: -100, duration: 0.85, ease: 'power3.inOut', stagger: 0.1 }, 0.1)
      .fromTo([...curves.bottom].reverse(), { scaleY: 0 }, { scaleY: 1, duration: 0.85, ease: 'power2.out', stagger: 0.1 }, 0.1)
      .add(() => entrance?.play(), 0.4)
  })
}
