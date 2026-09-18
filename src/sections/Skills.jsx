import { SKILL_CATEGORIES } from '../lib/format'

export default function Skills({ skills }) {
  const groups = SKILL_CATEGORIES
    .map((c) => ({ ...c, items: skills.filter((s) => s.category === c.key) }))
    .filter((g) => g.items.length)

  return (
    <section className="section container split" id="keahlian">
      <h2 className="section-title">Keahlian</h2>
      <div className="split-body skill-grid">
        {groups.map((g) => (
          <div key={g.key} className="skill-group">
            <h3>{g.label}</h3>
            <ul>{g.items.map((s) => <li key={s.id}>{s.name}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}
