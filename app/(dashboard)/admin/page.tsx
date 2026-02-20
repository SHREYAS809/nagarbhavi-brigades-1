'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { RevenueByMemberChart } from '@/components/charts/revenue-by-member-chart';
import { Users, Gift, TrendingUp, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { mockRevenueByMember } from '@/lib/mockData'; // Not needed anymore as we use real data

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const dashboardData = await api.getDashboardData(user.token);
          setData(dashboardData);
        } catch (error: any) {
          console.error("Failed to fetch dashboard data", error);
          if (error.message.includes('401')) {
            logout();
            window.location.href = '/login/admin'; // Force redirect to admin login
          }
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

  const { referrals, revenue, meetings, members } = data;

  // Calculate stats
  const totalMembers = members.length;
  const totalReferrals = referrals.length;
  // Calculate total revenue from revenue array
  // Revenue model: { amount, date, ... }
  // Backend returns array of Revenue objects
  const totalRevenue = revenue.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  const activeMeetings = meetings.filter((m: any) => new Date(m.date_time || m.date) >= new Date()).length;

  // Create performance data for admin (mock or calculated)
  // For now use mock or empty to avoid complex reduction logic on frontend without utility
  const adminPerformanceData = [
    { month: 'Jan', referrals: 12 },
    { month: 'Feb', referrals: 18 },
    { month: 'Mar', referrals: 15 },
    { month: 'Apr', referrals: 24 },
    { month: 'May', referrals: 21 },
    { month: 'Jun', referrals: 28 },
    { month: 'Jul', referrals: 32 },
    { month: 'Aug', referrals: 29 },
    { month: 'Sep', referrals: 35 },
    { month: 'Oct', referrals: 38 },
    { month: 'Nov', referrals: 42 },
    { month: 'Dec', referrals: 48 },
  ];

  // Helper
  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u.id === id);
    return m ? m.name : 'Unknown';
  };

  // Calculate Revenue by Member from real data
  // revenue model from routes/revenue_routes.py: { amount, member_id, created_by, ... }
  // member_id is the one who GAVE the business (Referrer)
  // created_by is the one who RECEIVED the business (Recipient)
  // In "Revenue by Member", we usually show how much each member has EARNED (Recipient)
  // or how much they have GIVEN (Referrer). 
  // Let's show Revenue Earned (created_by) per member to match "Thank You For Closed Business" logic.

  const revenueByMemberMap = new Map<string, number>();
  revenue.forEach((rev: any) => {
    const memberId = rev.created_by; // The one who received the business/money
    const amount = rev.amount || 0;
    revenueByMemberMap.set(memberId, (revenueByMemberMap.get(memberId) || 0) + amount);
  });

  const revenueByMemberData = Array.from(revenueByMemberMap.entries())
    .map(([memberId, totalRevenue]) => ({
      memberId,
      member: getMemberName(memberId),
      revenue: totalRevenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5 contributors

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform metrics and member activity
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => { logout(); window.location.href = '/login/admin'; }}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          description="Active members"
        />
        <StatCard
          title="Total Referrals"
          value={totalReferrals}
          icon={Gift}
          trend={{ value: 15, isPositive: true }}
          description="This month"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          description="All time"
        />
        <StatCard
          title="Active Meetings"
          value={activeMeetings}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
          description="Upcoming"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={adminPerformanceData} />
        <RevenueByMemberChart data={revenueByMemberData.length > 0 ? revenueByMemberData : []} />
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h3>
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">From</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">To</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Heat</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.slice(-5).reverse().map((ref: any) => (
                  <tr key={ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(ref.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm">{getMemberName(ref.from_member)}</td>
                    <td className="py-3 px-4 text-sm">{getMemberName(ref.to_member)}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{ref.contact_name}</td>
                    <td className="py-3 px-4 text-sm">{ref.referral_tier}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.referral_tier === 'Hot' ? 'bg-red-500/20 text-red-300' :
                        ref.referral_tier === 'Warm' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                        {ref.referral_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.status === 'Closed' ? 'bg-green-500/20 text-green-300' :
                        ref.status === 'Open' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No referrals yet</p>
        )}
      </div>
    </div>
  );
}

