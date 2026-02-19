'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Info } from 'lucide-react';

import { useState, useMemo } from 'react';

interface ReferralActivityChartProps {
    referrals: any[];
    currentUserId: string;
}

export function ReferralActivityChart({ referrals, currentUserId }: ReferralActivityChartProps) {
    const [timeRange, setTimeRange] = useState<'6M' | '12M' | 'Lifetime'>('12M');

    const chartData = useMemo(() => {
        const given = referrals.filter((r: any) => r.from_member === currentUserId);
        const months = [];
        const today = new Date();

        let rangeMonths = 12;
        if (timeRange === '6M') rangeMonths = 6;
        if (timeRange === 'Lifetime') rangeMonths = 24; // Or dynamic based on first referral

        for (let i = rangeMonths - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                date: d,
                name: d.toLocaleString('default', { month: 'short', year: timeRange === 'Lifetime' ? '2-digit' : undefined }),
                value: 0
            });
        }

        return months.map(month => {
            const nextMonth = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 1);

            // Cumulative count up to the end of this month
            const count = given.filter((r: any) => {
                const rDate = new Date(r.created_at || r.date);
                return rDate < nextMonth;
            }).length;

            return { name: month.name, value: count };
        });
    }, [referrals, currentUserId, timeRange]);

    return (
        <Card className="glass-card border-t-4 border-t-primary shadow-[0_0_15px_rgba(251,191,36,0.1)] h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-primary">
                    Referrals Given:
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))" // Gold
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: '#000' }}
                            activeDot={{ r: 6, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-black/20">
                <Button
                    variant={timeRange === '6M' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('6M')}
                    className={`text-xs ${timeRange === '6M' ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Last 6 Months
                </Button>
                <Button
                    variant={timeRange === '12M' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('12M')}
                    className={`text-xs ${timeRange === '12M' ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Last 12 Months
                </Button>
                <Button
                    variant={timeRange === 'Lifetime' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('Lifetime')}
                    className={`text-xs ${timeRange === 'Lifetime' ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Lifetime
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground">
                    <Info className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
