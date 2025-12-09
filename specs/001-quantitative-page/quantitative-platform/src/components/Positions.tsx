import React from 'react';
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
  Box
} from '@mui/material';
import type { Position } from '../types';

interface PositionsProps {
  positions: Position[];
}

const Positions: React.FC<PositionsProps> = ({ positions }) => {
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (positions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          暂无持仓
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        持仓信息
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>交易对</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell align="right">成本价</TableCell>
              <TableCell align="right">当前价</TableCell>
              <TableCell align="right">盈亏金额</TableCell>
              <TableCell align="right">盈亏比例</TableCell>
              <TableCell align="right">持仓时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => {
              const isPositive = position.pnlPercent >= 0;
              return (
                <TableRow key={position.symbol}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      {position.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(position.quantity, 4)}
                  </TableCell>
                  <TableCell align="right">
                    ${formatNumber(position.costPrice)}
                  </TableCell>
                  <TableCell align="right">
                    ${formatNumber(position.currentPrice)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${isPositive ? '+' : ''}$${formatNumber(position.pnlAmount)}`}
                      color={isPositive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${isPositive ? '+' : ''}${formatNumber(position.pnlPercent)}%`}
                      color={isPositive ? 'success' : 'error'}
                      size="small"
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

export default Positions;