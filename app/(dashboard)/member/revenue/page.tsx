'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownLeft, Video } from 'lucide-react';
import { MemberDetailsModal } from '@/components/dashboard/modals/member-details-modal';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RevenuePage() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [view, setView] = useState<'received' | 'given'>('received');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const [res, usrs] = await Promise.all([
            api.getRevenue(user.token, filters),
            api.getUsers(user.token)
          ]);
          setRevenue(res);
          setMembers(usrs);

          const relevantData = view === 'received'
            ? res.filter((r: any) => String(r.member_id) === String(user.id))
            : res.filter((r: any) => String(r.created_by) === String(user.id));

          processChartData(relevantData);
        } catch (error) {
          console.error("Failed to fetch revenue", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user, filters, view]);

  const processChartData = (data: any[]) => {
    // Group by month from created_at or date
    const monthly: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data.forEach(item => {
      const date = new Date(item.created_at || item.date);
      const monthLabel = months[date.getMonth()];
      monthly[monthLabel] = (monthly[monthLabel] || 0) + item.amount;
    });

    // Ensure we have last 6 months at least
    const chart = months.map(m => ({
      month: m,
      amount: monthly[m] || 0
    })).filter(m => monthly[m.month] !== undefined || true); // Keep all for now or filter by actual data range

    setChartData(chart);
  };

  const getMember = (id: string) => members.find(m => String(m.id || m._id) === String(id));

  const handleMemberClick = (id: string) => {
    const member = getMember(id);
    if (member) {
      setSelectedMember(member);
      setIsMemberModalOpen(true);
    }
  };

  const receivedRevenue = revenue.filter((r: any) => String(r.member_id) === String(user?.id));
  const givenRevenue = revenue.filter((r: any) => String(r.created_by) === String(user?.id));

  const totalReceived = receivedRevenue.reduce((sum, item) => sum + item.amount, 0);
  const totalGiven = givenRevenue.reduce((sum, item) => sum + item.amount, 0);

  const currentMonthIdx = new Date().getMonth();
  const thisMonthRevenue = receivedRevenue
    .filter(r => new Date(r.created_at || r.date).getMonth() === currentMonthIdx)
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRevenue = Math.round(totalReceived * 0.1);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading revenue data...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gold-text mb-2">Revenue Tracking</h1>
          <p className="text-muted-foreground">
            Monitor business generated and received within the chapter.
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="received" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Received</TabsTrigger>
            <TabsTrigger value="given" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Given</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FilterBar onFilterChange={setFilters} placeholder="Search records..." />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card-hover p-6 border-primary/20 bg-primary/5">
          <p className="text-sm text-primary mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Total Received
          </p>
          <p className="text-3xl font-bold text-white mb-2">₹{totalReceived.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Business that came to you</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-primary" />
            Total Given
          </p>
          <p className="text-3xl font-bold text-white mb-2">₹{totalGiven.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Business you generated for others</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            This Month
          </p>
          <p className="text-3xl font-bold text-white mb-2">₹{thisMonthRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-400">↑ Healthy Activity</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value: any) => `₹${value / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f5f5f5' }}
                formatter={(value: number) => [`₹${(value / 1000).toFixed(1)}K`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: '#D4AF37', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground py-12">No revenue data available</div>
        )}
      </div>

      {/* Breakdown Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {view === 'received' ? 'Business Received History' : 'Business Given History'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium uppercase tracking-tighter text-[10px]">Date</th>
                <th className="text-left py-3 px-4 font-medium uppercase tracking-tighter text-[10px]">
                  {view === 'received' ? 'From (Referrer)' : 'To (Recipient)'}
                </th>
                <th className="text-left py-3 px-4 font-medium uppercase tracking-tighter text-[10px]">Type</th>
                <th className="text-right py-3 px-4 font-medium uppercase tracking-tighter text-[10px]">Amount</th>
                <th className="text-left py-3 px-4 font-medium uppercase tracking-tighter text-[10px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(view === 'received' ? receivedRevenue : givenRevenue).map((item) => (
                <tr key={item._id || item.id} className="hover:bg-white/5 transition group">
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                    {new Date(item.created_at || item.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-white/10 shadow-sm">
                        <AvatarImage src={getMember(view === 'received' ? item.created_by : item.member_id)?.photo} />
                        <AvatarFallback className="text-[10px] bg-gray-800">
                          {getMember(view === 'received' ? item.created_by : item.member_id)?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="font-semibold text-white group-hover:text-gold cursor-pointer transition-colors"
                        onClick={() => handleMemberClick(view === 'received' ? item.created_by : item.member_id)}
                      >
                        {getMember(view === 'received' ? item.created_by : item.member_id)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] border-white/10 font-normal">
                      {item.type || 'Thank You'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-white">₹{item.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[200px] truncate text-gray-500 italic text-xs">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
              {(view === 'received' ? receivedRevenue : givenRevenue).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-600">No records found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground text-sm">Revenue Calculation</p>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue is calculated based on successful referrals and business generated.
            'Received' shows business others gave you. 'Given' shows business you gave back.
          </p>
        </div>
      </div>
      <MemberDetailsModal
        open={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
        member={selectedMember}
      />
    </div>
  );
}
