'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { DashboardMetricCard } from '@/components/dashboard/dashboard-metric-card';
import { ReferralActivityChart } from '@/components/charts/referral-activity-chart';
import { Wallet, Briefcase, GraduationCap, Coffee, UserCheck, Inbox, Send, ExternalLink, Printer, FileText, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { EngagementBadge } from '@/components/dashboard/engagement-badge';
import { SearchBar } from '@/components/dashboard/search-bar';
import Link from 'next/link';

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'6m' | '12m' | 'lifetime'>('12m');

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        setLoading(true);
        try {
          const [dashboardData, engagementData] = await Promise.all([
            api.getDashboardData(user.token, timeFilter),
            api.getEngagementStats(user.token)
          ]);
          setData(dashboardData);
          setEngagement(engagementData.find((m: any) => m.id === user.id));
        } catch (error: any) {
          console.error("Failed to fetch dashboard data", error);
          if (error.message.includes('401')) {
            logout();
            window.location.href = '/login'; // Force redirect
          }
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user, timeFilter]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-400">Failed to load data.</div>;

  const { referrals, revenue, meetings, members } = data;

  // Robustness: Ensure we have the current user's ID
  const currentUserId = user?.id || members.find((m: any) => m.email === user?.email)?.id;

  const referralsGiven = referrals.filter((r: any) => r.from_member === currentUserId).length;
  const referralsReceived = referrals.filter((r: any) => r.to_member === currentUserId).length;

  // Calculate Revenue
  const revenueGivenList = revenue.filter((r: any) => r.created_by === currentUserId);
  const revenueReceivedList = revenue.filter((r: any) => r.member_id === currentUserId);

  const revenueGenerated = revenueGivenList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  const revenueReceivedVal = revenueReceivedList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  const meetingsCount = meetings.length; // Assuming all fetched meetings involve the user or are relevant

  // Mock Data for Missing Features (Visitors/CEUs logic would go here)
  const visitorsCount = 0;
  const ceusCount = 0;

  // Chart Data Logic moved to component


  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-red-600 tracking-tight">Hello {user?.name?.split(' ')[0] || 'Member'}</h1>
          {engagement && <EngagementBadge status={engagement.status} className="h-6" />}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar />

          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded text-sm font-medium text-foreground">
            Nagarbhavi Brigades
          </div>

          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded text-sm text-foreground flex flex-col items-center leading-none">
            <span className="text-[10px] text-muted-foreground uppercase">Renewal Due Date</span>
            <span className="font-bold">04/01/2027</span>
          </div>

          <div className="flex bg-black/40 border border-white/10 p-1 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeFilter('6m')}
              className={`text-xs px-3 h-8 ${timeFilter === '6m' ? 'bg-primary text-black hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
            >
              6 Months
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeFilter('12m')}
              className={`text-xs px-3 h-8 ${timeFilter === '12m' ? 'bg-primary text-black hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
            >
              12 Months
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeFilter('lifetime')}
              className={`text-xs px-3 h-8 ${timeFilter === 'lifetime' ? 'bg-primary text-black hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Lifetime
            </Button>
          </div>

          <Button variant="outline" className="border-red-600/50 text-red-500 hover:bg-red-600/10 hover:text-red-400">
            Regional Website
          </Button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-yellow-500/20">
            MSP
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="text-muted-foreground hover:text-red-500"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Column: Chart (Span 5) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="h-[400px] xl:h-[500px]">
            <ReferralActivityChart
              referrals={referrals}
              currentUserId={currentUserId}
              timeRange={timeFilter === '6m' ? '6M' : timeFilter === '12m' ? '12M' : 'Lifetime'}
            />
          </div>
        </div>

        {/* Right Column: Metrics Grid (Span 7) */}
        <div className="xl:col-span-7 space-y-6">

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Revenue Received */}
            <DashboardMetricCard
              title="Revenue Received"
              value={`₹${revenueReceivedVal.toLocaleString()}`}
              icon={Wallet} // Changed from Zap
              variant="default"
              actions={[
                { label: 'Say Thank You', variant: 'destructive', className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400', href: '/member/thank-you' },
                { label: 'Review', variant: 'ghost', href: '/member/revenue' }
              ]}
            />

            <DashboardMetricCard
              title="Referrals Received"
              value={referralsReceived}
              icon={Inbox} // Changed from Gift
              actions={[
                { label: 'Track Online', variant: 'destructive', className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 col-span-2', href: '/member/referrals-received' }
              ]}
            />

            <DashboardMetricCard
              title="Referrals Given"
              value={referralsGiven}
              icon={Send} // Changed from TrendingUp
              variant="highlight" // Highlighted as it matches the chart
              actions={[
                { label: 'Give Referral', variant: 'destructive', className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400', href: '/member/submit' },
                { label: 'Review', variant: 'ghost', href: '/member/referral' }
              ]}
            />

            <DashboardMetricCard
              title="Business Generated"
              value={`₹${revenueGenerated.toLocaleString()}`}
              icon={Briefcase} // Changed from Award
            // No actions on this one in screenshot? Or implies submission elsewhere
            />

            <DashboardMetricCard
              title="Guests Invited"
              value={visitorsCount}
              icon={UserCheck}
              actions={[
                {
                  label: 'Guest Portal',
                  variant: 'destructive',
                  className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 col-span-2',
                  href: '/member/guests'
                }
              ]}
            />

            <DashboardMetricCard
              title="Learning Credits"
              value={ceusCount}
              icon={GraduationCap}
              actions={[
                {
                  label: 'Submit',
                  variant: 'destructive',
                  className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400',
                  href: '/member/learning'
                },
                {
                  label: 'Review',
                  variant: 'ghost',
                  href: '/member/learning'
                }
              ]}
            />

            <DashboardMetricCard
              title="Connects"
              value={meetingsCount}
              icon={Coffee} // Changed from Users
              actions={[
                { label: 'Log Meeting', variant: 'destructive', className: 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400', href: '/member/meetings' },
                { label: 'Review', variant: 'ghost', href: '/member/meetings' }
              ]}
            />

          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="w-full justify-start border-white/10 hover:bg-white/5 h-12 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-all group"
            >
              <Printer className="w-4 h-4 mr-2 group-hover:text-red-500" />
              Print Weekly Summary
            </Button>
            <Link href="/member/referral" className="w-full">
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 h-12 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-all group">
                <FileText className="w-4 h-4 mr-2 group-hover:text-red-500" />
                Referrals Report
              </Button>
            </Link>
            <Link href="/member/revenue" className="w-full">
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 h-12 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-all group">
                <ExternalLink className="w-4 h-4 mr-2 group-hover:text-red-500" />
                My Activity Report
              </Button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

