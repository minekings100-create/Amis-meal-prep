'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { TrendPoint } from '@/lib/admin/stats';
import { formatMoneyCents } from '@/lib/utils/money';

const dayLabel = new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'short' });

export function RevenueChart({ data }: { data: TrendPoint[] }) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date,
        label: dayLabel.format(new Date(d.date)),
        orders: d.orders,
        revenueEur: Math.round(d.revenueCents / 100),
      })),
    [data],
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7cc24f" stopOpacity={1} />
              <stop offset="100%" stopColor="#4a8a3c" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef0eb" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#9aa19a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="left"
            stroke="#9aa19a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9aa19a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: '#dcdfd9', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e8e8e3',
              boxShadow: '0 8px 24px -12px rgba(19,22,19,0.18)',
              fontSize: 12,
            }}
            formatter={(value: number, key) =>
              key === 'revenueEur' ? [formatMoneyCents(value * 100), 'Omzet'] : [value, 'Orders']
            }
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => (value === 'revenueEur' ? 'Omzet' : 'Orders')}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenueEur"
            stroke="url(#revGradient)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#4a8a3c' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#131613"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 4, fill: '#131613' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
