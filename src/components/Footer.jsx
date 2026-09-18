export default function Footer({ name }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} {name}</p>
        <a href="#top">Kembali ke atas</a>
      </div>
    </footer>
  )
}
