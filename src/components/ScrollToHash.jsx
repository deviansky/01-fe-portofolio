import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// section lama yang sekarang punya halaman sendiri: /#proyek → /proyek
const PAGES = ['tentang', 'keahlian', 'proyek', 'pengalaman', 'kontak']

/** Scroll ke #anchor setelah pindah halaman, atau ke atas kalau tidak ada hash. */
export default function ScrollToHash({ ready }) {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!ready) return
    const id = hash.slice(1)
    if (pathname === '/' && PAGES.includes(id)) {
      navigate(`/${id}`, { replace: true })
    } else if (hash) {
      document.getElementById(id)?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash, ready, navigate])
  return null
}
