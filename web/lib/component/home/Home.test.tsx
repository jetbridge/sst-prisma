import { render, screen } from '@testing-library/react'
import Home from './Home'
import { SessionProvider } from 'next-auth/react'

const DEFAULT_PROPS = {}

const createComponent = () => {
  render(
    <SessionProvider>
      <Home {...DEFAULT_PROPS} />
    </SessionProvider>,
  )
}

describe('Home', () => {
  it('should able to render component', () => {
    createComponent()
    expect(screen.getByText('SST Template')).toBeTruthy()
  })
})
