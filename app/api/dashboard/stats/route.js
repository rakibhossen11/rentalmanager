import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

export async function GET(request) {
    try {
        const { companyId } = await getSession(request);
        
        const { db } = await connectToDatabase();
        
        // Get tenant stats
        const tenantStats = await db.collection('tenants').aggregate([
            {
                $match: {
                    companyId: new ObjectId(companyId),
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRent: { $sum: '$rentAmount' }
                }
            }
        ]).toArray();
        
        // Calculate totals
        let totalTenants = 0;
        let activeTenants = 0;
        let totalMonthlyRevenue = 0;
        
        tenantStats.forEach(stat => {
            totalTenants += stat.count;
            if (stat._id === 'active') {
                activeTenants = stat.count;
                totalMonthlyRevenue = stat.totalRent;
            }
        });
        
        // Get upcoming rents (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingRents = await db.collection('tenants').aggregate([
            {
                $match: {
                    companyId: new ObjectId(companyId),
                    status: 'active',
                    deletedAt: null
                }
            },
            {
                $project: {
                    name: 1,
                    rentAmount: 1,
                    rentDueDay: 1,
                    propertyId: 1,
                    nextDueDate: {
                        $dateFromParts: {
                            year: { $year: today },
                            month: { $month: today },
                            day: { $min: ['$rentDueDay', { $dayOfMonth: nextWeek }] }
                        }
                    }
                }
            },
            {
                $match: {
                    nextDueDate: { $gte: today, $lte: nextWeek }
                }
            },
            { $limit: 5 }
        ]).toArray();
        
        // Get recent tenants
        const recentTenants = await db.collection('tenants')
            .find({
                companyId: new ObjectId(companyId),
                deletedAt: null
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .project({
                name: 1,
                email: 1,
                phone: 1,
                status: 1,
                createdAt: 1
            })
            .toArray();
        
        // Get user to update stats
        const user = await db.collection('users').findOne({
            _id: new ObjectId(companyId)
        });
        
        // Update user stats if needed
        if (user && user.stats.totalTenants !== totalTenants) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(companyId) },
                {
                    $set: {
                        'stats.totalTenants': totalTenants,
                        'stats.activeLeases': activeTenants,
                        'stats.totalRevenue': totalMonthlyRevenue,
                        updatedAt: new Date()
                    }
                }
            );
        }
        
        return NextResponse.json({
            totalTenants,
            activeTenants,
            totalProperties: user?.stats?.totalProperties || 0,
            vacancyRate: 0, // TODO: Calculate based on properties
            totalRevenue: totalMonthlyRevenue,
            openMaintenance: 0, // TODO: Implement maintenance
            upcomingRents: upcomingRents.map(tenant => ({
                tenantName: tenant.name,
                amount: tenant.rentAmount,
                dueDate: tenant.nextDueDate?.toLocaleDateString() || 'N/A'
            })),
            recentActivities: recentTenants.map(tenant => ({
                type: 'tenant_added',
                title: `New tenant added: ${tenant.name}`,
                time: tenant.createdAt,
                icon: 'user'
            })),
            userStats: {
                totalTenants,
                totalProperties: user?.stats?.totalProperties || 0,
                totalRevenue: totalMonthlyRevenue,
                activeLeases: activeTenants
            }
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}