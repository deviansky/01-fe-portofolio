import Entry from '../components/Entry'

export default function Education({ educations = [], certifications = [] }) {
  if (!educations.length && !certifications.length) return null
  return (
    <section className="section container split" id="pendidikan">
      <h2 className="section-title">Pendidikan</h2>
      <div className="split-body">
        {educations.length > 0 && (
          <div className="entries-list">
            {educations.map((item) => (
              <Entry key={item.id} item={item} type="education" />
            ))}
          </div>
        )}
        {certifications.length > 0 && (
          <div className="certifications-block">
            <h3 className="sub-title">Sertifikasi</h3>
            <ul className="plain-list">
              {certifications.map((c) => (
                <li key={c.id}>
                  {c.credential_url ? (
                    <a href={c.credential_url} target="_blank" rel="noreferrer">{c.name}</a>
                  ) : c.name}
                  <span className="muted">, {c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
