import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { I18nProvider } from './i18n/I18nProvider'
import { router } from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/admin.css'
import './styles/site/tokens.css'
import './styles/site/base.css'
import './styles/site/nav.css'
import './styles/site/home.css'
import './styles/site/work.css'

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
