import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MarketData, Position, CandleData, Timeframe } from '../types';
import { dataService } from '../services/dataService';

interface UseQuantitativeDataReturn {
  marketData: MarketData[];
  positions: Position[];
  candleData: CandleData[];
  selectedSymbol: string;
  selectedTimeframe: Timeframe;
  loading: boolean;
  error: string | null;
  setSelectedSymbol: (symbol: string) => void;
  setSelectedTimeframe: (timeframe: Timeframe) => void;
  refreshData: () => void;
}

export const useQuantitativeData = (): UseQuantitativeDataReturn => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1h');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback(async () => {
    try {
      setError(null);
      const [newMarketData, newPositions, newCandleData] = await Promise.all([
        Promise.resolve(dataService.getMarketData()),
        Promise.resolve(dataService.getPositions()),
        Promise.resolve(dataService.getCandleData(selectedSymbol, selectedTimeframe))
      ]);

      setMarketData(newMarketData);
      setPositions(newPositions);
      setCandleData(newCandleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Data update error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, selectedTimeframe]);

  const refreshData = useCallback(() => {
    setLoading(true);
    updateData();
  }, [updateData]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  useEffect(() => {
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, [updateData]);

  const memoizedReturn = useMemo(() => ({
    marketData,
    positions,
    candleData,
    selectedSymbol,
    selectedTimeframe,
    loading,
    error,
    setSelectedSymbol,
    setSelectedTimeframe,
    refreshData
  }), [
    marketData,
    positions,
    candleData,
    selectedSymbol,
    selectedTimeframe,
    loading,
    error,
    setSelectedSymbol,
    setSelectedTimeframe,
    refreshData
  ]);

  return memoizedReturn;
};