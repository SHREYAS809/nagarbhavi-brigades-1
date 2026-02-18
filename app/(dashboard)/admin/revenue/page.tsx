'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { AddRevenueModal } from '@/components/dashboard/modals/add-revenue-modal';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Plus } from 'lucide-react';

export default function AdminRevenuePage() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [memberRevenueData, setMemberRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (user?.token) {
      try {
        const [rev, usrs] = await Promise.all([
          api.getRevenue(user.token),
          api.getUsers(user.token)
        ]);
        setRevenue(rev);
        setMembers(usrs);
        processChartData(rev, usrs);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processChartData = (data: any[], userList: any[]) => {
    // 1. Revenue Trend (Group by Month)
    const monthly: { [key: string]: number } = {};
    data.forEach(item => {
      monthly[item.month] = (monthly[item.month] || 0) + item.amount;
    });
    const chart = Object.keys(monthly).map(month => ({
      month,
      amount: monthly[month]
    }));
    setChartData(chart);

    // 2. Revenue by Member
    const byMember: { [key: string]: number } = {};
    data.forEach(item => {
      // Find member name
      // Item should have member_id
      const mName = userList.find(u => u.id === item.member_id)?.name || 'Unknown';
      byMember[mName] = (byMember[mName] || 0) + item.amount;
    });
    const memberChart = Object.keys(byMember).map(member => ({
      member,
      revenue: byMember[member]
    })).sort((a, b) => b.revenue - a.revenue); // Sort desc
    setMemberRevenueData(memberChart);
  };


  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
  const thisYearRevenue = totalRevenue; // Simplified
  const thisMonthRevenue = chartData.length > 0 ? chartData[chartData.length - 1].amount : 0;
  const avgMonthlyRevenue = chartData.length > 0 ? Math.round(totalRevenue / chartData.length) : 0;

  // Top performers
  const topPerformers = memberRevenueData.slice(0, 5);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive revenue insights and trends
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Revenue
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold gold-text">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">This Year</p>
          <p className="text-3xl font-bold text-primary">₹{(thisYearRevenue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-green-400 mt-2">↑ 25% from last year</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">This Month</p>
          <p className="text-3xl font-bold text-secondary">₹{(thisMonthRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-400 mt-2">↑ 12% from last month</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">Avg. Monthly</p>
          <p className="text-3xl font-bold text-accent">₹{(avgMonthlyRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground mt-2">12 month average</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
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
                tickFormatter={(value: number) => `₹${value / 1000}K`}
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
        </div>

        {/* Revenue by Member */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Member</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="member"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value: number) => `₹${value / 1000}K`}
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
              <Bar
                dataKey="revenue"
                fill="#D4AF37"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Members</h3>
        <div className="space-y-3">
          {topPerformers.map((member, index) => (
            <div key={member.member} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full font-bold text-sm text-primary">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{member.member}</p>
                  <p className="text-xs text-muted-foreground">Revenue generated</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold gold-text">₹{(member.revenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-green-400">↑ 15% this month</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddRevenueModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
