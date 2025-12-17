import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  TrendingUp,
  ShowChart,
  BarChart,
  Timeline,
  Timeline as TimelineIcon,
  ArrowBack,
  HelpOutline,
} from '@mui/icons-material';
import type { IndicatorDoc, IndicatorCategory } from '../types';
import { indicatorDocsService } from '../services/indicatorDocsService';

interface IndicatorDocsProps {
  readonly onBack?: () => void;
}

const IndicatorDocs: React.FC<IndicatorDocsProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'all'>('all');
  const [expandedIndicator, setExpandedIndicator] = useState<string | false>(false);

  const allIndicators = useMemo(() => indicatorDocsService.getAllIndicators(), []);
  const categories = useMemo(() => indicatorDocsService.getCategories(), []);
  const popularIndicators = useMemo(() => indicatorDocsService.getPopularIndicators(), []);

  const filteredIndicators = useMemo(() => {
    let filtered = allIndicators;

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(indicator => indicator.category === selectedCategory);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      filtered = indicatorDocsService.searchIndicators(searchQuery).filter(indicator =>
        selectedCategory === 'all' || indicator.category === selectedCategory,
      );
    }

    return filtered;
  }, [allIndicators, selectedCategory, searchQuery]);

  const handleAccordionChange = (indicatorId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedIndicator(isExpanded ? indicatorId : false);
  };

  const getCategoryIcon = (category: IndicatorCategory) => {
    switch (category) {
      case 'trend':
        return <TrendingUp color="primary" />;
      case 'momentum':
        return <ShowChart color="secondary" />;
      case 'volume':
        return <BarChart color="success" />;
      case 'volatility':
        return <Timeline color="warning" />;
      case 'pattern':
        return <TimelineIcon color="info" />;
      default:
        return <HelpOutline />;
    }
  };

  const getCategoryColor = (category: IndicatorCategory) => {
    switch (category) {
      case 'trend':
        return 'primary';
      case 'momentum':
        return 'secondary';
      case 'volume':
        return 'success';
      case 'volatility':
        return 'warning';
      case 'pattern':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderIndicatorCard = (indicator: IndicatorDoc) => (
    <Card key={indicator.id} sx={{ mb: 2 }}>
      <Accordion
        expanded={expandedIndicator === indicator.id}
        onChange={handleAccordionChange(indicator.id)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
            {getCategoryIcon(indicator.category)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {indicator.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {indicator.definition.substring(0, 80)}...
              </Typography>
            </Box>
            <Chip
              label={categories.find(c => c.value === indicator.category)?.label || indicator.category}
              color={getCategoryColor(indicator.category) as 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default' | 'error'}
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📖 定义
              </Typography>
              <Typography variant="body2" paragraph>
                {indicator.definition}
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                🧮 计算公式
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {indicator.formula}
              </Paper>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                💡 常见用法
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {indicator.usage.map((usage, index) => (
                  <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                    {usage}
                  </Typography>
                ))}
              </Box>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                ⚠️ 风险提示
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="body2">
                  {indicator.riskWarning}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📊 实例说明
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                {indicator.example}
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {indicator.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* 页面头部 */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📚 技术指标科普
          </Typography>
          <Typography variant="body1" color="text.secondary">
            深入了解常见技术指标的定义、用法和风险，助您成为更专业的交易者
          </Typography>
        </Box>
        {onBack && (
          <Tooltip title="返回主页面">
            <IconButton onClick={onBack} size="large">
              <ArrowBack />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '6 1 0%' } }}>
            <TextField
              fullWidth
              placeholder="搜索指标名称、定义或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '4 1 0%' } }}>
            <FormControl fullWidth>
              <InputLabel>指标分类</InputLabel>
              <Select
                value={selectedCategory}
                label="指标分类"
                onChange={(e) => setSelectedCategory(e.target.value as IndicatorCategory | 'all')}
              >
                <MenuItem value="all">
                  全部分类 ({allIndicators.length})
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 0%' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              找到 {filteredIndicators.length} 个指标
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 热门指标 */}
      {searchQuery === '' && selectedCategory === 'all' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🔥 热门指标
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {popularIndicators.map((indicator) => (
              <Box
                key={indicator.id}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
                }}
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                  onClick={() => setExpandedIndicator(indicator.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      {getCategoryIcon(indicator.category)}
                      <Typography variant="h6" fontWeight="bold">
                        {indicator.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {indicator.definition}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 4 }} />
        </Box>
      )}

      {/* 指标列表 */}
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {searchQuery || selectedCategory !== 'all' ? '🔍 搜索结果' : '📋 全部指标'}
        </Typography>

        {filteredIndicators.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              未找到匹配的指标
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请尝试调整搜索关键词或分类筛选
            </Typography>
          </Paper>
        ) : (
          filteredIndicators.map(renderIndicatorCard)
        )}
      </Box>

      {/* 页面底部提示 */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          💡 <strong>温馨提示</strong>：技术指标是辅助工具，不是水晶球。请结合市场环境、风险管理和交易策略综合判断，切勿单一依赖指标进行交易决策。
        </Typography>
      </Paper>
    </Box>
  );
};

export default IndicatorDocs;
