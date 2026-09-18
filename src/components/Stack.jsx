export default function Stack({ items = [] }) {
  if (!items.length) return null
  return (
    <ul className="stack" aria-label="Teknologi">
      {items.map((s) => <li key={s}>{s}</li>)}
    </ul>
  )
}
