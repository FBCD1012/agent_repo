import type { IndicatorDoc, IndicatorCategory } from '../types';

// 指标数据库 - 根据spec.md要求包含各类常见指标
const INDICATORS_DATABASE: IndicatorDoc[] = [
  // 趋势/均线类
  {
    id: 'ma',
    name: 'MA (移动平均线)',
    category: 'trend',
    definition: '移动平均线是最基础的趋势指标，通过计算特定周期内的平均价格来平滑价格波动，帮助识别趋势方向。',
    formula: 'MA = (P1 + P2 + ... + Pn) / n，其中P为价格，n为周期',
    usage: [
      '价格在MA之上：上升趋势',
      '价格在MA之下：下降趋势',
      'MA斜率：趋势强度',
      '多条MA交叉：买卖信号',
    ],
    riskWarning: '在震荡市场中可能产生虚假信号，滞后性较强，不适合精确抄底逃顶。',
    example: 'BTC 20日MA为 $50,000，当前价格 $52,000，表明处于短期上升趋势。',
    tags: ['趋势', '均线', '基础', '滞后'],
  },
  {
    id: 'ema',
    name: 'EMA (指数移动平均线)',
    category: 'trend',
    definition: '指数移动平均线给予近期价格更高权重，比普通MA反应更迅速，适合短期交易。',
    formula: 'EMA = (Close × α) + (Previous EMA × (1 - α))，其中 α = 2/(n+1)',
    usage: [
      '快速反应价格变化',
      '适合短线交易',
      '与MACD配合使用',
      '支撑阻力位参考',
    ],
    riskWarning: '对噪音更敏感，可能产生过多交易信号，需要配合其他指标过滤。',
    example: 'ETH 12日EMA为 $2,800，价格 $2,750，表明短期动能偏弱。',
    tags: ['趋势', '均线', '快速', '短期'],
  },
  {
    id: 'sma',
    name: 'SMA (简单移动平均线)',
    category: 'trend',
    definition: '简单移动平均线是MA的一种，对所有价格点给予相等权重，最为稳定可靠。',
    formula: 'SMA = (P1 + P2 + ... + Pn) / n',
    usage: [
      '长期趋势判断',
      '关键支撑阻力位',
      '机构投资者常用',
      '与EMA组合使用',
    ],
    riskWarning: '反应较慢，可能错过最佳入场时机，不适合快速交易策略。',
    example: 'BNB 50日SMA为 $300，价格 $310，显示中期趋势向好。',
    tags: ['趋势', '均线', '稳定', '长期'],
  },
  {
    id: 'bollinger',
    name: '布林带 (Bollinger Bands)',
    category: 'trend',
    definition: '布林带由中轨(MA)、上轨和下轨组成，能显示价格波动率和相对超买超卖状态。',
    formula: '中轨 = MA(20)，上下轨 = 中轨 ± 2×标准差',
    usage: [
      '价格触及上轨：超买信号',
      '价格触及下轨：超卖信号',
      '带宽收缩：即将突破',
      '价格回归中轨：趋势延续',
    ],
    riskWarning: '强趋势中价格可能持续贴着上下轨运行，不宜单独作为反转信号。',
    example: 'SOL布林带上轨 $110，下轨 $95，价格 $108接近上轨，显示短期超买。',
    tags: ['趋势', '波动率', '超买超卖', '通道'],
  },

  // 动量类
  {
    id: 'macd',
    name: 'MACD (异同移动平均线)',
    category: 'momentum',
    definition: 'MACD通过快速和慢速EMA的差离值来捕捉价格动量变化，是最常用的动量指标。',
    formula: 'MACD = EMA(12) - EMA(26)，信号线 = EMA(MACD, 9)，柱状图 = MACD - 信号线',
    usage: [
      'MACD上穿信号线：买入信号',
      'MACD下穿信号线：卖出信号',
      '柱状图由负转正：动能增强',
      '顶底背离：趋势反转预警',
    ],
    riskWarning: '在震荡市场中可能产生频繁交叉信号，需要结合趋势指标使用。',
    example: 'BTC MACD为正且上升，表明多头动能增强，可考虑逢低买入。',
    tags: ['动量', '趋势', '交叉', '背离'],
  },
  {
    id: 'rsi',
    name: 'RSI (相对强弱指数)',
    category: 'momentum',
    definition: 'RSI测量价格变动的速度和变化幅度，用于识别超买超卖状态和动能强弱。',
    formula: 'RSI = 100 - [100 / (1 + RS)]，其中 RS = N日内上涨幅度平均值 / N日内下跌幅度平均值',
    usage: [
      'RSI > 70：超买区域',
      'RSI < 30：超卖区域',
      'RSI背离：价格新高/新低但RSI未确认',
      'RSI = 50：多空平衡线',
    ],
    riskWarning: '强趋势中RSI可能长期处于超买超卖区域，不宜单独作为反转信号。',
    example: 'ETH RSI为75，处于超买区域，需警惕短期回调风险。',
    tags: ['动量', '超买超卖', '震荡', '背离'],
  },
  {
    id: 'kdj',
    name: 'KDJ (随机指标)',
    category: 'momentum',
    definition: 'KDJ通过计算最高价、最低价和收盘价之间的关系，反映价格在近期波动范围中的相对位置。',
    formula: 'RSV = (Close - Lowest) / (Highest - Lowest) × 100，K = SMA(RSV, 3)，D = SMA(K, 3)，J = 3K - 2D',
    usage: [
      'K > 80：超买',
      'K < 20：超卖',
      'K线上穿D线：买入',
      'K线下穿D线：卖出',
    ],
    riskWarning: '对价格变化极为敏感，可能产生过多交易信号，需要过滤机制。',
    example: 'BNB K值85，处于超买，D值70开始走平，显示上涨动能减弱。',
    tags: ['动量', '超买超卖', '快速', '短期'],
  },

  // 成交类
  {
    id: 'volume',
    name: '成交量 (Volume)',
    category: 'volume',
    definition: '成交量反映市场参与度和资金流向，是验证价格走势真实性的重要指标。',
    formula: 'Volume = 特定时间段内的交易数量（币或合约）',
    usage: [
      '价涨量增：上涨趋势确认',
      '价跌量增：下跌趋势确认',
      '价涨量缩：上涨乏力',
      '价跌量缩：下跌趋缓',
    ],
    riskWarning: '成交量可能被操纵，需要结合价格形态和其他指标综合判断。',
    example: 'BTC突破$50,000时成交量放大2倍，显示突破有效性较高。',
    tags: ['成交', '确认', '资金', '基础'],
  },
  {
    id: 'obv',
    name: 'OBV (能量潮)',
    category: 'volume',
    definition: 'OBV将成交量转化为价格走势的领先指标，通过成交量的累积变化预测价格方向。',
    formula: 'OBV = 前日OBV + 当日成交量（上涨）或 - 当日成交量（下跌）',
    usage: [
      'OBV创新高：价格可能跟涨',
      'OBV创新低：价格可能跟跌',
      'OBV背离：价格趋势可能反转',
      'OBV横盘：积蓄能量',
    ],
    riskWarning: '在假突破或操纵行情中可能产生误导信号，需要谨慎验证。',
    example: 'SOL价格创新高但OBV未确认，显示上涨动能减弱，需警惕回调。',
    tags: ['成交', '能量', '领先', '背离'],
  },
  {
    id: 'vwap',
    name: 'VWAP (成交量加权平均价)',
    category: 'volume',
    definition: 'VWAP是成交量加权的平均价格，反映当日市场参与者的平均持仓成本。',
    formula: 'VWAP = Σ(Price × Volume) / Σ(Volume)',
    usage: [
      '价格在VWAP之上：多头优势',
      '价格在VWAP之下：空头优势',
      'VWAP作为支撑阻力位',
      '机构交易参考基准',
    ],
    riskWarning: 'VWAP是滞后指标，反映的是已发生的成交情况，不具有预测功能。',
    example: 'ETH当日VWAP为$2,750，当前价格$2,780，显示多头略占优势。',
    tags: ['成交', '均价', '成本', '机构'],
  },

  // 波动/风险类
  {
    id: 'atr',
    name: 'ATR (平均真实波幅)',
    category: 'volatility',
    definition: 'ATR测量市场波动率，反映价格的平均变动幅度，常用于设置止损和仓位管理。',
    formula: 'ATR = TR的N日移动平均，其中TR = max(High-Low, |High-Close|, |Low-Close|)',
    usage: [
      'ATR上升：波动率增加',
      'ATR下降：波动率减少',
      'ATR × 2：止损距离参考',
      'ATR比较：不同品种风险对比',
    ],
    riskWarning: 'ATR只反映波动幅度，不指示方向，需要结合趋势指标使用。',
    example: 'BTC ATR为$1,500，建议止损设置在入场价下方$1,500处。',
    tags: ['波动率', '风险', '止损', '仓位'],
  },
  {
    id: 'volatility',
    name: '波动率 (Volatility)',
    category: 'volatility',
    definition: '波动率衡量价格变动的剧烈程度，是风险评估和期权定价的核心参数。',
    formula: '波动率 = 价格收益率的标准差 × √(年化周期数)',
    usage: [
      '高波动率：高风险高收益',
      '低波动率：低风险低收益',
      '波动率均值回归： extremes不可持续',
      '隐含波动率：市场预期',
    ],
    riskWarning: '波动率会突然变化，历史波动率不能完全预测未来波动情况。',
    example: 'SOL年化波动率120%，属于高风险品种，需要谨慎仓位管理。',
    tags: ['波动率', '风险', '收益', '期权'],
  },
  {
    id: 'max-drawdown',
    name: '最大回撤 (Maximum Drawdown)',
    category: 'volatility',
    definition: '最大回撤衡量从历史高点到后续低点的最大跌幅，是评估策略风险的重要指标。',
    formula: '最大回撤 = (Peak - Trough) / Peak',
    usage: [
      '评估策略风险承受能力',
      '设置风控止损参考',
      '产品风险等级分类',
      '投资者风险匹配',
    ],
    riskWarning: '回撤是后视镜指标，不能预测未来最大损失，但能反映策略风险特征。',
    example: '某策略最大回撤25%，适合风险承受能力较强的投资者。',
    tags: ['风险', '回撤', '风控', '评估'],
  },
  {
    id: 'sharpe',
    name: '夏普比率 (Sharpe Ratio)',
    category: 'volatility',
    definition: '夏普比率衡量承担每单位风险所获得的超额收益，是评估投资绩效的核心指标。',
    formula: '夏普比率 = (组合收益率 - 无风险收益率) / 组合标准差',
    usage: [
      '评估风险调整后收益',
      '比较不同策略表现',
      '投资组合优化',
      '绩效评估基准',
    ],
    riskWarning: '夏普比率假设收益服从正态分布，在极端市场中可能失真。',
    example: '策略年化收益30%，波动率20%，无风险利率2%，夏普比率1.4表现优秀。',
    tags: ['风险', '收益', '绩效', '评估'],
  },

  // 形态/跟踪类
  {
    id: 'sar',
    name: 'SAR (抛物线指标)',
    category: 'pattern',
    definition: 'SAR是趋势跟踪指标，通过抛物线计算止损位，帮助投资者跟踪趋势并管理风险。',
    formula: 'SAR = 前日SAR + AF × (EP - 前日SAR)，其中AF为加速因子',
    usage: [
      '价格在SAR之上：持有多头',
      '价格在SAR之下：持有空头',
      'SAR转向：趋势可能反转',
      '动态止损位设置',
    ],
    riskWarning: '在震荡市场中SAR可能频繁转向，产生过多交易信号和损失。',
    example: 'BTC价格$52,000，SAR$50,500，显示多头趋势，止损可设在$50,500。',
    tags: ['趋势', '跟踪', '止损', '反转'],
  },
  {
    id: 'adx',
    name: 'ADX (平均趋向指数)',
    category: 'pattern',
    definition: 'ADX衡量趋势强度但不指示方向，帮助识别市场是否有明确的趋势。',
    formula: 'ADX = DX的N日平滑平均，其中DX = |DI+ - DI-| / (DI+ + DI-) × 100',
    usage: [
      'ADX > 25：趋势明显',
      'ADX < 20：震荡市场',
      'ADX上升：趋势增强',
      'ADX下降：趋势减弱',
    ],
    riskWarning: 'ADX只反映趋势强度，不指示方向，需要配合DI+DI-判断方向。',
    example: 'ETH ADX为35，显示趋势明显，需结合其他指标判断多空方向。',
    tags: ['趋势', '强度', '方向', '震荡'],
  },
  {
    id: 'ichimoku',
    name: '一目均衡表 (Ichimoku Cloud)',
    category: 'pattern',
    definition: '一目均衡表是日本技术分析工具，通过多条线提供支撑阻力、趋势方向和交易信号。',
    formula: '转换线 = 9日最高最低平均，基准线 = 26日最高最低平均，先行带A/B = 基准线±转换线平均',
    usage: [
      '价格在云之上：多头趋势',
      '价格在云之下：空头趋势',
      '云层厚度：支撑阻力强度',
      '转换线上穿基准线：买入信号',
    ],
    riskWarning: '指标较为复杂，需要充分学习和实践才能正确使用。',
    example: 'BTC价格在云层之上且云层向上，显示中期多头趋势确立。',
    tags: ['趋势', '综合', '日本', '复杂'],
  },
];

class IndicatorDocsService {
  private readonly indicators = INDICATORS_DATABASE;

  public getAllIndicators(): IndicatorDoc[] {
    return [...this.indicators];
  }

  public getIndicatorById(id: string): IndicatorDoc | null {
    return this.indicators.find(indicator => indicator.id === id) || null;
  }

  public getIndicatorsByCategory(category: IndicatorCategory): IndicatorDoc[] {
    return this.indicators.filter(indicator => indicator.category === category);
  }

  public searchIndicators(query: string): IndicatorDoc[] {
    const lowercaseQuery = query.toLowerCase();
    return this.indicators.filter(indicator =>
      indicator.name.toLowerCase().includes(lowercaseQuery) ||
      indicator.definition.toLowerCase().includes(lowercaseQuery) ||
      indicator.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)),
    );
  }

  public getCategories(): { value: IndicatorCategory; label: string; count: number }[] {
    const categoryMap = new Map<IndicatorCategory, { label: string; count: number }>();

    // 初始化分类
    categoryMap.set('trend', { label: '趋势/均线类', count: 0 });
    categoryMap.set('momentum', { label: '动量类', count: 0 });
    categoryMap.set('volume', { label: '成交类', count: 0 });
    categoryMap.set('volatility', { label: '波动/风险类', count: 0 });
    categoryMap.set('pattern', { label: '形态/跟踪类', count: 0 });

    // 统计数量
    this.indicators.forEach(indicator => {
      const category = categoryMap.get(indicator.category);
      if (category) {
        category.count++;
      }
    });

    return Array.from(categoryMap.entries()).map(([value, { label, count }]) => ({
      value,
      label,
      count,
    }));
  }

  public getPopularIndicators(limit: number = 6): IndicatorDoc[] {
    // 根据基础性和常用程度排序
    const popularIds = ['ma', 'ema', 'macd', 'rsi', 'volume', 'bollinger'];
    return popularIds
      .map(id => this.getIndicatorById(id))
      .filter((indicator): indicator is IndicatorDoc => indicator !== null)
      .slice(0, limit);
  }
}

export const indicatorDocsService = new IndicatorDocsService();
