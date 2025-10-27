import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';

interface NPSData {
  date: string;
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
}

interface NPSChartProps {
  data: NPSData[];
  title?: string;
  height?: number;
}

const NPSChart: React.FC<NPSChartProps> = ({ 
  data, 
  title = 'Evolução do NPS', 
  height = 300 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
              formatter={(value: number, name: string) => [
                value,
                name === 'score' ? 'NPS' : 
                name === 'promoters' ? 'Promotores' :
                name === 'passives' ? 'Neutros' : 'Detratores'
              ]}
            />
            <Legend 
              formatter={(value) => 
                value === 'score' ? 'NPS' : 
                value === 'promoters' ? 'Promotores' :
                value === 'passives' ? 'Neutros' : 'Detratores'
              }
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NPSChart;
