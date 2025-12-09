# 任务清单: 量化页面系统

本清单用于跟踪“量化页面系统”开发的每个子任务。

- [ ] **1. 环境搭建**:
  - [ ] 1.1. 使用 Vite 初始化 React + TypeScript 项目 `quantitative-platform`。
  - [ ] 1.2. 安装项目依赖 (`@mui/material`, `@emotion/react`, `@emotion/styled`, `echarts-for-react`)。

- [ ] **2. 核心功能开发**:
  - [ ] 2.1. 创建主应用布局（例如，包含顶部导航和内容区域的仪表盘）。
  - [ ] 2.2. **(P1)** 实现 `MarketData` 组件，用于展示实时交易数据卡片。
  - [ ] 2.3. **(P1)** 使用 `setInterval` 模拟实时数据流，并连接到 `MarketData` 组件。
  - [ ] 2.4. **(P2)** 实现 `CandleChart` 组件，集成 ECharts 并配置基础K线图。
  - [ ] 2.5. **(P2)** 创建模拟服务，为 `CandleChart` 提供不同时间周期的历史数据。
  - [ ] 2.6. **(P3)** 实现 `Positions` 组件，使用 MUI 表格展示持仓信息。
  - [ ] 2.7. **(P3)** 创建并连接 `Positions` 组件所需的模拟持仓数据。

- [ ] **3. 整合与收尾**:
  - [ ] 3.1. 将所有独立组件 (`MarketData`, `CandleChart`, `Positions`) 整合到统一的仪表盘页面。
  - [ ] 3.2. 编写项目 `README.md`，提供启动和构建说明。
  - [ ] 3.3. 最终验证：确保应用能成功运行 (`npm run dev`) 且功能符合 `spec.md` 定义。
