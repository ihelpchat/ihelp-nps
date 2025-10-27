export type NPSCategory = 'promoters' | 'passives' | 'detractors';
export type NPSCategoryFilter = '' | NPSCategory;

export interface NPSFilters {
  profile: string;
  url: string;
  category: NPSCategoryFilter;
}

export interface NPSFeedback {
  id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  website: string | null;
  category: string | null;
  business_id: string | null;
  profile: string | null;
  email: string | null;
  user_id: string;
  session_id: string;
  url: string | null;
}

export interface NPSChartPoint {
  date: string;
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface NPSDistributionItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WordCloudItem {
  text: string;
  value: number;
}

export interface NPSStatsSummary {
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  npsScore: number;
  commentsCount: number;
}

export interface NPSBusinessSnapshot {
  id: string;
  name?: string | null;
  count: number;
  averageScore: number;
  nps: number;
}

export interface NPSQueryResult {
  feedbacks: NPSFeedback[];
  stats: NPSStatsSummary;
  timeline: NPSChartPoint[];
  distribution: NPSDistributionItem[];
  wordCloud: WordCloudItem[];
  businessBreakdown: NPSBusinessSnapshot[];
}
