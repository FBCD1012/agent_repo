# 项目开发指南

自动从所有功能计划生成。最后更新: 2025-01-27

## 🔥 命令执行策略（重要）

**所有命令必须自动执行，包括处理交互式提示！不允许等待用户输入！**

### ⚠️ IDE 安全机制说明

**注意**：Cursor IDE 会询问是否允许执行外部命令（如 `npm`），这是 IDE 层面的安全控制。

**解决方案**：当提示 `Allow execution of: 'npm'?` 时，选择 **"Yes, allow always"** 即可永久授权。授权后，所有 npm 命令都会自动执行，不再询问。

详见 `opencode@AI_AUTO_EXECUTION_SETUP.md` 文件。

### 自动执行的命令

以下命令应该**直接执行**，不需要询问：

- ✅ `mkdir` - 创建目录
- ✅ `touch`, `cp`, `mv` - 文件操作
- ✅ `git add`, `git commit -m "..."` - Git操作（必须使用 -m）
- ✅ `npm install`, `npm run` - 包管理
- ✅ 创建项目结构和配置文件
- ✅ 运行测试和构建命令

### 需要询问的命令

只有以下命令需要询问：

- ❌ `rm -rf` - 递归删除
- ❌ `git push --force` - 强制推送
- ❌ `sudo` - 系统级操作

### 🔥 交互式命令自动处理（关键规则）

#### npm create vite 命令

**必须**自动处理所有交互式提示：

```bash
# 方法1（推荐）: 使用 echo 管道自动回答
echo "n" | npm create vite@latest quantitative-platform -- --template react-ts

# 方法2: 明确指定所有参数（如果支持）
npm create vite@latest quantitative-platform -- --template react-ts

# 方法3: 设置 CI 环境变量
CI=true npm create vite@latest quantitative-platform -- --template react-ts
```

**禁止**: 执行命令后等待用户回答交互式提示！

#### 通用交互式命令处理

1. **自动选择默认选项**: Yes/No 提示 → 默认选择 No 或更安全的选项
2. **使用管道输入**: `echo "answer" | command` 或 `printf "answer\n" | command`
3. **使用环境变量**: `CI=true command` 或 `DEBIAN_FRONTEND=noninteractive command`
4. **使用非交互式标志**: `--yes`, `-y`, `--no-interaction`, `--force`

#### 常见命令处理示例

| 命令 | 自动处理方法 |
|------|------------|
| `npm create vite` | `echo "n" \| npm create vite@latest ... -- --template react-ts` |
| `git commit` | `git commit -m "message"` (必须使用 -m，避免编辑器) |
| `npm install` | `npm install` (通常不需要交互) |
| 交互式安装 | `DEBIAN_FRONTEND=noninteractive command` |

### 执行原则

1. **默认自动执行**: 安全命令直接执行
2. **自动处理交互**: 所有交互式提示必须自动回答
3. **使用非交互式标志**: 优先使用命令的非交互式选项
4. **使用管道**: 如果必须交互，使用 echo/printf 管道输入
5. **绝不等待**: 如果命令必须交互且无法绕过，报告错误并建议手动执行

## 项目结构

```text
specs/
├── [###-feature-name]/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
```

## 工作流

根据 `.specify/` 目录下的规范：

1. 读取 `spec.md` 了解需求
2. 自动创建项目结构
3. **自动执行所有必要的命令（包括处理交互）**
4. 无需询问确认（除非是破坏性操作）

## 当前功能

**量化页面系统** (`specs/001-quantitative-page/spec.md`)

- 实时交易数据展示
- K线图表
- 持仓信息管理

## 技术栈

- 前端: React + TypeScript + Vite
- 图表库: lightweight-charts 或 ECharts
- 后端: Node.js + Express (模拟API)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

