import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { I18nProvider } from './i18n/I18nProvider'
import { router } from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/projects.css'
import './styles/hero.css'
import './styles/entries.css'
import './styles/contact.css'
import './styles/admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <PortfolioProvider>
          <RouterProvider router={router} />
        </PortfolioProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
)
