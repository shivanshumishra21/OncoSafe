import api from './axios'

// Auth
export const loginUser = (data) => api.post('/auth/login/', data)
export const registerUser = (data) => api.post('/auth/register/', data)

// Drugs
export const getDrugs = (search = '') => api.get(`/drugs/?search=${search}`)

// Patients
export const getPatients = () => api.get('/patients/')

// Prescription
export const checkPrescription = (data) => api.post('/prescription/check/', data)

// Dose
export const calculateDose = (data) => api.post('/calculate-dose/', data)

// Inventory
export const getInventory = () => api.get('/inventory/')
export const getInventoryAlerts = () => api.get('/inventory/alerts/')
export const addInventory = (data) => api.post('/inventory/', data)

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard/')
