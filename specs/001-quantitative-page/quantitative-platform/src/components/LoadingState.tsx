import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  loading, 
  error, 
  onRetry, 
  children 
}) => {
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          加载市场数据中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            onRetry && (
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={onRetry}
              >
                重试
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingState;