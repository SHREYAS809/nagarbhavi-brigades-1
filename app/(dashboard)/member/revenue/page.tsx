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
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function RevenuePage() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const res = await api.getRevenue(user.token);
          // Filter for earnings only (Received)
          const myEarnings = res.filter((r: any) => r.member_id === user.id);
          setRevenue(myEarnings);
          processChartData(myEarnings);
        } catch (error) {
          console.error("Failed to fetch revenue", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  const processChartData = (data: any[]) => {
    // Group by month
    const monthly: { [key: string]: number } = {};
    data.forEach(item => {
      monthly[item.month] = (monthly[item.month] || 0) + item.amount;
    });

    // Convert to array
    const chart = Object.keys(monthly).map(month => ({
      month,
      amount: monthly[month]
    }));
    setChartData(chart);
  };

  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);

  // Get this month's revenue (assuming month name match)
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const thisMonthRevenue = revenue
    .filter(r => r.month === currentMonth)
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRevenue = Math.round(thisMonthRevenue * 0.15); // Mock logic for now

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading revenue data...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Revenue Summary</h1>
        <p className="text-muted-foreground">
          Track your revenue generated through referrals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold gold-text mb-2">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-muted-foreground">All time</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">This Month</p>
          <p className="text-3xl font-bold text-primary mb-2">₹{(thisMonthRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-400">↑ 12% from last month</p>
        </div>
        <div className="glass-card-hover p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <p className="text-3xl font-bold text-secondary mb-2">₹{(pendingRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-yellow-400">Expected this month</p>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Month</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((item) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-4">{item.source}</td>
                  <td className="py-3 px-4">{item.month}</td>
                  <td className="py-3 px-4 text-right font-semibold">₹{(item.amount / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4 text-right">{item.notes}</td>
                </tr>
              ))}
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
            Revenue is calculated based on successful referrals and tier classification.
            Pending amounts will be confirmed after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
