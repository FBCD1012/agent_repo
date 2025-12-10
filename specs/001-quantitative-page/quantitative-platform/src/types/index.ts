// Base entity with common fields
interface BaseEntity {
  readonly timestamp: number;
}

// Market data with enhanced type safety
export interface MarketData extends BaseEntity {
  readonly symbol: string;
  readonly price: number;
  readonly change24h: number;
  readonly change24hPercent: number;
  readonly volume24h: number;
}

// Candle data with OHLC validation
export interface CandleData extends BaseEntity {
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

// Position data with P&L calculations
export interface Position extends BaseEntity {
  readonly symbol: string;
  readonly quantity: number;
  readonly costPrice: number;
  readonly currentPrice: number;
  readonly pnlAmount: number;
  readonly pnlPercent: number;
  readonly entryTime: number;
}

// Timeframe options with strict typing
export type Timeframe = '1m' | '5m' | '1h' | '1d';

// User activity tracking
export interface UserActivity extends BaseEntity {
  readonly userId: string;
  readonly action: UserAction;
  readonly details: string;
}

export type UserAction =
  | 'VIEW_MARKET_DATA'
  | 'VIEW_CANDLE_CHART'
  | 'VIEW_POSITIONS'
  | 'VIEW_INDICATOR_DOCS'
  | 'CHANGE_SYMBOL'
  | 'CHANGE_TIMEFRAME'
  | 'REFRESH_DATA';

// Enhanced API response with generic typing
export interface ApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp: number;
  readonly requestId?: string;
}

// Error information with structured details
export interface ErrorInfo {
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'CACHE_ERROR'
  | 'INVALID_MARKET_DATA'
  | 'INVALID_CANDLE_DATA'
  | 'INVALID_POSITION'
  | 'RATE_LIMIT_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

// Loading state with enhanced tracking
export interface LoadingState {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastUpdated: number | null;
  readonly retryCount: number;
  readonly isRetrying: boolean;
}

// Sorting and filtering utilities
export type SortOrder = 'asc' | 'desc';
export type SortKey = 'symbol' | 'pnlPercent' | 'entryTime' | 'price' | 'volume';

// Indicator documentation types
export type IndicatorCategory =
  | 'trend'      // 趋势/均线类
  | 'momentum'   // 动量类
  | 'volume'     // 成交类
  | 'volatility' // 波动/风险类
  | 'pattern';  // 形态/跟踪类

export interface IndicatorDoc {
  readonly id: string;
  readonly name: string;
  readonly category: IndicatorCategory;
  readonly definition: string;
  readonly formula: string;
  readonly usage: string[];
  readonly riskWarning: string;
  readonly example: string;
  readonly tags: string[];
}

export interface SortConfig {
  readonly key: SortKey;
  readonly order: SortOrder;
}

export interface FilterConfig {
  readonly symbols?: readonly string[];
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly minVolume?: number;
}

// Chart configuration with validation
export interface ChartConfig {
  readonly symbol: string;
  readonly timeframe: Timeframe;
  readonly limit: number;
  readonly indicators?: readonly string[];
  readonly showVolume?: boolean;
  readonly theme?: 'light' | 'dark';
}

// Chart data point with optional volume
export interface ChartDataPoint {
  readonly timestamp: number;
  readonly value: number;
  readonly volume?: number;
}

// Validation result with detailed feedback
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// Cache entry with expiration
export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly expiresAt: number;
  readonly hitCount: number;
}

// Performance metrics
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly dataFetchTime: number;
  readonly cacheHitRate: number;
  readonly memoryUsage: number;
}

// Constants for validation
const VALID_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'] as const;
const MAX_PRICE = 1000000;
const MAX_VOLUME = 1000000000000;
// const MAX_POSITIONS = 100; // Unused constant

// Enhanced validation functions with detailed error messages
export const validateMarketData = (data: unknown): data is MarketData => {
  const d = data as MarketData;

  if (typeof d !== 'object' || d === null) {
    return false;
  }

  const errors: string[] = [];

  // Symbol validation
  if (typeof d.symbol !== 'string') {
    errors.push('Symbol must be a string');
  } else if (!VALID_SYMBOLS.includes(d.symbol as any)) {
    errors.push(`Invalid symbol: ${d.symbol}`);
  }

  // Price validation
  if (typeof d.price !== 'number') {
    errors.push('Price must be a number');
  } else if (d.price <= 0 || d.price > MAX_PRICE) {
    errors.push(`Price must be between 0 and ${MAX_PRICE}`);
  }

  // Change validation
  if (typeof d.change24h !== 'number') {
    errors.push('24h change must be a number');
  }

  if (typeof d.change24hPercent !== 'number') {
    errors.push('24h change percent must be a number');
  }

  // Volume validation
  if (typeof d.volume24h !== 'number') {
    errors.push('24h volume must be a number');
  } else if (d.volume24h < 0 || d.volume24h > MAX_VOLUME) {
    errors.push(`Volume must be between 0 and ${MAX_VOLUME}`);
  }

  // Timestamp validation
  if (typeof d.timestamp !== 'number') {
    errors.push('Timestamp must be a number');
  } else if (d.timestamp <= 0 || d.timestamp > Date.now() + 60000) {
    errors.push('Invalid timestamp');
  }

  return errors.length === 0;
};

export const validateCandleData = (data: unknown): data is CandleData => {
  const d = data as CandleData;

  if (typeof d !== 'object' || d === null) {
    return false;
  }

  const errors: string[] = [];

  // OHLC validation
  const priceFields = ['open', 'high', 'low', 'close'] as const;
  for (const field of priceFields) {
    if (typeof d[field] !== 'number') {
      errors.push(`${field} must be a number`);
    } else if (d[field] <= 0 || d[field] > MAX_PRICE) {
      errors.push(`${field} must be between 0 and ${MAX_PRICE}`);
    }
  }

  // OHLC relationship validation
  if (d.high < d.low) {
    errors.push('High must be greater than or equal to low');
  }
  if (d.high < d.open || d.high < d.close) {
    errors.push('High must be greater than or equal to both open and close');
  }
  if (d.low > d.open || d.low > d.close) {
    errors.push('Low must be less than or equal to both open and close');
  }

  // Volume validation
  if (typeof d.volume !== 'number') {
    errors.push('Volume must be a number');
  } else if (d.volume < 0 || d.volume > MAX_VOLUME) {
    errors.push(`Volume must be between 0 and ${MAX_VOLUME}`);
  }

  // Timestamp validation
  if (typeof d.timestamp !== 'number') {
    errors.push('Timestamp must be a number');
  } else if (d.timestamp <= 0 || d.timestamp > Date.now() + 60000) {
    errors.push('Invalid timestamp');
  }

  return errors.length === 0;
};

export const validatePosition = (data: unknown): data is Position => {
  const d = data as Position;

  if (typeof d !== 'object' || d === null) {
    return false;
  }

  const errors: string[] = [];

  // Symbol validation
  if (typeof d.symbol !== 'string') {
    errors.push('Symbol must be a string');
  } else if (!VALID_SYMBOLS.includes(d.symbol as any)) {
    errors.push(`Invalid symbol: ${d.symbol}`);
  }

  // Quantity validation
  if (typeof d.quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (d.quantity <= 0) {
    errors.push('Quantity must be positive');
  }

  // Price validation
  const priceFields = ['costPrice', 'currentPrice'] as const;
  for (const field of priceFields) {
    if (typeof d[field] !== 'number') {
      errors.push(`${field} must be a number`);
    } else if (d[field] <= 0 || d[field] > MAX_PRICE) {
      errors.push(`${field} must be between 0 and ${MAX_PRICE}`);
    }
  }

  // P&L validation
  if (typeof d.pnlAmount !== 'number') {
    errors.push('P&L amount must be a number');
  }

  if (typeof d.pnlPercent !== 'number') {
    errors.push('P&L percent must be a number');
  }

  // Timestamp validation
  const timeFields = ['entryTime', 'timestamp'] as const;
  for (const field of timeFields) {
    if (typeof d[field] !== 'number') {
      errors.push(`${field} must be a number`);
    } else if (d[field] <= 0 || d[field] > Date.now() + 60000) {
      errors.push(`Invalid ${field}`);
    }
  }

  return errors.length === 0;
};

// Type guards for runtime validation
export const isTimeframe = (value: unknown): value is Timeframe => {
  return typeof value === 'string' && ['1m', '5m', '1h', '1d'].includes(value);
};

export const isSortOrder = (value: unknown): value is SortOrder => {
  return typeof value === 'string' && ['asc', 'desc'].includes(value);
};

export const isErrorCode = (value: unknown): value is ErrorCode => {
  const validCodes = [
    'VALIDATION_ERROR',
    'NETWORK_ERROR',
    'CACHE_ERROR',
    'INVALID_MARKET_DATA',
    'INVALID_CANDLE_DATA',
    'INVALID_POSITION',
    'RATE_LIMIT_ERROR',
    'TIMEOUT_ERROR',
    'UNKNOWN_ERROR',
  ];
  return typeof value === 'string' && validCodes.includes(value);
};

// Utility functions for type-safe operations
export const createSafeMarketData = (data: unknown): MarketData | null => {
  return validateMarketData(data) ? data : null;
};

export const createSafeCandleData = (data: unknown): CandleData | null => {
  return validateCandleData(data) ? data : null;
};

export const createSafePosition = (data: unknown): Position | null => {
  return validatePosition(data) ? data : null;
};

// Type-safe array filtering
export const filterValidMarketData = (data: readonly unknown[]): MarketData[] => {
  return data.filter((item): item is MarketData => validateMarketData(item));
};

export const filterValidCandleData = (data: readonly unknown[]): CandleData[] => {
  return data.filter((item): item is CandleData => validateCandleData(item));
};

export const filterValidPositions = (data: readonly unknown[]): Position[] => {
  return data.filter((item): item is Position => validatePosition(item));
};
