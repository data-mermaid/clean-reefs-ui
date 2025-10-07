import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.module.scss'
import './styles/index.module.scss'
import { createTheme, ThemeProvider } from '@mui/material'
import '../i18n'
import MapContainer from './components/MapContainer/MapContainer'
import NavigationHeader from './components/NavigationHeader/NavigationHeader'
import '@fontsource/titillium-web/300.css'
import '@fontsource/titillium-web/400.css'
import '@fontsource/titillium-web/600.css'
import '@fontsource/titillium-web/900.css'

const theme = createTheme({
  palette: {
    primary: { main: '#003f5c', light: '#a3b8c8' },
    secondary: { main: '#dddce4', light: '#f5f5f5' },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <NavigationHeader />
      <MapContainer />
    </ThemeProvider>
  </StrictMode>,
)
