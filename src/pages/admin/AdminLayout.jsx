import { Link, NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <header className="admin-header">
                <div className="container admin-header-inner">
                    <div className="admin-brand-group">
                        <Link to="/admin" className="nav-brand">
                            Manager GUI
                        </Link>
                        <span className="admin-title-badge">Portfolio Control</span>
                    </div>

                    <nav className="admin-nav" aria-label="Navigasi Admin">
                        <NavLink
                            to="/admin/proyek"
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            Proyek (Projects)
                        </NavLink>
                    </nav>

                    <Link to="/" className="admin-back-btn">
                        <span>‹ Kembali ke Website</span>
                    </Link>
                </div>
            </header>

            <main className="admin-main container">
                <Outlet />
            </main>
        </div>
    )
}
