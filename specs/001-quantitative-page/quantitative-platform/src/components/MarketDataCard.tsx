import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { MarketData } from '../types';

interface MarketDataCardProps {
  data: MarketData;
}

const MarketDataCard: React.FC<MarketDataCardProps> = ({ data }) => {
  const isPositive = data.change24hPercent >= 0;
  
  return (
    <Card sx={{ minWidth: 275, m: 1 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {data.symbol}
        </Typography>
        <Typography variant="h4" component="div" color="primary">
          ${data.price.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Chip
            label={`${isPositive ? '+' : ''}${data.change24hPercent.toFixed(2)}%`}
            color={isPositive ? 'success' : 'error'}
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {isPositive ? '+' : ''}${data.change24h.toFixed(2)} (24h)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vol: ${(data.volume24h / 1000000).toFixed(2)}M
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MarketDataCard;