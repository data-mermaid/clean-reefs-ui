import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.module.scss'
import BaseMap from './BaseMap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BaseMap />
  </StrictMode>,
)
