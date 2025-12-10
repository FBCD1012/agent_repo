import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { MarketData, Position, CandleData, Timeframe } from '../types';
import { dataService } from '../services/dataService';

interface UseQuantitativeDataReturn {
  readonly marketData: MarketData[];
  readonly positions: Position[];
  readonly candleData: CandleData[];
  readonly selectedSymbol: string;
  readonly selectedTimeframe: Timeframe;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastUpdated: number | null;
  setSelectedSymbol: (symbol: string) => void;
  setSelectedTimeframe: (timeframe: Timeframe) => void;
  refreshData: () => void;
}

const DEFAULT_SYMBOL = 'BTC/USDT';
const DEFAULT_TIMEFRAME: Timeframe = '1h';
const REFRESH_INTERVAL = 3000;

export const useQuantitativeData = (): UseQuantitativeDataReturn => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateData = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;

    try {
      setError(null);

      const [newMarketData, newPositions, newCandleData] = await Promise.all([
        dataService.getMarketData(),
        dataService.getPositions(),
        dataService.getCandleData(selectedSymbol, selectedTimeframe),
      ]);

      if (signal?.aborted) return;

      setMarketData(newMarketData);
      setPositions(newPositions);
      setCandleData(newCandleData);
      setLastUpdated(Date.now());
    } catch (err) {
      if (signal?.aborted) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Data update error:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [selectedSymbol, selectedTimeframe]);

  const refreshData = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    updateData(abortControllerRef.current.signal).finally(() => {
      abortControllerRef.current = null;
    });
  }, [updateData]);

  useEffect(() => {
    refreshData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshData]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      refreshData();
    }, REFRESH_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshData]);

  const handleSymbolSelect = useCallback((symbol: string) => {
    if (symbol !== selectedSymbol) {
      setSelectedSymbol(symbol);
    }
  }, [selectedSymbol]);

  const handleTimeframeSelect = useCallback((timeframe: Timeframe) => {
    if (timeframe !== selectedTimeframe) {
      setSelectedTimeframe(timeframe);
    }
  }, [selectedTimeframe]);

  return useMemo(() => ({
    marketData,
    positions,
    candleData,
    selectedSymbol,
    selectedTimeframe,
    loading,
    error,
    lastUpdated,
    setSelectedSymbol: handleSymbolSelect,
    setSelectedTimeframe: handleTimeframeSelect,
    refreshData,
  }), [
    marketData,
    positions,
    candleData,
    selectedSymbol,
    selectedTimeframe,
    loading,
    error,
    lastUpdated,
    handleSymbolSelect,
    handleTimeframeSelect,
    refreshData,
  ]);
};
