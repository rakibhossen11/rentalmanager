// lib/server/dashboard.js
import clientPromise from '../../lib/mongodb';

export async function getDashboardData() {
  try {
    const client = await clientPromise;
    const db = client.db('property_management');

    // Get all collections
    const [properties, tenants, payments] = await Promise.all([
      db.collection('properties').find({}).toArray(),
      db.collection('tenants').find({}).toArray(),
      db.collection('payments').find({}).sort({ date: -1 }).limit(10).toArray()
    ]);

    // Calculate statistics
    const totalProperties = properties.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const totalTenants = tenants.length;
    
    // Calculate monthly revenue from active tenants
    const monthlyRevenue = tenants
      .filter(t => t.status === 'active')
      .reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);

    // Calculate pending payments (due but not paid)
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const pendingPayments = tenants.filter(tenant => {
      if (tenant.status !== 'active') return false;
      
      // Check if tenant has rent due for current month
      const rentDueDay = tenant.rentDueDay || 1;
      const dueDate = new Date(currentYear, currentMonth, rentDueDay);
      
      // If today is past due date and no payment recorded
      if (today > dueDate) {
        // Check if payment exists for this month
        const tenantPayment = payments.find(p => 
          p.tenantId === tenant._id.toString() &&
          new Date(p.date).getMonth() === currentMonth &&
          new Date(p.date).getFullYear() === currentYear
        );
        return !tenantPayment;
      }
      return false;
    }).length;

    // Calculate occupancy rate
    const occupiedProperties = tenants
      .filter(t => t.status === 'active' && t.propertyId)
      .map(t => t.propertyId)
      .filter((value, index, self) => self.indexOf(value) === index)
      .length;
    
    const occupancyRate = totalProperties > 0 
      ? Math.round((occupiedProperties / totalProperties) * 100)
      : 0;

    // Get vacant properties
    const occupiedPropertyIds = tenants
      .filter(t => t.status === 'active' && t.propertyId)
      .map(t => t.propertyId);
    
    const vacantProperties = properties.filter(p => 
      !occupiedPropertyIds.includes(p._id.toString())
    ).map(property => ({
      id: property._id,
      name: property.name || property.address || 'Unnamed Property',
      type: property.type || 'Apartment',
      bedrooms: property.bedrooms || 0,
      rent: property.rent || 0,
      address: property.address,
      vacantSince: property.vacantSince || new Date().toISOString()
    }));

    // Format recent payments
    const recentPayments = payments.map(payment => ({
      id: payment._id,
      tenantName: payment.tenantName || 'Unknown Tenant',
      propertyName: payment.propertyName || 'Unknown Property',
      amount: payment.amount || 0,
      status: payment.status || 'pending',
      date: payment.date || new Date().toISOString(),
      method: payment.method || 'cash'
    }));

    // Get upcoming tasks (lease renewals, maintenance, etc.)
    const upcomingTasks = await getUpcomingTasks(db, tenants, properties);

    // Calculate growth/trends (simplified - you can implement more sophisticated calculations)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // This is simplified - in production, you'd compare with previous period
    const propertiesGrowth = 0; // Implement actual calculation
    const tenantsGrowth = 0; // Implement actual calculation
    const revenueGrowth = 0; // Implement actual calculation
    const paymentsChange = 0; // Implement actual calculation
    const occupancyChange = 0; // Implement actual calculation

    return {
      stats: {
        totalProperties,
        activeTenants,
        totalTenants,
        monthlyRevenue,
        pendingPayments,
        occupancyRate,
        propertiesGrowth,
        tenantsGrowth,
        revenueGrowth,
        paymentsChange,
        occupancyChange
      },
      recentPayments,
      vacantProperties,
      upcomingTasks,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalValue: properties.reduce((sum, p) => sum + (p.value || 0), 0),
        averageRent: activeTenants > 0 ? monthlyRevenue / activeTenants : 0,
        collectionRate: 95 // Placeholder - implement actual calculation
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return fallback data
    return {
      stats: {
        totalProperties: 0,
        activeTenants: 0,
        totalTenants: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        occupancyRate: 0,
        propertiesGrowth: 0,
        tenantsGrowth: 0,
        revenueGrowth: 0,
        paymentsChange: 0,
        occupancyChange: 0
      },
      recentPayments: [],
      vacantProperties: [],
      upcomingTasks: [],
      lastUpdated: new Date().toISOString(),
      summary: {
        totalValue: 0,
        averageRent: 0,
        collectionRate: 0
      }
    };
  }
}

async function getUpcomingTasks(db, tenants, properties) {
  const tasks = [];
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Check for lease renewals in next 30 days
  tenants.forEach(tenant => {
    if (tenant.leaseEnd) {
      const leaseEnd = new Date(tenant.leaseEnd);
      const daysUntilRenewal = Math.ceil((leaseEnd - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilRenewal <= 30 && daysUntilRenewal > 0) {
        tasks.push({
          id: `lease-${tenant._id}`,
          type: 'lease',
          title: 'Lease Renewal',
          description: `Lease ending for ${tenant.name}`,
          dueDate: tenant.leaseEnd,
          priority: daysUntilRenewal <= 7 ? 'high' : daysUntilRenewal <= 14 ? 'medium' : 'low',
          tenantId: tenant._id,
          propertyId: tenant.propertyId
        });
      }
    }
  });

  // Check for maintenance requests
  const maintenanceRequests = await db.collection('maintenance')
    .find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  maintenanceRequests.forEach(request => {
    tasks.push({
      id: `maintenance-${request._id}`,
      type: 'maintenance',
      title: 'Maintenance Request',
      description: request.description?.substring(0, 50) + '...',
      dueDate: request.dueDate || request.createdAt,
      priority: request.priority || 'medium',
      requestId: request._id,
      propertyId: request.propertyId
    });
  });

  return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}