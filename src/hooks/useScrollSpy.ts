import { MouseEvent, useEffect, useRef, useState } from 'react'
import { SCROLL_TO_SECTION_OFFSET } from '../constants'

interface Section {
  id: string
}

export function useScrollSpy<T extends Section>(sections: T[]) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const suppressObserver = useRef(false)
  const suppressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver.current) {
          return
        }
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: '-10% 0px -60% 0px' },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
      }
    })

    return () => {
      observer.disconnect()
      if (suppressTimeout.current) {
        clearTimeout(suppressTimeout.current)
      }
    }
  }, [sections])

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const target = document.getElementById(sectionId)
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_TO_SECTION_OFFSET,
        behavior: 'smooth',
      })
    }
    setActiveId(sectionId)
    suppressObserver.current = true
    if (suppressTimeout.current) {
      clearTimeout(suppressTimeout.current)
    }
    suppressTimeout.current = setTimeout(() => {
      suppressObserver.current = false
    }, 1000)
    setSidebarOpen(false)
  }

  return { activeId, sidebarOpen, setSidebarOpen, handleNavClick }
}
