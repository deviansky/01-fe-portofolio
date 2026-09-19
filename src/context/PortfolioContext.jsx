import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { fallbackPortfolio } from '../data/fallback'
import { useI18n } from '../i18n/I18nProvider'

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  const [state, setState] = useState({ data: null, loading: true, source: null })
  const { lang } = useI18n()

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true }))

    api
      .getPortfolio(controller.signal, lang)
      .then((data) => {
        if (!data || !data.profile) {
          throw new Error('API response tidak memiliki data profile')
        }
        setState({ data, loading: false, source: 'api' })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        const apiUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '') + '/portfolio?lang=' + lang
        console.error('[portofolio] Gagal mengambil data dari API URL:', apiUrl, 'Alasan:', err.message)
        setState({ data: fallbackPortfolio, loading: false, source: 'fallback' })
      })
    return () => controller.abort()
  }, [lang])

  return <PortfolioContext.Provider value={state}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio harus dipakai di dalam <PortfolioProvider>')
  return ctx
}
