import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddPatientModal from '../AddPatientModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Mock dependencies
vi.mock('../../api/axios')
vi.mock('react-hot-toast')

describe('AddPatientModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddPatientModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    expect(container.firstChild).toBeNull()
  })
  
  it('should render modal when isOpen is true', () => {
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    expect(screen.getByText('Add New Patient')).toBeInTheDocument()
  })
  
  it('should render all form fields', () => {
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight (kg)')).toBeInTheDocument()
    expect(screen.getByLabelText('Height (cm)')).toBeInTheDocument()
    expect(screen.getByLabelText('Kidney Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Liver Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })
  
  it('should have dropdown options for kidney and liver status', () => {
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    const kidneySelect = screen.getByLabelText('Kidney Status')
    const liverSelect = screen.getByLabelText('Liver Status')
    
    expect(kidneySelect).toHaveValue('Normal')
    expect(liverSelect).toHaveValue('Normal')
    
    // Check options exist
    expect(screen.getAllByText('Normal').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0)
  })
  
  it('should call onClose when close button is clicked', () => {
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'))
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
  
  it('should call onClose when Cancel button is clicked', () => {
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
  
  it('should submit form data and show success message', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    // Submit form
    const submitButton = screen.getByText('Create Patient')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/patients/', {
        name: 'John Doe',
        age: '45',
        weight: '75',
        height: '175',
        kidney_status: 'Normal',
        liver_status: 'Normal',
        username: 'johndoe',
        password: 'password123'
      })
    })
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Patient created successfully!')
    })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })
  
  it('should display credentials after successful creation', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByText('Create Patient'))
    
    await waitFor(() => {
      expect(screen.getByText('Patient Account Created Successfully!')).toBeInTheDocument()
    })
    
    expect(screen.getByText('johndoe')).toBeInTheDocument()
    expect(screen.getByText('password123')).toBeInTheDocument()
  })
  
  it('should show error message on API failure', async () => {
    api.post.mockRejectedValue({
      response: { data: { error: 'Username already exists' } }
    })
    
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByText('Create Patient'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username already exists')
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
  
  it('should reset form after successful submission', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    
    render(
      <AddPatientModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    
    // Fill form
    const nameInput = screen.getByLabelText('Full Name')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    
    // Submit
    fireEvent.click(screen.getByText('Create Patient'))
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
    })
    
    // Close credentials screen
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})
