const LABELS = { github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }

export default function SocialLinks({ socials = {} }) {
  const items = Object.entries(socials).filter(([, url]) => url)
  if (!items.length) return null
  return (
    <ul className="socials">
      {items.map(([key, url]) => (
        <li key={key}>
          <a href={url} target="_blank" rel="noreferrer">{LABELS[key] ?? key}</a>
        </li>
      ))}
    </ul>
  )
}
