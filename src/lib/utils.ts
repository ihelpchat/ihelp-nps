import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { NPSCategory } from '../types/nps';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getNPSCategory(score: number): NPSCategory {
  if (score >= 9) return 'promoters';
  if (score >= 7) return 'passives';
  return 'detractors';
}

export function getNPSColor(score: number): string {
  const category = getNPSCategory(score);
  switch (category) {
    case 'promoters':
      return '#10b981'; // green-500
    case 'passives':
      return '#f59e0b'; // amber-500
    case 'detractors':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function calculateNPS(promoters: number, passives: number, detractors: number): number {
  const total = promoters + passives + detractors;
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) return;

  const csvHeaders = headers || Object.keys(data[0]).reduce((acc, key) => {
    acc[key as keyof T] = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    return acc;
  }, {} as Record<keyof T, string>);

  const csvContent = [
    Object.values(csvHeaders).join(','),
    ...data.map(row => 
      Object.keys(row).map(key => {
        const value = row[key as keyof T];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
