
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  CssBaseline, 
  Paper, 
  ThemeProvider, 
  createTheme,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import MarketDataCard from './components/MarketDataCard';
import CandleChart from './components/CandleChart';
import Positions from './components/Positions';
import LoadingState from './components/LoadingState';
import { useQuantitativeData } from './hooks/useQuantitativeData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const {
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
  } = useQuantitativeData();

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              量化交易平台
            </Typography>
            <Tooltip title="刷新数据">
              <IconButton color="inherit" onClick={refreshData} disabled={loading}>
                <Badge badgeContent={0} color="error">
                  <RefreshIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="设置">
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" color="text.primary">
              实时市场数据
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最后更新: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>

          <LoadingState loading={loading} error={error} onRetry={refreshData}>
            {/* Market Data Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {marketData.map((data) => (
                <Box 
                  key={data.symbol} 
                  sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)', lg: '1 1 calc(25% - 12px)' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSymbolSelect(data.symbol)}
                >
                  <MarketDataCard data={data} />
                </Box>
              ))}
            </Box>

            {/* Candle Chart and Positions */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', lg: '2 1 0%' } }}>
                <Paper 
                  sx={{ 
                    height: '500px', 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                  elevation={2}
                >
                  <CandleChart
                    data={candleData}
                    symbol={selectedSymbol}
                    timeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                  />
                </Paper>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 0%' } }}>
                <Paper 
                  sx={{ 
                    height: '500px', 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                  elevation={2}
                >
                  <Positions positions={positions} />
                </Paper>
              </Box>
            </Box>
          </LoadingState>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;