import { formatPeriod } from '../lib/format'
import { useI18n } from '../i18n/I18nProvider'

function getInitials(name = '') {
    if (!name) return ''
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Satu baris riwayat (pengalaman / pendidikan) bergaya daftar besar:
 * periode di kiri, jabatan besar di tengah, detail di bawahnya.
 * Latar berwarna naik dari bawah saat hover (warna dari --row-color).
 */
export default function Entry({ item, type = 'experience', index = 0 }) {
    const { lang } = useI18n()
    const isEn = lang === 'en'

    const isExp = type === 'experience'
    const title = isExp ? item.position : item.institution
    const subtitleParts = isExp
        ? [item.company, item.employment_type].filter(Boolean)
        : [item.degree, item.field].filter(Boolean)
    const subtitle = subtitleParts.join(', ')

    const locationText = [item.location, item.work_mode].filter(Boolean).join(', ')
    const periodText = formatPeriod(item.started_at, item.ended_at, item.is_current, lang)
    const initials = getInitials(isExp ? item.company : item.institution)

    return (
        <li className="entry-item" data-reveal="up" style={{ '--row-color': `var(--v-r${(index % 4) + 1})` }}>
            <div className="entry-side">
                {periodText && <p className="entry-period">{periodText}</p>}
                {item.is_current && <span className="entry-now">{isEn ? 'Now' : 'Sekarang'}</span>}
            </div>
            <div className="entry-content">
                <div className="entry-head">
                    <span className="entry-logo" aria-hidden={!item.logo_url}>
                        {item.logo_url ? (
                            <img src={item.logo_url} alt={isExp ? item.company : item.institution} />
                        ) : (
                            <span className="entry-initials">{initials}</span>
                        )}
                    </span>
                    <div>
                        <h3 className="entry-title">{title}</h3>
                        {subtitle && <p className="entry-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {item.description && <p className="entry-description">{item.description}</p>}
                <div className="entry-foot">
                    {locationText && <span className="entry-location">{locationText}</span>}
                    {item.skills?.length > 0 && (
                        <ul className="entry-skills" aria-label={isEn ? 'Skills' : 'Keahlian'}>
                            {item.skills.map((s) => <li key={s}>{s}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </li>
    )
}
