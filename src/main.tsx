import { scan } from 'react-scan'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/reset.scss'
import './styles/index.scss'
import { StyledEngineProvider } from '@mui/material'
import '../i18n'
import MapContainer from './components/MapContainer/MapContainer'
import NavigationHeader from './components/NavigationHeader/NavigationHeader'
import ScienceAndMethodsPage from './components/ScienceAndMethodsPage/ScienceAndMethodsPage'
import '@fontsource/titillium-web/300.css'
import '@fontsource/titillium-web/400.css'
import '@fontsource/titillium-web/600.css'
import '@fontsource/titillium-web/700.css'
import '@fontsource/titillium-web/900.css'

if (import.meta.env.DEV) {
  scan({
    enabled: false,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <NavigationHeader />
        <Routes>
          <Route path="/" element={<MapContainer />} />
          <Route path="/science-and-methods" element={<ScienceAndMethodsPage />} />
        </Routes>
      </StyledEngineProvider>
    </BrowserRouter>
  </StrictMode>,
)
