import { formatPeriod } from '../lib/format'

function getInitials(name = '') {
    if (!name) return ''
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

export default function Entry({ item, type = 'experience' }) {
    const isExp = type === 'experience'
    const title = isExp ? item.position : item.institution
    const subtitleParts = isExp
        ? [item.company, item.employment_type].filter(Boolean)
        : [item.degree, item.field].filter(Boolean)
    const subtitle = subtitleParts.join(', ')

    const metaParts = [
        item.location,
        item.work_mode,
    ].filter(Boolean)
    const locationText = metaParts.join(', ')

    const periodText = formatPeriod(item.started_at, item.ended_at, item.is_current)
    const initials = getInitials(isExp ? item.company : item.institution)

    return (
        <div className="entry-item">
            <div className="entry-logo">
                {item.logo_url ? (
                    <img src={item.logo_url} alt={isExp ? item.company : item.institution} />
                ) : (
                    <span className="entry-initials">{initials}</span>
                )}
            </div>
            <div className="entry-content">
                <h3 className="entry-title">{title}</h3>
                {subtitle && <p className="entry-subtitle">{subtitle}</p>}
                {periodText && <p className="entry-period">{periodText}</p>}
                {locationText && <p className="entry-location">{locationText}</p>}
                {item.description && <p className="entry-description">{item.description}</p>}
                {item.skills?.length > 0 && (
                    <p className="entry-skills">
                        <strong>Keahlian:</strong> {item.skills.join(', ')}
                    </p>
                )}
            </div>
        </div>
    )
}
