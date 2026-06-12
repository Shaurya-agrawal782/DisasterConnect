import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function StatusBarChart({ data = {}, title }) {
  // Convert object mapping (e.g. status: count) to array of { name, count }
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
    count: value,
    rawKey: key
  }));

  // Clean custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline-variant rounded-lg p-2.5 shadow-sm text-xs">
          <p className="font-semibold text-on-surface">{payload[0].payload.name}</p>
          <p className="text-primary font-bold mt-0.5">
            Count: <span className="text-on-surface">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Color mapping based on status
  const getColor = (key) => {
    const colors = {
      reported: '#0284c7', // sky-600
      verified: '#0037b0', // primary
      assigned: '#8b5cf6', // violet-500
      'in-progress': '#f59e0b', // amber-500
      resolved: '#10b981', // emerald-500
      closed: '#747686', // outline
      // Resource statuses
      available: '#10b981',
      busy: '#ba1a1a', // error
      maintenance: '#f59e0b',
      offline: '#747686',
    };
    return colors[key] || '#0037b0';
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col h-[300px] hover:border-outline transition duration-300">
      {title && (
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
          {title}
        </h4>
      )}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e1ed" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#747686" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#747686" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(237, 237, 249, 0.4)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.rawKey)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
