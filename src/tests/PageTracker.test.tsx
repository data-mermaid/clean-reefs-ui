/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react'
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router'
import PageTracker from '../components/PageTracker/PageTracker'

let navigate: NavigateFunction

// Lets tests drive route changes from inside the router
const Navigator = () => {
  navigate = useNavigate()

  return null
}

const renderAt = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PageTracker />
      <Navigator />
    </MemoryRouter>,
  )

describe('PageTracker', () => {
  beforeEach(() => {
    window.gtag = jest.fn()
  })

  afterEach(() => {
    delete window.gtag
  })

  it('sends a page_view for the initial route', () => {
    renderAt('/')

    expect(window.gtag).toHaveBeenCalledTimes(1)
    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', { page_title: 'Map' })
  })

  it('sends another page_view when the path changes', () => {
    renderAt('/')
    act(() => navigate('/about'))

    expect(window.gtag).toHaveBeenCalledTimes(2)
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'page_view', { page_title: 'About' })
  })

  // MapContainer rewrites the query string on every layer toggle, year change,
  // and basemap switch, which is why the effect depends on pathname alone
  it('does not send a page_view when only the query string changes', () => {
    renderAt('/')
    act(() => navigate('/?year=2015&layers=sed_load,watershed'))
    act(() => navigate('/?year=2020&basemap=light'))

    expect(window.gtag).toHaveBeenCalledTimes(1)
  })

  it('falls back to the pathname for routes with no mapped title', () => {
    renderAt('/not-a-route')

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', { page_title: '/not-a-route' })
  })

  it('does nothing when gtag is absent, as in non-production builds', () => {
    delete window.gtag

    expect(() => renderAt('/')).not.toThrow()
  })
})
