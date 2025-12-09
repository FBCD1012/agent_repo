import React, { memo, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  TableSortLabel
} from '@mui/material';
import type { Position } from '../types';

interface PositionsProps {
  positions: Position[];
}

type SortKey = 'symbol' | 'pnlPercent' | 'entryTime';
type SortOrder = 'asc' | 'desc';

const Positions: React.FC<PositionsProps> = ({ positions }) => {
  const [sortKey, setSortKey] = React.useState<SortKey>('pnlPercent');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const sortedPositions = useMemo(() => {
    const sorted = [...positions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'pnlPercent':
          comparison = a.pnlPercent - b.pnlPercent;
          break;
        case 'entryTime':
          comparison = a.entryTime - b.entryTime;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [positions, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    const isAsc = sortKey === key && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortKey(key);
  };

  if (positions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无持仓
          </Typography>
          <Typography variant="body2" color="text.secondary">
            开始交易后您的持仓信息将显示在这里
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        持仓信息 ({positions.length})
      </Typography>
      <TableContainer 
        component={Paper} 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          '& .MuiTableCell-root': {
            py: 1,
            px: 1
          }
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell 
                sortDirection={sortKey === 'symbol' ? sortOrder : false}
                sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
              >
                <TableSortLabel
                  active={sortKey === 'symbol'}
                  direction={sortKey === 'symbol' ? sortOrder : 'asc'}
                  onClick={() => handleSort('symbol')}
                >
                  交易对
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                数量
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                成本价
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                当前价
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                盈亏金额
              </TableCell>
              <TableCell 
                sortDirection={sortKey === 'pnlPercent' ? sortOrder : false}
                sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
              >
                <TableSortLabel
                  active={sortKey === 'pnlPercent'}
                  direction={sortKey === 'pnlPercent' ? sortOrder : 'asc'}
                  onClick={() => handleSort('pnlPercent')}
                >
                  盈亏比例
                </TableSortLabel>
              </TableCell>
              <TableCell 
                sortDirection={sortKey === 'entryTime' ? sortOrder : false}
                sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
              >
                <TableSortLabel
                  active={sortKey === 'entryTime'}
                  direction={sortKey === 'entryTime' ? sortOrder : 'asc'}
                  onClick={() => handleSort('entryTime')}
                >
                  持仓时间
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPositions.map((position) => {
              const isPositive = position.pnlPercent >= 0;
              return (
                <TableRow 
                  key={position.symbol}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      {position.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {formatNumber(position.quantity, 4)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      ${formatNumber(position.costPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                      ${formatNumber(position.currentPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${isPositive ? '+' : ''}$${formatNumber(position.pnlAmount)}`}
                      color={isPositive ? 'success' : 'error'}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${isPositive ? '+' : ''}${formatNumber(position.pnlPercent)}%`}
                      color={isPositive ? 'success' : 'error'}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(position.entryTime)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(Positions);