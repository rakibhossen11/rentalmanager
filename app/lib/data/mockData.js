// Generate initial mock data
export const generateMockData = () => {
  const properties = [
    {
      id: '1',
      name: 'Sunshine Villa',
      address: '123 Main St, Cityville',
      rentAmount: 1500,
      bedrooms: 3,
      status: 'occupied',
      tenantId: '101'
    },
    {
      id: '2',
      name: 'Garden Apartments',
      address: '456 Oak Ave, Townsville',
      rentAmount: 1200,
      bedrooms: 2,
      status: 'occupied',
      tenantId: '102'
    },
    {
      id: '3',
      name: 'Lake View House',
      address: '789 Pine Rd, Villagetown',
      rentAmount: 2000,
      bedrooms: 4,
      status: 'vacant'
    }
  ];

  const tenants = [
    {
      id: '101',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 234-567-8901',
      propertyId: '1',
      leaseStart: '2024-01-01',
      leaseEnd: '2024-12-31',
      rentDueDay: 5
    },
    {
      id: '102',
      name: 'Emma Johnson',
      email: 'emma@example.com',
      phone: '+1 234-567-8902',
      propertyId: '2',
      leaseStart: '2024-02-01',
      leaseEnd: '2025-01-31',
      rentDueDay: 10
    },
    {
    id: '101',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 234-567-8901',
    propertyId: '1',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentDueDay: 5,
    emergencyContact: '+1 234-567-8910',
    occupation: 'Software Engineer',
    notes: 'Always pays on time. Requested kitchen sink maintenance once.'
  },
  ];

  const payments = [
    {
      id: 'p1',
      tenantId: '101',
      propertyId: '1',
      amount: 1500,
      date: '2024-03-05',
      status: 'paid',
      method: 'bank_transfer',
      month: '2024-03'
    },
    {
      id: 'p2',
      tenantId: '102',
      propertyId: '2',
      amount: 1200,
      date: '2024-03-10',
      status: 'paid',
      method: 'online',
      month: '2024-03'
    },
    {
      id: 'p3',
      tenantId: '101',
      propertyId: '1',
      amount: 1500,
      date: '2024-04-01',
      status: 'pending',
      month: '2024-04'
    }
  ];

  return { properties, tenants, payments };
};