import { Fragment } from 'react'

/**
 * Pecah teks jadi kata-kata ber-mask untuk animasi `data-reveal="words"`/`"scrub"`.
 * Dirender oleh React sendiri (bukan SplitText) supaya ganti bahasa tetap aman.
 */
export default function SplitWords({ text }) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  return words.map((w, i) => (
    <Fragment key={`${i}-${w}`}>
      <span className="sw"><span className="sw-i">{w}</span></span>
      {i < words.length - 1 && ' '}
    </Fragment>
  ))
}
