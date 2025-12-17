import React, { memo, useMemo } from 'react';
import { Box, ButtonGroup, Button } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { CandleData, Timeframe } from '../types';

interface CandleChartProps {
  data: CandleData[];
  symbol?: string;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  loading?: boolean;
}

const CandleChart: React.FC<CandleChartProps> = ({
  data,
  symbol = 'BTC/USDT',
  timeframe,
  onTimeframeChange,
}) => {

  const chartOption = useMemo(() => {
    const klineData = data.map(item => [
      item.timestamp,
      item.open,
      item.close,
      item.low,
      item.high,
    ]);

    const volumeData = data.map(item => [
      item.timestamp,
      item.volume,
      item.close >= item.open ? 1 : -1,
    ]);

    return {
      title: {
        text: `${symbol} - ${timeframe.toUpperCase()}`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: Array<{ data: number[]; seriesName: string }>) => {
          const klineItem = params.find(p => p.seriesName === 'K-line');
          const volumeItem = params.find(p => p.seriesName === 'Volume');
          if (!klineItem) return '';
          const item = klineItem.data;
          const date = new Date(item[0]);
          const volumeValue = volumeItem ? volumeItem.data[1] : 0;
          const formatVolume = (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(2)}K`;
            return v.toFixed(2);
          };
          return `
            <div style="padding: 8px;">
              <strong style="color: #333;">${date.toLocaleString()}</strong><br/>
              <span style="color: #666;">开盘: </span><span style="color: #26a69a;">$${item[1].toFixed(2)}</span><br/>
              <span style="color: #666;">收盘: </span><span style="color: ${item[2] >= item[1] ? '#26a69a' : '#ef5350'};">$${item[2].toFixed(2)}</span><br/>
              <span style="color: #666;">最低: </span><span style="color: #ef5350;">$${item[3].toFixed(2)}</span><br/>
              <span style="color: #666;">最高: </span><span style="color: #26a69a;">$${item[4].toFixed(2)}</span><br/>
              <span style="color: #666;">成交量: </span><span style="color: #1976d2;">${formatVolume(volumeValue)}</span>
            </div>
          `;
        },
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
      },
      grid: [
        {
          left: '10%',
          right: '10%',
          top: '10%',
          height: '55%',
        },
        {
          left: '10%',
          right: '10%',
          top: '72%',
          height: '15%',
        },
      ],
      xAxis: [
        {
          type: 'time',
          splitLine: { show: false },
          axisLabel: {
            show: false,
          },
          gridIndex: 0,
        },
        {
          type: 'time',
          splitLine: { show: false },
          axisLabel: {
            formatter: (value: number) => {
              const date = new Date(value);
              return date.toLocaleTimeString();
            },
          },
          gridIndex: 1,
        },
      ],
      yAxis: [
        {
          type: 'value',
          scale: true,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f0f0f0',
            },
          },
          axisLabel: {
            formatter: (value: number) => `$${value.toFixed(0)}`,
          },
          gridIndex: 0,
        },
        {
          type: 'value',
          scale: true,
          splitLine: { show: false },
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toFixed(0);
            },
          },
          gridIndex: 1,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 70,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          xAxisIndex: [0, 1],
          top: '92%',
          start: 70,
          end: 100,
          height: 20,
          borderColor: '#ccc',
        },
      ],
      series: [
        {
          name: 'K-line',
          type: 'candlestick',
          data: klineData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#26a69a',
            color0: '#ef5350',
            borderColor: '#26a69a',
            borderColor0: '#ef5350',
          },
        },
        {
          name: 'Volume',
          type: 'bar',
          data: volumeData.map(item => ({
            value: [item[0], item[1]],
            itemStyle: {
              color: item[2] === 1 ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
            },
          })),
          xAxisIndex: 1,
          yAxisIndex: 1,
        },
      ],
    };
  }, [data, symbol, timeframe]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {(['1m', '5m', '1h', '1d'] as Timeframe[]).map((tf) => (
            <Button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              variant={timeframe === tf ? 'contained' : 'outlined'}
              sx={{
                minWidth: 40,
                fontSize: '0.75rem',
              }}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ReactECharts
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </Box>
    </Box>
  );
};

export default memo(CandleChart);
