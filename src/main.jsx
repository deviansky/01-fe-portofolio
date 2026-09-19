import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { PortfolioProvider } from './context/PortfolioContext'
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
    <ThemeProvider>
      <PortfolioProvider>
        <RouterProvider router={router} />
      </PortfolioProvider>
    </ThemeProvider>
  </StrictMode>,
)
