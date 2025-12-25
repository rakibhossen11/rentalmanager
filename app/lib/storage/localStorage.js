import { generateMockData } from '../data/mockData';

const STORAGE_KEYS = {
  PROPERTIES: 'rental_properties',
  TENANTS: 'rental_tenants',
  PAYMENTS: 'rental_payments'
};

// Initialize with mock data if empty
const initializeData = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    const mockData = generateMockData();
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(mockData.properties));
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(mockData.tenants));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockData.payments));
  }
};

// Property operations
export const getProperties = () => {
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
  return data ? JSON.parse(data) : [];
};

export const saveProperties = (properties) => {
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
};

// Tenant operations
export const getTenants = () => {
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
  return data ? JSON.parse(data) : [];
};

export const saveTenants = (tenants) => {
  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
};

// Payment operations
export const getPayments = () => {
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return data ? JSON.parse(data) : [];
};

export const savePayments = (payments) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

// Add new records
export const addProperty = (property) => {
  const properties = getProperties();
  const newProperty = { ...property, id: Date.now().toString() };
  properties.push(newProperty);
  saveProperties(properties);
  return newProperty;
};

export const addTenant = (tenant) => {
  const tenants = getTenants();
  const newTenant = { ...tenant, id: Date.now().toString() };
  tenants.push(newTenant);
  saveTenants(tenants);
  return newTenant;
};

export const addPayment = (payment) => {
  const payments = getPayments();
  const newPayment = { ...payment, id: Date.now().toString() };
  payments.push(newPayment);
  savePayments(payments);
  return newPayment;
};

// Get dashboard stats
export const getDashboardStats = () => {
  const properties = getProperties();
  const tenants = getTenants();
  const payments = getPayments();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const totalTenants = tenants.length;
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid' && p.month === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  
  return {
    totalProperties,
    occupiedProperties,
    vacancyRate: ((totalProperties - occupiedProperties) / totalProperties * 100).toFixed(1),
    totalTenants,
    monthlyRevenue,
    pendingPayments
  };
};