import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the hero title', () => {
    render(<Home />)
    expect(screen.getByText(/Gamify Pipeline/i)).toBeInTheDocument()
  })

  it('renders the "Enter Dashboard" button', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /Enter Dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/matches')
  })
})
