import { Route, Routes } from 'react-router-dom'
import { usePortfolio } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToHash from './components/ScrollToHash'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'

export default function App() {
  const { data, loading, source } = usePortfolio()

  if (loading) {
    return <div className="loading" role="status">Memuat portofolio…</div>
  }

  return (
    <>
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <ScrollToHash ready={!loading} />
      <Navbar name={data.profile.short_name ?? data.profile.name} />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/proyek/:slug" element={<ProjectDetail data={data} source={source} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer name={data.profile.name} />
      {import.meta.env.DEV && source === 'fallback' && (
        <p className="dev-banner">Mode data cadangan: API be-portofolio belum tersambung.</p>
      )}
    </>
  )
}
