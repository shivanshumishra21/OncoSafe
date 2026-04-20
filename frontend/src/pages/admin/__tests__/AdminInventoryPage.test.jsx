import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AdminInventoryPage from '../AdminInventoryPage'
import * as endpoints from '../../../api/endpoints'

// Mock the endpoints
vi.mock('../../../api/endpoints', () => ({
  getInventory: vi.fn()
}))

// Mock the AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    role: 'admin',
    logout: vi.fn()
  })
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

describe('AdminInventoryPage', () => {
  const mockInventoryData = [
    {
      id: 1,
      drug_name: 'Cisplatin',
      quantity: 50,
      storage_type: 'Refrigerated',
      expiry_date: '2025-12-31'
    },
    {
      id: 2,
      drug_name: 'Carboplatin',
      quantity: 30,
      storage_type: 'Standard',
      expiry_date: '2024-05-15'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and Add Inventory button', async () => {
    endpoints.getInventory.mockResolvedValue({ data: [] })
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Manage Inventory')).toBeInTheDocument()
    expect(screen.getByText('Add Inventory')).toBeInTheDocument()
  })

  it('displays inventory items in a table', async () => {
    endpoints.getInventory.mockResolvedValue({ data: mockInventoryData })
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Cisplatin')).toBeInTheDocument()
      expect(screen.getByText('Carboplatin')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })

  it('highlights items expiring soon with yellow badge', async () => {
    const today = new Date()
    const expiringDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    
    const expiringItem = [{
      id: 1,
      drug_name: 'Expiring Drug',
      quantity: 10,
      storage_type: 'Standard',
      expiry_date: expiringDate.toISOString().split('T')[0]
    }]
    
    endpoints.getInventory.mockResolvedValue({ data: expiringItem })
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Expiring Drug')).toBeInTheDocument()
      // Check for yellow badge (expiring within 30 days)
      const badge = screen.getByText(/days left/)
      expect(badge).toHaveClass('bg-yellow-500')
    })
  })

  it('highlights expired items with red badge', async () => {
    const expiredItem = [{
      id: 1,
      drug_name: 'Expired Drug',
      quantity: 5,
      storage_type: 'Standard',
      expiry_date: '2023-01-01'
    }]
    
    endpoints.getInventory.mockResolvedValue({ data: expiredItem })
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Expired Drug')).toBeInTheDocument()
      expect(screen.getByText('Expired')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    endpoints.getInventory.mockReturnValue(new Promise(() => {})) // Never resolves
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Loading inventory...')).toBeInTheDocument()
  })

  it('shows empty state when no inventory items exist', async () => {
    endpoints.getInventory.mockResolvedValue({ data: [] })
    
    render(
      <BrowserRouter>
        <AdminInventoryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No inventory items available')).toBeInTheDocument()
    })
  })
})
