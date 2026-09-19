import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { usePortfolio } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToHash from './components/ScrollToHash'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import { AuthProvider } from './admin/context/AuthContext'
import RequireAuth from './admin/components/RequireAuth'

import ErrorPage from './components/ErrorPage'

const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'))
const AdminProjects = lazy(() => import('./admin/pages/AdminProjects'))
const AdminProjectEditor = lazy(() => import('./admin/pages/AdminProjectEditor'))
const AdminMessages = lazy(() => import('./admin/pages/AdminMessages'))

function PublicLayout() {
  const { data, loading, source } = usePortfolio()

  if (loading) {
    return <div className="loading" role="status">Memuat portofolio…</div>
  }

  const profile = data?.profile || {}
  const name = profile.short_name ?? profile.name ?? 'Portofolio'

  return (
    <>
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <ScrollToHash ready={!loading} />
      <Navbar name={name} />
      <main id="main">
        <Outlet />
      </main>
      <Footer name={profile.name ?? 'Portofolio'} />
      {import.meta.env.DEV && source === 'fallback' && (
        <p className="dev-banner">Mode data cadangan: API be-portofolio belum tersambung.</p>
      )}
    </>
  )
}

function PublicHome() {
  const { data } = usePortfolio()
  return <Home data={data} />
}

function PublicProjectDetail() {
  const { data, source } = usePortfolio()
  return <ProjectDetail data={data} source={source} />
}

function AdminRoot() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="admin-loading-screen" role="status">
            <div className="admin-spinner" />
            <p>Memuat admin…</p>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  // Route Admin
  {
    path: '/admin',
    element: <AdminRoot />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="proyek" replace /> },
              { path: 'proyek', element: <AdminProjects /> },
              { path: 'proyek/baru', element: <AdminProjectEditor /> },
              { path: 'proyek/:id', element: <AdminProjectEditor /> },
              { path: 'pesan', element: <AdminMessages /> },
              { path: '*', element: <Navigate to="proyek" replace /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="proyek" replace /> },
    ],
  },
  // Route Publik
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'proyek/:slug', element: <PublicProjectDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return null
}
