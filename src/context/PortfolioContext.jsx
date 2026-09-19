import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { fallbackPortfolio } from '../data/fallback'

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  const [state, setState] = useState({ data: null, loading: true, source: null })

  useEffect(() => {
    const controller = new AbortController()
    api
      .getPortfolio(controller.signal)
      .then((data) => {
        if (!data || !data.profile) {
          throw new Error('API response tidak memiliki data profile')
        }
        setState({ data, loading: false, source: 'api' })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.warn('[portofolio] API tidak tersedia, pakai data cadangan:', err.message)
        setState({ data: fallbackPortfolio, loading: false, source: 'fallback' })
      })
    return () => controller.abort()
  }, [])

  return <PortfolioContext.Provider value={state}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio harus dipakai di dalam <PortfolioProvider>')
  return ctx
}
