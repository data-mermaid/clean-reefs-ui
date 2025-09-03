import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/reset.module.scss'
import './styles/index.module.scss'
import { StyledEngineProvider } from '@mui/material'
import '../i18n'
import MapContainer from './components/MapContainer/MapContainer'
import NavigationHeader from './components/NavigationHeader/NavigationHeader'
import { FilterSelectProvider } from './contexts/FilterSelectContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <FilterSelectProvider>
          <NavigationHeader />
          <MapContainer />
        </FilterSelectProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  </StrictMode>,
)
