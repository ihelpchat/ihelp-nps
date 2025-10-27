import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';

interface WordCloudItem {
  text: string;
  value: number;
}

interface WordCloudProps {
  words: WordCloudItem[];
  title?: string;
  maxWords?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  words, 
  title = 'Nuvem de Palavras', 
  maxWords = 50 
}) => {
  // Sort by frequency and take top words
  const sortedWords = words
    .sort((a, b) => b.value - a.value)
    .slice(0, maxWords);

  // Calculate font sizes based on frequency
  const maxValue = Math.max(...sortedWords.map(w => w.value));
  const minValue = Math.min(...sortedWords.map(w => w.value));
  
  const getFontSize = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return Math.floor(12 + normalized * 24); // Font size between 12px and 36px
  };

  const getOpacity = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return 0.4 + normalized * 0.6; // Opacity between 0.4 and 1.0
  };

  const getColor = () => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (sortedWords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhuma palavra encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 min-h-[300px]">
          {sortedWords.map((word, index) => (
            <span
              key={`${word.text}-${index}`}
              className="inline-block px-2 py-1 rounded-md transition-all hover:scale-110 cursor-pointer"
              style={{
                fontSize: `${getFontSize(word.value)}px`,
                opacity: getOpacity(word.value),
                color: getColor(),
                fontWeight: getFontSize(word.value) > 20 ? '600' : '400',
              }}
              title={`${word.text}: ${word.value} ocorrências`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCloud;
