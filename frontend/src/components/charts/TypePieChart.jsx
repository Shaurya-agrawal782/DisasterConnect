import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function TypePieChart({ data = {}, title }) {
  // Convert object mapping (e.g. fire: 3, medical: 1) to array of { name, value }
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value,
      rawKey: key
    }))
    .filter(item => item.value > 0); // Hide zero categories for a cleaner look

  // Standard color palette for pie slices
  const COLORS = {
    // Incident Types
    fire: '#ef4444', // red
    flood: '#3b82f6', // blue
    medical: '#ec4899', // pink
    accident: '#f97316', // orange
    crowd: '#a855f7', // purple
    rescue: '#10b981', // emerald
    other: '#64748b', // slate
    // Alert Priorities
    low: '#10b981', // green
    medium: '#f59e0b', // amber
    high: '#f97316', // orange
    critical: '#ef4444', // red
    // Alert Types
    incident_created: '#3b82f6',
    incident_assigned: '#8b5cf6',
    status_updated: '#f59e0b',
    resource_updated: '#ec4899',
    system: '#64748b'
  };

  const getSliceColor = (key) => {
    return COLORS[key] || '#6366f1';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline-variant rounded-lg p-2.5 shadow-sm text-xs">
          <p className="font-semibold text-on-surface">{payload[0].name}</p>
          <p className="text-primary font-bold mt-0.5">
            Count: <span className="text-on-surface">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col h-[300px] hover:border-outline transition duration-300">
      {title && (
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
          {title}
        </h4>
      )}
      <div className="flex-1 w-full min-h-0">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-on-surface-variant/65 text-xs font-medium">
            No statistics available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSliceColor(entry.rawKey)} 
                    stroke="#ffffff" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', color: '#434655' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
