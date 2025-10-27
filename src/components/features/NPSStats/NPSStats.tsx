import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui';
import { Badge } from '../../ui';
import { TrendingUp, Users, MessageSquare, ThumbsUp } from 'lucide-react';
import { getNPSColor, calculateNPS } from '../../../lib/utils';

interface NPSStatsProps {
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  npsScore?: number;
}

const NPSStats: React.FC<NPSStatsProps> = ({
  totalResponses,
  promoters,
  passives,
  detractors,
  averageScore,
  npsScore
}) => {
  const calculatedNPS = npsScore !== undefined ? npsScore : calculateNPS(promoters, passives, detractors);
  
  const getNPSClassification = (score: number) => {
    if (score >= 75) return { text: 'Excelente', color: 'success' };
    if (score >= 50) return { text: 'Ótimo', color: 'success' };
    if (score >= 25) return { text: 'Bom', color: 'warning' };
    if (score >= 0) return { text: 'Regular', color: 'warning' };
    return { text: 'Crítico', color: 'danger' };
  };

  const classification = getNPSClassification(calculatedNPS);

  const stats = [
    {
      title: 'NPS Score',
      value: calculatedNPS.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: getNPSColor(calculatedNPS),
      subtitle: classification.text,
      badge: classification.color
    },
    {
      title: 'Total de Respostas',
      value: totalResponses.toString(),
      icon: <MessageSquare className="w-5 h-5" />,
      color: '#3b82f6',
      subtitle: 'Feedbacks recebidos'
    },
    {
      title: 'Promotores',
      value: promoters.toString(),
      icon: <ThumbsUp className="w-5 h-5" />,
      color: '#10b981',
      subtitle: `${totalResponses > 0 ? Math.round((promoters / totalResponses) * 100) : 0}% do total`,
      badge: 'success'
    },
    {
      title: 'Média de Score',
      value: averageScore.toFixed(1),
      icon: <Users className="w-5 h-5" />,
      color: '#8b5cf6',
      subtitle: 'Nota média geral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div 
                className="text-2xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              {stat.badge && (
                <Badge variant={stat.badge} size="sm">
                  {stat.subtitle}
                </Badge>
              )}
            </div>
            {!stat.badge && (
              <p className="text-xs text-gray-500 mt-1">
                {stat.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NPSStats;
