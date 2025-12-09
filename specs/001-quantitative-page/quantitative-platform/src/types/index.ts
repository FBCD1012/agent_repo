export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  timestamp: number;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  pnlAmount: number;
  pnlPercent: number;
  entryTime: number;
}

export type Timeframe = '1m' | '5m' | '1h' | '1d';

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: number;
  details: string;
}

// Enhanced type safety
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Utility types
export type SortOrder = 'asc' | 'desc';
export type SortKey = 'symbol' | 'pnlPercent' | 'entryTime';

// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  volume?: number;
}

export interface ChartConfig {
  symbol: string;
  timeframe: Timeframe;
  limit: number;
  indicators?: string[];
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Market data validation
export const validateMarketData = (data: unknown): data is MarketData => {
  const d = data as MarketData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.symbol === 'string' &&
    typeof d.price === 'number' &&
    typeof d.change24h === 'number' &&
    typeof d.change24hPercent === 'number' &&
    typeof d.volume24h === 'number' &&
    typeof d.timestamp === 'number' &&
    d.price > 0 &&
    d.volume24h >= 0
  );
};

export const validateCandleData = (data: unknown): data is CandleData => {
  const d = data as CandleData;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.timestamp === 'number' &&
    typeof d.open === 'number' &&
    typeof d.high === 'number' &&
    typeof d.low === 'number' &&
    typeof d.close === 'number' &&
    typeof d.volume === 'number' &&
    d.open > 0 &&
    d.high >= d.low &&
    d.high >= d.open &&
    d.high >= d.close &&
    d.low <= d.open &&
    d.low <= d.close &&
    d.volume >= 0
  );
};

export const validatePosition = (data: unknown): data is Position => {
  const d = data as Position;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.symbol === 'string' &&
    typeof d.quantity === 'number' &&
    typeof d.costPrice === 'number' &&
    typeof d.currentPrice === 'number' &&
    typeof d.pnlAmount === 'number' &&
    typeof d.pnlPercent === 'number' &&
    typeof d.entryTime === 'number' &&
    d.quantity > 0 &&
    d.costPrice > 0 &&
    d.currentPrice > 0
  );
};