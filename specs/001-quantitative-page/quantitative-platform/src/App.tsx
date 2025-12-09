import { useState, useEffect } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, CssBaseline, Paper, ThemeProvider, createTheme } from '@mui/material';
import MarketDataCard from './components/MarketDataCard';
import CandleChart from './components/CandleChart';
import Positions from './components/Positions';
import { dataService } from './services/dataService';
import type { MarketData, Position } from './types';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const updateData = () => {
      const newMarketData = dataService.getMarketData();
      const newPositions = dataService.getPositions();
      setMarketData(newMarketData);
      setPositions(newPositions);
      setLoading(false);
    };

    // Initial load
    updateData();

    // Set up real-time updates every 3 seconds
    const interval = setInterval(updateData, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', backgroundColor: '#ffffff' }}>
          <Typography variant="h6">Loading market data...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              量化交易平台
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            实时市场数据
          </Typography>
        
        {/* Market Data Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {marketData.map((data) => (
            <Box key={data.symbol} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)', lg: '1 1 calc(25% - 12px)' } }}>
              <MarketDataCard data={data} />
            </Box>
          ))}
        </Box>

        {/* Candle Chart and Positions */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '2 1 0%' } }}>
            <Paper sx={{ height: '500px' }}>
              <CandleChart symbol="BTC/USDT" />
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 0%' } }}>
            <Paper sx={{ height: '500px', overflow: 'auto' }}>
              <Positions positions={positions} />
            </Paper>
          </Box>
        </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App
