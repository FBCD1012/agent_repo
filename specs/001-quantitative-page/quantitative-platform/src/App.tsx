
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MarketDataCard from './components/MarketDataCard';
import CandleChart from './components/CandleChart';
import Positions from './components/Positions';
import LoadingState from './components/LoadingState';
import IndicatorDocs from './components/IndicatorDocs';
import { useQuantitativeData } from './hooks/useQuantitativeData';

interface AppHeaderProps {
  readonly loading: boolean;
  readonly refreshData: () => void;
  readonly showIndicatorDocs: boolean;
  readonly onToggleIndicatorDocs: () => void;
  readonly darkMode: boolean;
  readonly onToggleDarkMode: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = memo(({
  loading,
  refreshData,
  showIndicatorDocs,
  onToggleIndicatorDocs,
  darkMode,
  onToggleDarkMode,
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
          <Tooltip title={darkMode ? '切换亮色模式' : '切换暗色模式'}>
            <IconButton color="inherit" onClick={onToggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
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
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
});

AppHeader.displayName = 'AppHeader';

interface MainContentProps {
  readonly marketData: import('./types').MarketData[];
  readonly positions: import('./types').Position[];
  readonly candleData: import('./types').CandleData[];
  readonly selectedSymbol: string;
  readonly selectedTimeframe: import('./types').Timeframe;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastUpdated: number | null;
  readonly setSelectedSymbol: (symbol: string) => void;
  readonly setSelectedTimeframe: (timeframe: import('./types').Timeframe) => void;
  readonly refreshData: () => void;
}

const MainContent: React.FC<MainContentProps> = memo(({
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
}) => {
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
            isSelected={data.symbol === selectedSymbol}
          />
        </Box>
      ))}
    </Box>
  ), [marketData, setSelectedSymbol, selectedSymbol]);

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

const lightTheme = createTheme({
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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
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

const App: React.FC = memo(() => {
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

  const [showIndicatorDocs, setShowIndicatorDocs] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const handleToggleIndicatorDocs = useCallback(() => {
    setShowIndicatorDocs(prev => !prev);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const currentTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: currentTheme.palette.background.default }}>
        <AppBar position="static" elevation={1}>
          <AppHeader
            loading={loading}
            refreshData={refreshData}
            showIndicatorDocs={showIndicatorDocs}
            onToggleIndicatorDocs={handleToggleIndicatorDocs}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </AppBar>
        {showIndicatorDocs ? (
          <IndicatorDocs onBack={handleToggleIndicatorDocs} />
        ) : (
          <MainContent
            marketData={marketData}
            positions={positions}
            candleData={candleData}
            selectedSymbol={selectedSymbol}
            selectedTimeframe={selectedTimeframe}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            setSelectedSymbol={setSelectedSymbol}
            setSelectedTimeframe={setSelectedTimeframe}
            refreshData={refreshData}
          />
        )}
      </Box>
    </ThemeProvider>
  );
});

App.displayName = 'App';

export default App;
