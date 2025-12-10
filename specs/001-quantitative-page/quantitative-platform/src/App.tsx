
import React, { memo, useMemo, useState, useCallback } from 'react';
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
  Badge,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import MarketDataCard from './components/MarketDataCard';
import CandleChart from './components/CandleChart';
import Positions from './components/Positions';
import LoadingState from './components/LoadingState';
import IndicatorDocs from './components/IndicatorDocs';
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

interface AppHeaderProps {
  readonly loading: boolean;
  readonly refreshData: () => void;
  readonly showIndicatorDocs: boolean;
  readonly onToggleIndicatorDocs: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = memo(({
  loading,
  refreshData,
  showIndicatorDocs,
  onToggleIndicatorDocs,
}) => {
  return (
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        {showIndicatorDocs ? '技术指标科普' : '量化交易平台'}
      </Typography>
      {!showIndicatorDocs && (
        <>
          <Tooltip title="指标科普">
            <IconButton color="inherit" onClick={onToggleIndicatorDocs}>
              <SchoolIcon />
            </IconButton>
          </Tooltip>
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
        </>
      )}
      {showIndicatorDocs && (
        <Tooltip title="返回主页面">
          <IconButton color="inherit" onClick={onToggleIndicatorDocs}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
});

AppHeader.displayName = 'AppHeader';

const MainContent: React.FC = memo(() => {
  const {
    marketData,
    positions,
    candleData,
    selectedSymbol,
    selectedTimeframe,
    loading,
    error,
    lastUpdated,
    setSelectedSymbol,
    setSelectedTimeframe,
    refreshData,
  } = useQuantitativeData();

  const marketDataHeader = useMemo(() => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" color="text.primary">
        实时市场数据
      </Typography>
      <Typography variant="body2" color="text.secondary">
        最后更新: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '从未更新'}
      </Typography>
    </Box>
  ), [lastUpdated]);

  const marketDataCards = useMemo(() => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
      {marketData.map((data) => (
        <Box
          key={data.symbol}
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)', lg: '1 1 calc(25% - 12px)' },
          }}
        >
          <MarketDataCard
            data={data}
            onClick={setSelectedSymbol}
          />
        </Box>
      ))}
    </Box>
  ), [marketData, setSelectedSymbol]);

  const chartAndPositions = useMemo(() => (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
      <Box sx={{ flex: { xs: '1 1 100%', lg: '2 1 0%' } }}>
        <Paper
          sx={{
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
            overflow: 'hidden',
          }}
          elevation={2}
        >
          <Positions positions={positions} />
        </Paper>
      </Box>
    </Box>
  ), [candleData, selectedSymbol, selectedTimeframe, setSelectedTimeframe, positions]);

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      {marketDataHeader}
      <LoadingState loading={loading} error={error} onRetry={refreshData}>
        {marketDataCards}
        {chartAndPositions}
      </LoadingState>
    </Container>
  );
});

MainContent.displayName = 'MainContent';

const App: React.FC = memo(() => {
  const { loading, refreshData } = useQuantitativeData();
  const [showIndicatorDocs, setShowIndicatorDocs] = useState<boolean>(false);

  const handleToggleIndicatorDocs = useCallback(() => {
    setShowIndicatorDocs(prev => !prev);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <AppBar position="static" elevation={1}>
          <AppHeader
            loading={loading}
            refreshData={refreshData}
            showIndicatorDocs={showIndicatorDocs}
            onToggleIndicatorDocs={handleToggleIndicatorDocs}
          />
        </AppBar>
        {showIndicatorDocs ? (
          <IndicatorDocs onBack={handleToggleIndicatorDocs} />
        ) : (
          <MainContent />
        )}
      </Box>
    </ThemeProvider>
  );
});

App.displayName = 'App';

export default App;
