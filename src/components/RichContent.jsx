import DOMPurify from 'dompurify'
import '../styles/rich-content.css'

const ALLOWED_TAGS = [
    'p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'img', 'figure', 'figcaption', 'hr', 'br',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'target', 'rel']
const FORBID_ATTR = ['style', 'class', 'id']

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
    }
})

/**
 * Komponen RichContent untuk merender deskripsi HTML atau teks biasa.
 * Melakukan DOMPurify di sisi klien dengan allowlist eksplisit dan hook target="_blank" pada tautan.
 */
export default function RichContent({ html, className = '' }) {
    if (!html || typeof html !== 'string') return null
    if (html.trim().startsWith('TODO')) return null

    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html)

    if (!hasHtmlTags) {
        const paragraphs = html
            .split(/\r?\n\r?\n/)
            .map((p) => p.trim())
            .filter(Boolean)

        if (paragraphs.length === 0) return null

        return (
            <div className={`rich-content ${className}`}>
                {paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))}
            </div>
        )
    }

    const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORBID_ATTR,
    })

    if (!cleanHtml || !cleanHtml.trim()) return null

    return (
        <div
            className={`rich-content ${className}`}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
    )
}
