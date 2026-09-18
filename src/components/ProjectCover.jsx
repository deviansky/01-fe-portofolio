import { useState } from 'react'

/**
 * Sampul proyek. Kalau ada thumbnail_url → tampilkan gambarnya.
 * Kalau tidak ada (atau gagal dimuat) → ilustrasi wireframe sesuai kategori,
 * digambar dengan warna token, supaya kartu tetap informatif tanpa screenshot.
 */
export default function ProjectCover({ project, className = '' }) {
  const [failed, setFailed] = useState(false)
  const hasImage = project.thumbnail_url && !failed

  return (
    <div className={`pj-cover pj-cover--${project.category} ${className}`}>
      {hasImage ? (
        <img
          src={project.thumbnail_url}
          alt={`Tampilan ${project.title}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Wireframe category={project.category} />
      )}
    </div>
  )
}

function Wireframe({ category }) {
  const common = {
    viewBox: '0 0 240 150',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    'aria-hidden': true,
    className: 'pj-wire',
  }

  if (category === 'mobile') {
    return (
      <svg {...common}>
        <rect x="92" y="14" width="56" height="122" rx="9" />
        <line x1="112" y1="22" x2="128" y2="22" />
        <rect x="100" y="34" width="40" height="22" rx="3" className="pj-fill" />
        {[64, 80, 96, 112].map((y) => (
          <g key={y}>
            <circle cx="106" cy={y + 4} r="4" />
            <line x1="115" y1={y + 2} x2="138" y2={y + 2} />
            <line x1="115" y1={y + 7} x2="130" y2={y + 7} className="pj-soft" />
          </g>
        ))}
      </svg>
    )
  }

  if (category === 'web') {
    return (
      <svg {...common}>
        <rect x="28" y="20" width="184" height="110" rx="5" />
        <line x1="28" y1="36" x2="212" y2="36" />
        <circle cx="38" cy="28" r="2.5" />
        <circle cx="47" cy="28" r="2.5" />
        <circle cx="56" cy="28" r="2.5" />
        <line x1="44" y1="54" x2="130" y2="54" strokeWidth="4" />
        <line x1="44" y1="66" x2="112" y2="66" className="pj-soft" />
        <rect x="44" y="76" width="36" height="10" rx="2" className="pj-fill" />
        <rect x="140" y="48" width="56" height="40" rx="3" className="pj-fill" />
        {[44, 100, 156].map((x) => (
          <rect key={x} x={x} y="98" width="40" height="22" rx="2" />
        ))}
      </svg>
    )
  }

  // erp: tabel data
  return (
    <svg {...common}>
      <rect x="28" y="22" width="184" height="106" rx="4" />
      <rect x="28" y="22" width="184" height="18" rx="4" className="pj-fill" />
      {[58, 76, 94, 112].map((y) => (
        <line key={y} x1="28" y1={y} x2="212" y2={y} className="pj-soft" />
      ))}
      {[80, 136, 176].map((x) => (
        <line key={x} x1={x} y1="22" x2={x} y2="128" className="pj-soft" />
      ))}
      <rect x="182" y="45" width="24" height="8" rx="4" className="pj-fill" />
      <rect x="182" y="63" width="24" height="8" rx="4" />
    </svg>
  )
}
