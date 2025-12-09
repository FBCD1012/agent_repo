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