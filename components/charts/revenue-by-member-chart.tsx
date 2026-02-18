'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueByMemberChartProps {
  data: Array<{ member: string; revenue: number }>;
}

export function RevenueByMemberChart({ data }: RevenueByMemberChartProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Member</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="member" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            formatter={(value) => `₹${value / 1000}K`}
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
  );
}
