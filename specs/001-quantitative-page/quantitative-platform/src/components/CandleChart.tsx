import React, { useState, useEffect } from 'react';
import { Box, ButtonGroup, Button, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { CandleData, Timeframe } from '../types';
import { dataService } from '../services/dataService';

interface CandleChartProps {
  symbol?: string;
}

const CandleChart: React.FC<CandleChartProps> = ({ symbol = 'BTC/USDT' }) => {
  const [data, setData] = useState<CandleData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const newData = dataService.getCandleData(symbol, timeframe);
      setData(newData);
      setLoading(false);
    };
    loadData();
  }, [symbol, timeframe]);

  const getChartOption = () => {
    const klineData = data.map(item => [
      item.timestamp,
      item.open,
      item.close,
      item.low,
      item.high
    ]);

    return {
      title: {
        text: `${symbol} - ${timeframe.toUpperCase()}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: Array<{ data: number[] }>) => {
          const data = params[0].data;
          const date = new Date(data[0]);
          return `
            <div>
              <strong>${date.toLocaleString()}</strong><br/>
              Open: $${data[1].toFixed(2)}<br/>
              Close: $${data[2].toFixed(2)}<br/>
              Low: $${data[3].toFixed(2)}<br/>
              High: $${data[4].toFixed(2)}
            </div>
          `;
        }
      },
      xAxis: {
        type: 'time',
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        scale: true,
        splitLine: { show: true }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 70,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 70,
          end: 100
        }
      ],
      series: [
        {
          name: 'K-line',
          type: 'candlestick',
          data: klineData,
          itemStyle: {
            color: '#26a69a',
            color0: '#ef5350',
            borderColor: '#26a69a',
            borderColor0: '#ef5350'
          }
        }
      ]
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading chart data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {(['1m', '5m', '1h', '1d'] as Timeframe[]).map((tf) => (
            <Button
              key={tf}
              onClick={() => setTimeframe(tf)}
              variant={timeframe === tf ? 'contained' : 'outlined'}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <ReactECharts
        option={getChartOption()}
        style={{ height: '400px', width: '100%' }}
      />
    </Box>
  );
};

export default CandleChart;