import defaultPhoto from '../assets/david.webp'

/**
 * Hero: nama besar di kiri, foto hitam-putih di kanan.
 * Foto dibuat hitam-putih lewat CSS. Foto bawaan: src/assets/david.webp.
 * Kalau profile.avatar_url diisi dari API, foto itu yang dipakai.
 */
export default function Hero({ profile }) {
  const photo = profile.avatar_url || defaultPhoto
  const firstName = profile.name.split(' ')[0]

  return (
    <section className="hp-hero container" id="top">
      <div className="hp-text">
        <p className="hp-role">{profile.headline}</p>
        <h1 className="hp-name">{profile.name}</h1>
        <p className="hp-tagline">{profile.tagline}</p>
        <div className="hp-actions">
          <a className="btn btn-primary" href="#proyek">Lihat proyek</a>
          {profile.cv_url ? (
            <a className="btn btn-ghost" href={profile.cv_url} target="_blank" rel="noreferrer">Unduh CV</a>
          ) : (
            <a className="btn btn-ghost" href="#kontak">Hubungi saya</a>
          )}
        </div>
      </div>

      <div className="hp-visual">
        <span className="hp-dots" aria-hidden="true" />
        <img
          className="hp-photo"
          src={photo}
          alt={`Foto ${firstName}`}
          width="820"
          height="1011"
          fetchPriority="high"
        />
      </div>
    </section>
  )
}
