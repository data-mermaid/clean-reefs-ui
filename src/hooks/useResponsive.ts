import { useState, useEffect } from 'react'

const MOBILE_WIDTH_THRESHOLD = 1080
const HEIGHT_THRESHOLD = 750

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobileWidth(window.innerWidth <= MOBILE_WIDTH_THRESHOLD)
      setIsDesktopWidth(window.innerWidth > MOBILE_WIDTH_THRESHOLD)
      setIsShorterWindowHeight(window.innerHeight <= HEIGHT_THRESHOLD)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { isMobileWidth, isDesktopWidth, isShorterWindowHeight }
}

export default useResponsive
