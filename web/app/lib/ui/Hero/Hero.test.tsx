import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('<Hero />', () => {
  it('should able to render component', () => {
    render(<Hero />)
    expect(screen.getByText('SST Template')).toBeTruthy()
  })
})
