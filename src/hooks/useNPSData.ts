import { useQuery } from '@tanstack/react-query';
import { subDays, formatISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import {
  NPSFilters,
  NPSFeedback,
  NPSChartPoint,
  NPSDistributionItem,
  NPSStatsSummary,
  WordCloudItem,
  NPSBusinessSnapshot,
  NPSQueryResult,
  NPSCategory,
} from '../types/nps';
import { calculateNPS, getNPSCategory } from '../lib/utils';

interface UseNPSDataOptions {
  filters: NPSFilters;
  days?: number;
}

function buildWordCloud(feedbacks: NPSFeedback[]): WordCloudItem[] {
  const wordCount: Record<string, number> = {};

  feedbacks.forEach((feedback) => {
    if (!feedback.feedback) return;

    const words = feedback.feedback
      .toLowerCase()
      .replace(/[.,!?;:()"']/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 80);
}

function buildTimeline(feedbacks: NPSFeedback[], days: number): NPSChartPoint[] {
  const timeline: Record<string, NPSChartPoint> = {};

  for (let i = 0; i <= days; i++) {
    const date = formatISO(subDays(new Date(), days - i), { representation: 'date' });
    timeline[date] = {
      date,
      score: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    };
  }

  feedbacks.forEach((feedback) => {
    const date = feedback.created_at.slice(0, 10);
    if (!timeline[date]) return;

    const entry = timeline[date];
    entry.score += feedback.score;

    if (feedback.score >= 9) entry.promoters += 1;
    else if (feedback.score >= 7) entry.passives += 1;
    else entry.detractors += 1;
  });

  return Object.values(timeline).map((point) => {
    const total = point.promoters + point.passives + point.detractors;
    return {
      ...point,
      score: total === 0 ? 0 : Math.round((point.score / total) * 10) / 10,
    };
  });
}

function buildDistribution(feedbacks: NPSFeedback[]): NPSDistributionItem[] {
  const categories: Record<NPSCategory, { count: number; color: string; label: string }> = {
    promoters: { count: 0, color: '#10b981', label: 'Promotores' },
    passives: { count: 0, color: '#f59e0b', label: 'Neutros' },
    detractors: { count: 0, color: '#ef4444', label: 'Detratores' },
  };

  feedbacks.forEach((feedback) => {
    const category = getNPSCategory(feedback.score);
    categories[category].count += 1;
  });

  const total = feedbacks.length || 1;
  return (Object.entries(categories) as [NPSCategory, { count: number; color: string; label: string }][]).map(([, value]) => ({
    category: value.label,
    count: value.count,
    percentage: Math.round((value.count / total) * 100),
    color: value.color,
  }));
}

function buildBusinessSnapshot(feedbacks: NPSFeedback[]): NPSBusinessSnapshot[] {
  const businesses: Record<string, { feedbacks: NPSFeedback[] }> = {};

  feedbacks.forEach((feedback) => {
    const id = feedback.business_id || 'sem-identificacao';
    if (!businesses[id]) {
      businesses[id] = { feedbacks: [] };
    }
    businesses[id].feedbacks.push(feedback);
  });

  return Object.entries(businesses)
    .map(([businessId, data]) => {
      const total = data.feedbacks.length;
      const averageScore = total === 0
        ? 0
        : data.feedbacks.reduce((sum, feedback) => sum + feedback.score, 0) / total;
      const promoters = data.feedbacks.filter((feedback) => feedback.score >= 9).length;
      const detractors = data.feedbacks.filter((feedback) => feedback.score <= 6).length;
      const nps = calculateNPS(promoters, total - promoters - detractors, detractors);

      return {
        id: businessId,
        name: data.feedbacks[0]?.website,
        count: total,
        averageScore: Math.round(averageScore * 10) / 10,
        nps,
      };
    })
    .sort((a, b) => b.count - a.count);
}

function buildStats(feedbacks: NPSFeedback[]): NPSStatsSummary {
  const totalResponses = feedbacks.length;
  const promoters = feedbacks.filter((feedback) => feedback.score >= 9).length;
  const passives = feedbacks.filter((feedback) => feedback.score >= 7 && feedback.score <= 8).length;
  const detractors = feedbacks.filter((feedback) => feedback.score <= 6).length;
  const commentsCount = feedbacks.filter((feedback) => Boolean(feedback.feedback)).length;
  const averageScore = totalResponses === 0
    ? 0
    : feedbacks.reduce((sum, item) => sum + item.score, 0) / totalResponses;
  const npsScore = calculateNPS(promoters, passives, detractors);

  return {
    totalResponses,
    promoters,
    passives,
    detractors,
    commentsCount,
    averageScore: Math.round(averageScore * 10) / 10,
    npsScore,
  };
}

async function fetchNPSData(filters: NPSFilters): Promise<NPSFeedback[]> {
  let query = supabase
    .from('nps_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.profile) {
    query = query.eq('profile', filters.profile);
  }

  if (filters.url && filters.url.length >= 3) {
    query = query.ilike('url', `%${filters.url}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  let results = (data || []) as NPSFeedback[];

  if (filters.category) {
    results = results.filter((feedback) => getNPSCategory(feedback.score) === filters.category);
  }

  return results;
}

export function useNPSData({ filters, days = 30 }: UseNPSDataOptions) {
  return useQuery<NPSQueryResult>({
    queryKey: ['nps-data', filters, days],
    queryFn: async () => {
      const feedbacks = await fetchNPSData(filters);
      const stats = buildStats(feedbacks);
      const timeline = buildTimeline(feedbacks, days);
      const distribution = buildDistribution(feedbacks);
      const wordCloud = buildWordCloud(feedbacks);
      const businessBreakdown = buildBusinessSnapshot(feedbacks);

      return {
        feedbacks,
        stats,
        timeline,
        distribution,
        wordCloud,
        businessBreakdown,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
