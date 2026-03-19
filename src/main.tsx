import { scan } from 'react-scan'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/reset.scss'
import './styles/index.scss'
import { StyledEngineProvider } from '@mui/material'
import '../i18n'
import MapContainer from './components/MapContainer/MapContainer'
import NavigationHeader from './components/NavigationHeader/NavigationHeader'
import '@fontsource/titillium-web/300.css'
import '@fontsource/titillium-web/400.css'
import '@fontsource/titillium-web/600.css'
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
        <MapContainer />
      </StyledEngineProvider>
    </BrowserRouter>
  </StrictMode>,
)
