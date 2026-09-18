export default function About({ profile, education }) {
  return (
    <section className="section container split" id="tentang">
      <h2 className="section-title">Tentang</h2>
      <div className="split-body">
        <div className="prose">
          {profile.bio.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <dl className="facts">
          {profile.location && (<div><dt>Lokasi</dt><dd>{profile.location}</dd></div>)}
          {education && (<div><dt>Pendidikan</dt><dd>{education.degree} {education.field}, {education.institution}</dd></div>)}
          <div><dt>Status</dt><dd>{profile.available_for_work ? 'Terbuka untuk proyek dan posisi baru' : 'Belum menerima proyek baru'}</dd></div>
        </dl>
      </div>
    </section>
  )
}
