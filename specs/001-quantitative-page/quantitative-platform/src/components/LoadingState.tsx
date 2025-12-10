import React, { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Fade,
  Skeleton,
  Backdrop,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  WifiOff as WifiOffIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { LoadingState as LoadingStateType } from '../types';

interface LoadingStateProps {
  readonly loading: boolean;
  readonly error: string | null;
  readonly onRetry?: () => void;
  readonly children: React.ReactNode;
  readonly minHeight?: number;
  readonly showSkeleton?: boolean;
  readonly backdrop?: boolean;
  readonly loadingMessage?: string;
  readonly errorMessage?: string;
}

const LoadingState: React.FC<LoadingStateProps> = memo(({
  loading,
  error,
  onRetry,
  children,
  minHeight = 200,
  showSkeleton = false,
  backdrop = false,
  loadingMessage = '加载市场数据中...',
  errorMessage,
}) => {
  const getErrorIcon = useMemo(() => {
    if (error?.toLowerCase().includes('network')) {
      return WifiOffIcon;
    }
    if (error?.toLowerCase().includes('timeout')) {
      return ScheduleIcon;
    }
    return RefreshIcon;
  }, [error]);

  const getErrorSeverity = useMemo(() => {
    if (error?.toLowerCase().includes('network')) {
      return 'warning' as const;
    }
    if (error?.toLowerCase().includes('timeout')) {
      return 'info' as const;
    }
    return 'error' as const;
  }, [error]);

  const loadingContent = useMemo(() => (
    <Fade in={loading} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight,
          gap: 2,
          p: 2,
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body1" color="text.secondary" align="center">
          {loadingMessage}
        </Typography>
        {showSkeleton && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={200} />
          </Box>
        )}
      </Box>
    </Fade>
  ), [loading, minHeight, loadingMessage, showSkeleton]);

  const errorContent = useMemo(() => {
    const ErrorIcon = getErrorIcon;
    const displayMessage = errorMessage || error || '未知错误';

    return (
      <Fade in={!loading && !!error} timeout={300}>
        <Box sx={{ p: 2 }}>
          <Alert
            severity={getErrorSeverity}
            icon={<ErrorIcon fontSize="inherit" />}
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
            sx={{ mb: 2 }}
          >
            {displayMessage}
          </Alert>

          {/* Additional error context */}
          {error?.toLowerCase().includes('network') && (
            <Box sx={{ mt: 1, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                请检查您的网络连接，确保可以访问数据服务。如果问题持续存在，请联系技术支持。
              </Typography>
            </Box>
          )}

          {error?.toLowerCase().includes('timeout') && (
            <Box sx={{ mt: 1, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                请求超时，可能是服务器响应较慢或网络延迟较高。请稍后重试。
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    );
  }, [error, errorMessage, getErrorIcon, getErrorSeverity, onRetry]);

  const content = useMemo(() => {
    if (loading) {
      return backdrop ? (
        <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff' }}>
          {loadingContent}
        </Backdrop>
      ) : loadingContent;
    }

    if (error) {
      return errorContent;
    }

    return (
      <Fade in={!loading && !error} timeout={300}>
        <Box>
          {children}
        </Box>
      </Fade>
    );
  }, [loading, error, children, backdrop, loadingContent, errorContent]);

  return content;
});

LoadingState.displayName = 'LoadingState';

// Enhanced loading state component with more features
export const EnhancedLoadingState: React.FC<{
  readonly state: LoadingStateType;
  readonly onRetry?: () => void;
  readonly children: React.ReactNode;
  readonly minHeight?: number;
}> = memo(({ state, onRetry, children, minHeight = 200 }) => {
  const { isLoading, error, lastUpdated, retryCount } = state;

  const retryMessage = useMemo(() => {
    if (retryCount > 0) {
      return ` (已重试 ${retryCount} 次)`;
    }
    return '';
  }, [retryCount]);

  const lastUpdatedMessage = useMemo(() => {
    if (lastUpdated) {
      return `最后更新: ${new Date(lastUpdated).toLocaleTimeString()}`;
    }
    return null;
  }, [lastUpdated]);

  return (
    <Box sx={{ position: 'relative', minHeight }}>
      <LoadingState
        loading={isLoading}
        error={error}
        onRetry={onRetry}
        minHeight={minHeight}
        loadingMessage={`加载数据中...${retryMessage}`}
      >
        {children}
      </LoadingState>

      {/* Status indicator */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        {lastUpdatedMessage && (
          <Typography variant="caption" color="text.secondary">
            {lastUpdatedMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

EnhancedLoadingState.displayName = 'EnhancedLoadingState';

export default LoadingState;
