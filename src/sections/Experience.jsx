import Entry from '../components/Entry'

export default function Experience({ experiences }) {
  if (!experiences?.length) return null
  return (
    <section className="section container split" id="pengalaman">
      <h2 className="section-title">Pengalaman</h2>
      <div className="split-body entries-list">
        {experiences.map((item) => (
          <Entry key={item.id} item={item} type="experience" />
        ))}
      </div>
    </section>
  )
}
