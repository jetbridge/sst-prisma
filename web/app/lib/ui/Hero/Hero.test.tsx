import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { Hero } from './Hero'

const createComponent = () => {
  render(
    <SessionProvider>
      <Hero />
    </SessionProvider>,
  )
}

describe('Hero', () => {
  it('should able to render component', () => {
    createComponent()
    expect(screen.getByText('SST Template')).toBeTruthy()
  })
})
