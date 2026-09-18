import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { PortfolioProvider } from './context/PortfolioContext'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/projects.css'
import './styles/hero.css'
import './styles/entries.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
