'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/stat-card';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { RevenueByMemberChart } from '@/components/charts/revenue-by-member-chart';
import { Users, Gift, TrendingUp, Calendar, LogOut, ArrowUpRight, ArrowDownRight, Award, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/dashboard/search-bar';
import { EngagementBadge } from '@/components/dashboard/engagement-badge';
// import { mockRevenueByMember } from '@/lib/mockData'; // Not needed anymore as we use real data

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [engagement, setEngagement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('6m');

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        setLoading(true);
        try {
          const [dashboardData, analyticsData, engagementData] = await Promise.all([
            api.getDashboardData(user.token),
            api.getAnalytics(user.token, filter),
            api.getEngagementStats(user.token)
          ]);
          setData(dashboardData);
          setAnalytics(analyticsData);
          setEngagement(engagementData);
        } catch (error: any) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user, filter]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

  const { referrals, revenue, meetings, members } = data;
  const { summary, performance_chart, growth_chart } = analytics;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of platform metrics and member activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar />
          <Button
            variant="outline"
            onClick={() => { logout(); window.location.href = '/login/admin'; }}
            className="gap-2 shrink-0 border-white/10 hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-white/5">
        <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { id: '6m', label: 'Last 6 Months' },
            { id: '12m', label: 'Last 12 Months' },
            { id: 'lifetime', label: 'Lifetime' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                filter === f.id ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Referrals Given"
          value={summary.referrals_given}
          icon={Gift}
          trend={{ value: 12, isPositive: true }}
          description={`Total in ${filter === 'lifetime' ? 'Lifetime' : filter}`}
        />
        <StatCard
          title="Revenue Generated"
          value={`₹${(summary.revenue_generated / 100000).toFixed(2)}L`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          description="Closed business"
        />
        <StatCard
          title="Member Growth"
          value={`+${summary.member_growth}`}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          description="New registrations"
        />
      </div>

      {/* Insights & Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart data={performance_chart} />

          {/* Recent Activity Table */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Referrals</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => router.push('/admin/referrals')}>
                View All
              </Button>
            </div>
            {referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">To Member</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Client</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.slice(0, 5).map((ref: any) => {
                      const recipient = members.find((m: any) => m.id === ref.to_member || m._id === ref.to_member);
                      return (
                        <tr key={ref.id || ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm font-medium">{recipient?.name || 'Unknown'}</td>
                          <td className="py-3 px-4 text-sm">{ref.contact_name}</td>
                          <td className="py-3 px-4 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-primary border border-primary/20">
                              {ref.referral_type || 'Others'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              ref.status === 'Closed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            )}>
                              {ref.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No referrals yet</p>
            )}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          {/* Top Performers */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 leading-none">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Top Performers</h3>
            </div>
            <div className="space-y-4">
              {engagement.slice(0, 3).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{m.stats.referrals} referrals • ₹{(m.points * 10).toFixed(0)}k points</p>
                  </div>
                  <EngagementBadge status="Active" className="px-1.5 py-0.5 text-[8px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Inactive Members */}
          <div className="glass-card p-6 border-red-500/10">
            <div className="flex items-center gap-2 mb-4 leading-none text-red-400">
              <UserMinus className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Low Engagement</h3>
            </div>
            <div className="space-y-4">
              {engagement.filter(m => m.status === 'Inactive').slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center gap-3 opacity-80">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                    <UserMinus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-red-400/70">Needs attention</p>
                  </div>
                  <EngagementBadge status="Inactive" className="px-1.5 py-0.5 text-[8px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

