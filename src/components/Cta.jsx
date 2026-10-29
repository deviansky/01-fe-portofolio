/**
 * Tombol pill dengan isi warna yang naik dari bawah saat hover + efek magnet.
 * Render <a> kalau ada `href`, selain itu <button>.
 * variant: 'solid' | 'outline' | 'light' (untuk latar berwarna)
 */
export default function Cta({ href, variant = 'solid', size, className = '', children, ...rest }) {
  const Tag = href ? 'a' : 'button'
  const cls = ['cta', `cta--${variant}`, size && `cta--${size}`, className].filter(Boolean).join(' ')
  return (
    <Tag
      href={href}
      type={href ? undefined : rest.type || 'button'}
      className={cls}
      data-magnetic="0.3"
      {...rest}
    >
      <span className="cta-fill" aria-hidden="true" />
      <span className="cta-text">{children}</span>
    </Tag>
  )
}
