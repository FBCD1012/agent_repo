# Git 工作流自动化使用指南

## 快速开始

### 1. 初始化设置

```bash
# 进入脚本目录
cd .specify/scripts/bash

# 初始化 Git 仓库和配置
./git-workflow.sh setup

# 登录 GitHub CLI（如果未登录）
gh auth login
```

### 2. 基本使用

```bash
# 提交变更
./git-workflow.sh commit "feat: 添加新功能"

# 推送到远程
./git-workflow.sh push

# 拉取远程更新
./git-workflow.sh pull

# 同步（拉取 + 推送）
./git-workflow.sh sync

# 创建 PR
./git-workflow.sh pr

# 查看状态
./git-workflow.sh status
```

## 详细命令说明

### commit - 自动提交

自动暂存所有变更并提交。

```bash
# 使用自定义消息
./git-workflow.sh commit "feat(quantitative): 添加实时数据展示"

# 自动生成消息
./git-workflow.sh commit

# 预览模式
./git-workflow.sh commit --dry-run
```

### push - 自动推送

推送当前分支到远程仓库。

```bash
# 普通推送
./git-workflow.sh push

# 强制推送（谨慎使用）
./git-workflow.sh push --force

# 详细输出
./git-workflow.sh push --verbose
```

**特性**：
- 自动检测冲突
- 失败自动重试（最多3次）
- 保护主分支不被强制推送

### pull - 自动拉取

从远程仓库拉取更新。

```bash
# 普通拉取（merge）
./git-workflow.sh pull

# 使用 rebase
./git-workflow.sh pull --rebase

# 自动保存未提交变更
./git-workflow.sh pull
```

**特性**：
- 自动保存未提交变更到 stash
- 支持 merge 和 rebase 两种策略
- 拉取后自动恢复 stash

### sync - 自动同步

先拉取再推送，确保本地和远程同步。

```bash
# 完整同步
./git-workflow.sh sync

# 预览模式
./git-workflow.sh sync --dry-run
```

### pr - 创建 Pull Request

自动创建 PR 并可选自动合并。

```bash
# 创建 PR（使用默认标题和描述）
./git-workflow.sh pr

# 自定义标题和描述
./git-workflow.sh pr --title "我的 PR" --body "详细描述"

# 自动合并（如果通过检查）
./git-workflow.sh pr --auto-merge
```

**PR 描述自动包含**：
- 功能概述
- 变更列表
- 变更文件
- 测试检查清单

## 配置说明

配置文件：`.specify/scripts/bash/git-workflow-config.json`

### 主要配置项

```json
{
  "repository": {
    "url": "https://github.com/FBCD1012/agent_repo.git",
    "remote": "origin",
    "mainBranch": "main",
    "developBranch": "develop"
  },
  "pr": {
    "autoCreate": true,
    "autoMerge": false,
    "requireReview": true
  },
  "sync": {
    "conflictStrategy": "rebase",
    "maxRetries": 3
  }
}
```

## 工作流示例

### 开发新功能

```bash
# 1. 创建功能分支（使用项目规范脚本）
.specify/scripts/bash/create-new-feature.sh "添加量化页面"

# 2. 开发代码...

# 3. 提交变更
./git-workflow.sh commit "feat(quantitative): 实现实时数据展示"

# 4. 推送并创建 PR
./git-workflow.sh push
./git-workflow.sh pr

# 5. 等待审查和合并...
```

### 持续重构

```bash
# 1. 创建重构分支
git checkout -b refactor/001-improve-data-service

# 2. 小步重构并提交
./git-workflow.sh commit "refactor: 优化数据服务结构"
./git-workflow.sh push

# 3. 继续重构...
./git-workflow.sh commit "refactor: 提取公共工具函数"
./git-workflow.sh sync

# 4. 创建 PR
./git-workflow.sh pr --title "refactor: 重构数据服务层"
```

### 日常同步

```bash
# 每天早上同步一次
./git-workflow.sh sync

# 或设置定时任务（crontab）
# 0 9 * * * cd /path/to/project && .specify/scripts/bash/git-workflow.sh sync
```

## 高级功能

### 备份和回滚

```bash
# 创建备份分支
.specify/scripts/bash/git-backup-branch.sh

# 回滚到指定提交
.specify/scripts/bash/git-rollback.sh [commit-hash]
```

### 批量操作

```bash
# 批量提交多个文件
git add file1 file2 file3
./git-workflow.sh commit "feat: 批量更新"

# 批量推送多个分支
for branch in feature-1 feature-2 feature-3; do
  git checkout $branch
  ./git-workflow.sh push
done
```

## 故障排除

### 推送失败

```bash
# 检查远程连接
git remote -v

# 检查权限
gh auth status

# 手动推送查看详细错误
git push origin $(git rev-parse --abbrev-ref HEAD) --verbose
```

### PR 创建失败

```bash
# 确保已安装 GitHub CLI
gh --version

# 检查认证状态
gh auth status

# 手动创建 PR
gh pr create --title "测试" --body "描述"
```

### 冲突处理

```bash
# 拉取时出现冲突
./git-workflow.sh pull

# 手动解决冲突后
git add .
git commit -m "fix: 解决合并冲突"

# 继续推送
./git-workflow.sh push
```

## 最佳实践

1. **频繁提交**：小步快跑，频繁提交小变更
2. **清晰消息**：使用规范的提交消息格式
3. **及时同步**：每天至少同步一次
4. **分支管理**：功能完成后及时创建 PR
5. **代码审查**：PR 创建后等待审查，不要急于合并

## 相关文档

- [Git 工作流宪法](../memory/git-workflow-constitution.md)
- [项目规范](../templates/spec-template.md)

