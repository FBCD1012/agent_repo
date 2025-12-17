import React, { memo, useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { MarketData } from '../types';

interface MarketDataCardProps {
  readonly data: MarketData;
  readonly onClick?: (symbol: string) => void;
  readonly isSelected?: boolean;
}

const MarketDataCard: React.FC<MarketDataCardProps> = ({ data, onClick, isSelected = false }) => {
  const cardData = useMemo(() => {
    const isPositive = data.change24hPercent >= 0;

    const formatPrice = (price: number): string => {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const formatVolume = (volume: number): string => {
      if (volume >= 1000000000) {
        return `$${(volume / 1000000000).toFixed(2)}B`;
      }
      if (volume >= 1000000) {
        return `$${(volume / 1000000).toFixed(2)}M`;
      }
      if (volume >= 1000) {
        return `$${(volume / 1000).toFixed(2)}K`;
      }
      return `$${volume.toFixed(2)}`;
    };

    const changeLabel = `${isPositive ? '+' : ''}${data.change24hPercent.toFixed(2)}%`;
    const changeAmountLabel = `${isPositive ? '+' : ''}$${formatPrice(data.change24h)}`;
    const volumeLabel = `Vol: ${formatVolume(data.volume24h)}`;

    return {
      isPositive,
      priceLabel: `$${formatPrice(data.price)}`,
      changeLabel,
      changeAmountLabel,
      volumeLabel,
    };
  }, [data]);

  const handleClick = useMemo(() => {
    if (!onClick) return undefined;
    return () => onClick(data.symbol);
  }, [onClick, data.symbol]);

  return (
    <Card
      sx={{
        minWidth: 275,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : undefined,
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
          {data.symbol}
        </Typography>
        <Typography variant="h4" component="div" color="primary" fontWeight="bold">
          {cardData.priceLabel}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Chip
            label={cardData.changeLabel}
            color={cardData.isPositive ? 'success' : 'error'}
            size="small"
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <Typography variant="body2" color="text.secondary">
            {cardData.changeAmountLabel} (24h)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {cardData.volumeLabel}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default memo(MarketDataCard);
