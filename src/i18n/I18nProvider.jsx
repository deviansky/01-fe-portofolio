import React, { createContext, useContext, useState, useEffect } from 'react'
import { id } from './id'
import { en } from './en'

const I18nContext = createContext(null)

const DICTIONARIES = { id, en }

function detectInitialLanguage() {
  if (typeof window === 'undefined') return 'id'

  // 1. URL search param ?lang=en|id
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')?.toLowerCase()
  if (langParam === 'id' || langParam === 'en') {
    localStorage.setItem('portfolio_lang', langParam)
    return langParam
  }

  // 2. Saved in localStorage
  const saved = localStorage.getItem('portfolio_lang')
  if (saved === 'id' || saved === 'en') {
    return saved
  }

  // 3. Browser language fallback
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase()
  return navLang.startsWith('id') ? 'id' : 'en'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLanguage)

  const setLang = (newLang) => {
    if (newLang !== 'id' && newLang !== 'en') return
    setLangState(newLang)
    localStorage.setItem('portfolio_lang', newLang)

    // Update URL query param ?lang= without full reload
    const url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    window.history.replaceState({}, '', url.toString())
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = (key, vars = {}) => {
    const dict = DICTIONARIES[lang] || DICTIONARIES.id
    const keys = key.split('.')
    let current = dict

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        // Fallback to ID if key is missing in EN
        let fallback = DICTIONARIES.id
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk]
          } else {
            return key
          }
        }
        current = fallback
        break
      }
    }

    if (typeof current !== 'string') return key

    // Variable interpolation {varName}
    return Object.entries(vars).reduce(
      (str, [vKey, vVal]) => str.replace(new RegExp(`\\{${vKey}\\}`, 'g'), String(vVal)),
      current
    )
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

const defaultFallbackT = (key, vars = {}) => {
  const dict = DICTIONARIES.id
  const keys = key.split('.')
  let current = dict

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return key
    }
  }

  if (typeof current !== 'string') return key

  return Object.entries(vars).reduce(
    (str, [vKey, vVal]) => str.replace(new RegExp(`\\{${vKey}\\}`, 'g'), String(vVal)),
    current
  )
}

const DEFAULT_I18N = {
  lang: 'id',
  setLang: () => {},
  t: defaultFallbackT,
}

export function useI18n() {
  const context = useContext(I18nContext)
  return context || DEFAULT_I18N
}
