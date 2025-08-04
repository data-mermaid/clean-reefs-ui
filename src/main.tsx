import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.module.scss'
import './styles/index.module.scss'
import { StyledEngineProvider } from '@mui/material'
import '../i18n'
import MapContainer from './components/MapContainer/MapContainer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <MapContainer />
    </StyledEngineProvider>
  </StrictMode>,
)
