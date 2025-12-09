import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { MarketData } from '../types';

interface MarketDataCardProps {
  data: MarketData;
}

const MarketDataCard: React.FC<MarketDataCardProps> = ({ data }) => {
  const isPositive = data.change24hPercent >= 0;
  
  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    }
    return `$${(volume / 1000000).toFixed(2)}M`;
  };

  return (
    <Card 
      sx={{ 
        minWidth: 275, 
        m: 1,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
          {data.symbol}
        </Typography>
        <Typography variant="h4" component="div" color="primary" fontWeight="bold">
          ${formatPrice(data.price)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Chip
            label={`${isPositive ? '+' : ''}${data.change24hPercent.toFixed(2)}%`}
            color={isPositive ? 'success' : 'error'}
            size="small"
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <Typography variant="body2" color="text.secondary">
            {isPositive ? '+' : ''}${formatPrice(data.change24h)} (24h)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vol: {formatVolume(data.volume24h)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default memo(MarketDataCard);