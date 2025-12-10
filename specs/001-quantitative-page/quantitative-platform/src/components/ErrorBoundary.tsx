import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert, Collapse } from '@mui/material';
import { ErrorOutline, Refresh, ExpandMore, BugReport } from '@mui/icons-material';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly showDetails?: boolean;
}

interface State {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
  readonly showDetails: boolean;
  readonly retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: props.showDetails ?? false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (!import.meta.env.DEV) {
      // TODO: Integrate with error logging service
      console.warn('Error logging service integration needed');
    }
  }

  handleReset = () => {
    const { retryCount } = this.state;

    if (retryCount >= this.maxRetries) {
      // Max retries reached, force page reload
      window.location.reload();
      return;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: retryCount + 1,
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  getErrorMessage = (error?: Error): string => {
    if (!error) return '未知错误';

    // Common error patterns
    if (error.message.includes('Network Error')) {
      return '网络连接失败，请检查您的网络连接';
    }

    if (error.message.includes('Failed to fetch')) {
      return '数据获取失败，请稍后重试';
    }

    if (error.message.includes('ChunkLoadError')) {
      return '应用加载失败，请刷新页面';
    }

    return error.message || '应用程序遇到未知错误';
  };

  render() {
    const { hasError, error, errorInfo, showDetails, retryCount } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const errorMessage = this.getErrorMessage(error);
      const canRetry = retryCount < this.maxRetries;

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 700,
              width: '100%',
              textAlign: 'center',
              backgroundColor: 'background.paper',
            }}
            elevation={3}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />

            <Typography variant="h5" gutterBottom color="text.primary" fontWeight="bold">
              应用程序遇到错误
            </Typography>

            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {errorMessage}
            </Alert>

            <Typography variant="body1" color="text.secondary" paragraph>
              很抱歉，应用程序遇到了意外错误。{canRetry ? '您可以尝试重试，' : ''}或者刷新页面。
              {retryCount > 0 && (
                <Box component="span" sx={{ ml: 1, color: 'warning.main' }}>
                  (已重试 {retryCount} 次)
                </Box>
              )}
            </Typography>

            {/* Error details for development */}
            {(import.meta.env.DEV || showDetails) && error && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BugReport />}
                  onClick={this.toggleDetails}
                  sx={{ mb: 1 }}
                >
                  {showDetails ? '隐藏' : '显示'}错误详情
                </Button>

                <Collapse in={showDetails}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                      textAlign: 'left',
                      maxHeight: 300,
                      overflow: 'auto',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      错误信息:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        backgroundColor: 'grey.900',
                        color: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      {error.toString()}
                    </Typography>

                    {errorInfo?.componentStack && (
                      <>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          组件堆栈:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            fontSize: '0.7rem',
                            overflow: 'auto',
                            backgroundColor: 'grey.900',
                            color: 'grey.100',
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {canRetry && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReset}
                  disabled={retryCount >= this.maxRetries}
                >
                  重试 {retryCount > 0 && `(${this.maxRetries - retryCount} 次剩余)`}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </Button>
              {import.meta.env.DEV && (
                <Button
                  variant="text"
                  color="secondary"
                  onClick={this.toggleDetails}
                  startIcon={showDetails ? <ExpandMore /> : <ExpandMore />}
                >
                  {showDetails ? '隐藏' : '显示'}详情
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
