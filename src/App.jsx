import { Navigate, Route, Routes } from 'react-router-dom'
import { usePortfolio } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToHash from './components/ScrollToHash'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProjects from './pages/admin/AdminProjects'

export default function App() {
  const { data, loading, source } = usePortfolio()

  if (loading) {
    return <div className="loading" role="status">Memuat portofolio…</div>
  }

  return (
    <Routes>
      {/* Route Admin / Manager GUI */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="proyek" replace />} />
        <Route path="proyek" element={<AdminProjects />} />
      </Route>

      {/* Route Publik */}
      <Route
        path="/*"
        element={
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
        }
      />
    </Routes>
  )
}
