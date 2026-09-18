import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container detail">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat ini tidak ada atau proyeknya sudah dipindahkan.</p>
      <Link to="/" className="btn btn-primary">Kembali ke beranda</Link>
    </section>
  )
}
