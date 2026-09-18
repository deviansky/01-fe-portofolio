import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll ke #anchor setelah pindah halaman, atau ke atas kalau tidak ada hash. */
export default function ScrollToHash({ ready }) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!ready) return
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash, ready])
  return null
}
