import type { MarketData, CandleData, Position, Timeframe } from '../types';

class DataService {
  private basePrice = 50000;
  private symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'];

  // Simulate real-time market data
  getMarketData(): MarketData[] {
    return this.symbols.map(symbol => {
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
        timestamp: Date.now()
      };
    });
  }

  // Simulate historical candle data
  getCandleData(symbol: string, timeframe: Timeframe, limit: number = 500): CandleData[] {
    const data: CandleData[] = [];
    const now = Date.now();
    let intervalMs: number;
    
    switch (timeframe) {
      case '1m': intervalMs = 60 * 1000; break;
      case '5m': intervalMs = 5 * 60 * 1000; break;
      case '1h': intervalMs = 60 * 60 * 1000; break;
      case '1d': intervalMs = 24 * 60 * 60 * 1000; break;
      default: intervalMs = 60 * 60 * 1000;
    }
    
    let currentPrice = this.basePrice + (symbol.includes('ETH') ? -30000 : 0);
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const volatility = currentPrice * 0.02;
      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = Math.random() * 10000000;
      
      data.push({
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume.toFixed(2))
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  // Simulate position data
  getPositions(): Position[] {
    return [
      {
        symbol: 'BTC/USDT',
        quantity: 0.5,
        costPrice: 48000,
        currentPrice: 51200,
        pnlAmount: 1600,
        pnlPercent: 3.33,
        entryTime: Date.now() - (7 * 24 * 60 * 60 * 1000)
      },
      {
        symbol: 'ETH/USDT',
        quantity: 10,
        costPrice: 2800,
        currentPrice: 2750,
        pnlAmount: -500,
        pnlPercent: -1.79,
        entryTime: Date.now() - (3 * 24 * 60 * 60 * 1000)
      },
      {
        symbol: 'SOL/USDT',
        quantity: 100,
        costPrice: 95,
        currentPrice: 108,
        pnlAmount: 1300,
        pnlPercent: 13.68,
        entryTime: Date.now() - (1 * 24 * 60 * 60 * 1000)
      }
    ];
  }
}

export const dataService = new DataService();