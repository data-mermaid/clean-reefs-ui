import { useState, useEffect } from 'react'

const MOBILE_WIDTH_THRESHOLD = 1024
const HEIGHT_THRESHOLD = 750
const PANEL_MOBILE_THRESHOLD = 640

const useResponsive = () => {
  const [isMobileWidth, setIsMobileWidth] = useState<boolean>(
    window.innerWidth <= MOBILE_WIDTH_THRESHOLD,
  )
  const [isDesktopWidth, setIsDesktopWidth] = useState<boolean>(
    window.innerWidth > MOBILE_WIDTH_THRESHOLD,
  )
  const [isShorterWindowHeight, setIsShorterWindowHeight] = useState<boolean>(
    window.innerHeight <= HEIGHT_THRESHOLD,
  )
  const [isPanelMobile, setIsPanelMobile] = useState<boolean>(
    window.innerWidth <= PANEL_MOBILE_THRESHOLD,
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobileWidth(window.innerWidth <= MOBILE_WIDTH_THRESHOLD)
      setIsDesktopWidth(window.innerWidth > MOBILE_WIDTH_THRESHOLD)
      setIsShorterWindowHeight(window.innerHeight <= HEIGHT_THRESHOLD)
      setIsPanelMobile(window.innerWidth <= PANEL_MOBILE_THRESHOLD)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { isMobileWidth, isDesktopWidth, isShorterWindowHeight, isPanelMobile }
}

export default useResponsive
