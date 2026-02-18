'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { HeatDistributionChart } from '@/components/charts/heat-distribution-chart';
import { Gift, TrendingUp, Zap, Users, Calendar } from 'lucide-react';
import { mockPerformanceData, mockHeatDistribution } from '@/lib/mockData'; // Keep charts mock for now if backend doesn't support

export default function MemberDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const dashboardData = await api.getDashboardData(user.token);
          setData(dashboardData);
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setLoading(false);
        }
      } else if (!user) {
        // wait for auth
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

  const { referrals, revenue, meetings, members } = data;

  // Helper to get member name
  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u.id === id);
    return m ? m.name : 'Unknown';
  };

  // Robustness: Ensure we have the current user's ID, even if local storage is stale
  const currentUserId = user?.id || members.find((m: any) => m.email === user?.email)?.id;

  const referralsGiven = referrals.filter((r: any) => r.from_member === currentUserId).length;
  const referralsReceived = referrals.filter((r: any) => r.to_member === currentUserId).length;

  // Calculate Real Revenue
  // Revenue Generated = Business I gave to others (created_by === me)
  // Revenue Received = Business given to me (member_id === me)

  const revenueGivenList = revenue.filter((r: any) => r.created_by === currentUserId);
  const revenueReceivedList = revenue.filter((r: any) => r.member_id === currentUserId);

  const revenueGenerated = revenueGivenList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  const revenueReceivedVal = revenueReceivedList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  const meetingsCount = meetings.length;

  // Filter referrals for the table (involved ones)
  const myReferrals = referrals.filter((r: any) => r.from_member === currentUserId || r.to_member === currentUserId);


  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user?.name || 'Member'}!</h1>
        <p className="text-muted-foreground">
          Track your referrals, meetings, and networking activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Referrals Given"
          value={referralsGiven}
          icon={Gift}
          trend={{ value: 0, isPositive: true }}
          description="Total"
        />
        <StatCard
          title="Referrals Received"
          value={referralsReceived}
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
          description="Total"
        />
        <StatCard
          title="Revenue Generated"
          value={`₹${(revenueGenerated / 1000).toFixed(0)}K`}
          icon={Zap}
          trend={{ value: 0, isPositive: true }}
          description="Business Given"
        />
        <StatCard
          title="Revenue Received"
          value={`₹${(revenueReceivedVal / 1000).toFixed(0)}K`}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
          description="Earnings"
        />
        <StatCard
          title="Meetings"
          value={meetingsCount}
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
          description="Total"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={mockPerformanceData} />
        <HeatDistributionChart data={mockHeatDistribution} />
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h3>
        {myReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">From</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">To</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tier</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {myReferrals.slice(0, 5).map((ref: any) => (
                  <tr key={ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4">{getMemberName(ref.from_member)}</td>
                    <td className="py-3 px-4">{getMemberName(ref.to_member)}</td>
                    <td className="py-3 px-4">{ref.contact_name}</td>
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
          <p className="text-muted-foreground text-center py-8">
            No referrals yet. Start networking!
          </p>
        )}
      </div>
    </div>
  );
}

