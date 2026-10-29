import { useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerNavigate, registerOverlay, transitionTo } from '../motion/pageTransition'

/**
 * Lembaran overlay untuk transisi antar-halaman (lihat motion/pageTransition.js).
 * Semua klik link internal situs publik dicegat di sini, jadi <Link>, <Cta href>
 * maupun <a> biasa otomatis ikut transisi. Label lembaran diambil dari `data-pt-label`.
 */
export default function PageTransition() {
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const root = rootRef.current
    registerOverlay({
      root,
      layers: root.querySelectorAll('.pt-layer'),
      curves: {
        top: root.querySelectorAll('.pt-curve--top'),
        bottom: root.querySelectorAll('.pt-curve--bottom'),
      },
      label: root.querySelector('.pt-label-text'),
    })
    return () => registerOverlay(null)
  }, [])

  useEffect(() => {
    registerNavigate(navigate)
    return () => registerNavigate(null)
  }, [navigate])

  useEffect(() => {
    // fase capture: jalan sebelum handler <Link>, yang mundur kalau defaultPrevented
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest?.('a[href]')
      if (!a || a.target || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.hash || url.pathname.startsWith('/admin')) return
      e.preventDefault()
      transitionTo(url.pathname, { label: a.dataset.ptLabel || '' })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return (
    <div className="pt" ref={rootRef} aria-hidden="true">
      <div className="pt-layer pt-layer--accent">
        <span className="pt-curve pt-curve--top" />
        <span className="pt-curve pt-curve--bottom" />
      </div>
      <div className="pt-layer pt-layer--ink">
        <span className="pt-curve pt-curve--top" />
        <span className="pt-curve pt-curve--bottom" />
        <p className="pt-label"><span className="pt-label-text" /></p>
      </div>
    </div>
  )
}
