# Git 自动化工作流系统总结

## 📋 系统概述

已为您创建了一套完整的 Git 自动化工作流系统，包括：

1. **宪法文件**：定义工作流规则和原则
2. **配置文件**：JSON 格式的配置管理
3. **自动化脚本**：8个核心脚本实现所有功能
4. **使用文档**：详细的使用指南

## 📁 文件结构

```
.specify/
├── memory/
│   ├── git-workflow-constitution.md    # Git 工作流宪法
│   └── GIT_AUTOMATION_SUMMARY.md       # 本文档
└── scripts/
    └── bash/
        ├── git-workflow-config.json    # 配置文件
        ├── git-workflow.sh             # 主工作流脚本
        ├── git-auto-commit.sh          # 自动提交
        ├── git-auto-push.sh            # 自动推送
        ├── git-auto-pull.sh            # 自动拉取
        ├── git-auto-pr.sh              # 自动创建 PR
        ├── git-auto-sync.sh            # 自动同步
        └── GIT_WORKFLOW_README.md      # 使用文档
```

## 🚀 快速开始

### 1. 初始化

```bash
cd /Users/dongqing/FBCD
.specify/scripts/bash/git-workflow.sh setup
```

### 2. 配置 GitHub Token

```bash
gh auth login
```

### 3. 测试工作流

```bash
# 查看状态
.specify/scripts/bash/git-workflow.sh status

# 提交变更
.specify/scripts/bash/git-workflow.sh commit "feat: 测试自动化工作流"

# 推送
.specify/scripts/bash/git-workflow.sh push

# 创建 PR
.specify/scripts/bash/git-workflow.sh pr
```

## 📖 核心功能

### ✅ 已实现功能

1. **自动提交**
   - 自动暂存所有变更
   - 支持自定义提交消息
   - 自动生成提交消息

2. **自动推送**
   - 检测冲突
   - 自动重试（最多3次）
   - 保护主分支

3. **自动拉取**
   - 自动保存未提交变更
   - 支持 merge 和 rebase
   - 自动恢复 stash

4. **自动同步**
   - 先拉取再推送
   - 确保本地和远程同步

5. **自动创建 PR**
   - 自动生成标题和描述
   - 包含变更列表和文件
   - 支持自动合并

6. **分支管理**
   - 遵循项目规范的分支命名
   - 自动检测分支类型
   - 支持功能/修复/重构/热修复分支

## 🔧 配置说明

### 仓库配置

配置文件：`.specify/scripts/bash/git-workflow-config.json`

```json
{
  "repository": {
    "url": "https://github.com/FBCD1012/agent_repo.git",
    "remote": "origin",
    "mainBranch": "main",
    "developBranch": "develop"
  }
}
```

### 自定义配置

可以修改配置文件来调整：
- 分支策略
- 提交规范
- PR 行为
- 同步策略
- 安全规则

## 📝 使用示例

### 日常开发流程

```bash
# 1. 开发代码后提交
.specify/scripts/bash/git-workflow.sh commit "feat(quantitative): 添加K线图表"

# 2. 推送
.specify/scripts/bash/git-workflow.sh push

# 3. 创建 PR
.specify/scripts/bash/git-workflow.sh pr

# 4. 等待审查和合并
```

### 持续重构流程

```bash
# 1. 创建重构分支
git checkout -b refactor/001-improve-structure

# 2. 小步重构并提交
.specify/scripts/bash/git-workflow.sh commit "refactor: 提取公共组件"
.specify/scripts/bash/git-workflow.sh push

# 3. 继续重构...
.specify/scripts/bash/git-workflow.sh commit "refactor: 优化数据流"
.specify/scripts/bash/git-workflow.sh sync

# 4. 创建 PR
.specify/scripts/bash/git-workflow.sh pr --title "refactor: 重构项目结构"
```

### 定时同步

可以设置定时任务自动同步：

```bash
# 添加到 crontab
crontab -e

# 每天早上9点同步
0 9 * * * cd /Users/dongqing/FBCD && .specify/scripts/bash/git-workflow.sh sync >> /tmp/git-sync.log 2>&1
```

## 🎯 宪法原则

系统遵循以下核心原则（详见 `git-workflow-constitution.md`）：

1. **自动化优先**：所有操作通过脚本执行
2. **分支策略**：严格的分支命名和管理
3. **提交规范**：规范的提交消息格式
4. **PR 自动化**：自动创建和管理 PR
5. **持续重构**：支持小步快跑的重构流程
6. **同步策略**：智能的上传下载机制
7. **冲突处理**：自动化的冲突解决
8. **备份回滚**：完善的备份和回滚机制

## 🔒 安全特性

- ✅ 保护主分支不被强制推送
- ✅ GitHub Token 安全存储
- ✅ 操作日志记录
- ✅ 备份机制
- ✅ 冲突检测和处理

## 📚 相关文档

- **宪法**：`.specify/memory/git-workflow-constitution.md`
- **使用指南**：`.specify/scripts/bash/GIT_WORKFLOW_README.md`
- **配置文件**：`.specify/scripts/bash/git-workflow-config.json`

## 🛠️ 下一步

1. **初始化仓库**：
   ```bash
   .specify/scripts/bash/git-workflow.sh setup
   ```

2. **配置 GitHub**：
   ```bash
   gh auth login
   ```

3. **测试工作流**：
   ```bash
   .specify/scripts/bash/git-workflow.sh status
   ```

4. **开始使用**：
   ```bash
   .specify/scripts/bash/git-workflow.sh commit "feat: 初始化项目"
   .specify/scripts/bash/git-workflow.sh push
   .specify/scripts/bash/git-workflow.sh pr
   ```

## 💡 提示

- 所有脚本都支持 `--dry-run` 预览模式
- 使用 `--verbose` 查看详细输出
- 使用 `--help` 查看帮助信息
- 配置文件可以根据需要自定义

---

**创建时间**: 2025-01-27  
**版本**: 1.0.0  
**仓库**: https://github.com/FBCD1012/agent_repo.git

