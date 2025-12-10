import {
  type MarketData,
  type CandleData,
  type Position,
  type Timeframe,
  type ApiResponse,
  type ErrorInfo,
  type ErrorCode,
  validateMarketData,
  validateCandleData,
  validatePosition,
} from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_LIMIT = 500;

class DataServiceError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DataServiceError';
    this.code = code;
    this.details = details;
  }
}

class DataService {
  private readonly basePrice = 50000;
  private readonly symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'];
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private lastError: ErrorInfo | null = null;

  private generateCacheKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    });
  }

  private validateAndThrow<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    errorMessage: string,
    code: ErrorCode = 'VALIDATION_ERROR',
  ): T {
    if (!validator(data)) {
      const error = new DataServiceError(errorMessage, code as ErrorCode, { data });
      this.lastError = {
        code: error.code as ErrorCode,
        message: error.message,
        details: error.details,
        timestamp: Date.now(),
      };
      throw error;
    }
    return data;
  }

  private createApiResponse<T>(
    data: T,
    success: boolean = true,
    message?: string,
  ): ApiResponse<T> {
    return {
      data,
      success,
      message,
      timestamp: Date.now(),
    };
  }

  public getLastError(): ErrorInfo | null {
    return this.lastError;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  private generateMarketData(symbol: string): MarketData {
    const randomChange = (Math.random() - 0.5) * 1000;
    const price = this.basePrice + randomChange + (symbol.includes('ETH') ? -30000 : 0);
    const change24h = (Math.random() - 0.5) * 2000;
    const change24hPercent = (change24h / price) * 100;
    const volume24h = Math.random() * 1000000000;

    return {
      symbol,
      price: Number(price.toFixed(2)),
      change24h: Number(change24h.toFixed(2)),
      change24hPercent: Number(change24hPercent.toFixed(2)),
      volume24h: Number(volume24h.toFixed(2)),
      timestamp: Date.now(),
    };
  }

  public getMarketData(): MarketData[] {
    try {
      const cacheKey = this.generateCacheKey('marketData', {});
      const cachedData = this.getFromCache<MarketData[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const data = this.symbols.map(symbol => {
        const marketData = this.generateMarketData(symbol);

        return this.validateAndThrow(
          marketData,
          validateMarketData,
          `Invalid market data for ${symbol}`,
          'INVALID_MARKET_DATA',
        );
      });

      this.setCache(cacheKey, data, 3000); // Cache for 3 seconds
      this.lastError = null;

      return data;
    } catch (error) {
      console.error('Error generating market data:', error);
      throw error;
    }
  }

  private generateCandleData(symbol: string, timeframe: Timeframe, limit: number): CandleData[] {
    const data: CandleData[] = [];
    const now = Date.now();

    const intervalMap: Record<Timeframe, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };

    const intervalMs = intervalMap[timeframe] || intervalMap['1h'];
    let currentPrice = this.basePrice + (symbol.includes('ETH') ? -30000 : 0);

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const volatility = currentPrice * 0.02;
      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = Math.random() * 10000000;

      const candleData = {
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume.toFixed(2)),
      };

      data.push(candleData);
      currentPrice = close;
    }

    return data;
  }

  public getCandleData(symbol: string, timeframe: Timeframe, limit: number = DEFAULT_LIMIT): CandleData[] {
    try {
      const cacheKey = this.generateCacheKey('candleData', { symbol, timeframe, limit });
      const cachedData = this.getFromCache<CandleData[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const data = this.generateCandleData(symbol, timeframe, limit);

      const validatedData = data.map(candleData =>
        this.validateAndThrow(
          candleData,
          validateCandleData,
          `Invalid candle data for ${symbol} at ${timeframe}`,
          'INVALID_CANDLE_DATA',
        ),
      );

      this.setCache(cacheKey, validatedData);
      this.lastError = null;

      return validatedData;
    } catch (error) {
      console.error(`Error generating candle data for ${symbol}:`, error);
      throw error;
    }
  }

  private generatePositionData(): Position[] {
    return [
      {
        symbol: 'BTC/USDT',
        quantity: 0.5,
        costPrice: 48000,
        currentPrice: 51200,
        pnlAmount: 1600,
        pnlPercent: 3.33,
        entryTime: Date.now() - (7 * 24 * 60 * 60 * 1000),
        timestamp: Date.now(),
      },
      {
        symbol: 'ETH/USDT',
        quantity: 10,
        costPrice: 2800,
        currentPrice: 2750,
        pnlAmount: -500,
        pnlPercent: -1.79,
        entryTime: Date.now() - (3 * 24 * 60 * 60 * 1000),
        timestamp: Date.now(),
      },
      {
        symbol: 'SOL/USDT',
        quantity: 100,
        costPrice: 95,
        currentPrice: 108,
        pnlAmount: 1300,
        pnlPercent: 13.68,
        entryTime: Date.now() - (1 * 24 * 60 * 60 * 1000),
        timestamp: Date.now(),
      },
    ];
  }

  public getPositions(): Position[] {
    try {
      const cacheKey = this.generateCacheKey('positions', {});
      const cachedData = this.getFromCache<Position[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const positions = this.generatePositionData();

      const validatedPositions = positions.map(position =>
        this.validateAndThrow(
          position,
          validatePosition,
          `Invalid position data for ${position.symbol}`,
          'INVALID_POSITION',
        ),
      );

      this.setCache(cacheKey, validatedPositions, 10000); // Cache for 10 seconds
      this.lastError = null;

      return validatedPositions;
    } catch (error) {
      console.error('Error generating position data:', error);
      throw error;
    }
  }

  public async getMarketDataAsync(): Promise<ApiResponse<MarketData[]>> {
    try {
      const data = this.getMarketData();
      return this.createApiResponse(data, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch market data';
      return this.createApiResponse([] as MarketData[], false, message);
    }
  }

  public async getCandleDataAsync(
    symbol: string,
    timeframe: Timeframe,
    limit: number = DEFAULT_LIMIT,
  ): Promise<ApiResponse<CandleData[]>> {
    try {
      const data = this.getCandleData(symbol, timeframe, limit);
      return this.createApiResponse(data, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch candle data';
      return this.createApiResponse([] as CandleData[], false, message);
    }
  }

  public async getPositionsAsync(): Promise<ApiResponse<Position[]>> {
    try {
      const data = this.getPositions();
      return this.createApiResponse(data, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch positions';
      return this.createApiResponse([] as Position[], false, message);
    }
  }
}

export const dataService = new DataService();
