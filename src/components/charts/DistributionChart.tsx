import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';

interface DistributionData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface DistributionChartProps {
  data: DistributionData[];
  title?: string;
  height?: number;
}

const DistributionChart: React.FC<DistributionChartProps> = ({ 
  data, 
  title = 'Distribuição NPS', 
  height = 300 
}) => {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: DistributionData }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.category}</p>
          <p className="text-sm text-gray-600">
            Quantidade: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            Percentual: {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DistributionChart;
