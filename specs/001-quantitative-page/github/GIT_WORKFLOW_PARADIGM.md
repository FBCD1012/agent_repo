# Git 自动化工作流范式

**版本**: 1.0.0 | **创建日期**: 2025-01-27

## 核心原则（3条）

### 1. 自动化优先
所有 Git 操作通过脚本执行，减少人工错误。

### 2. 分支命名规范
- 功能分支：`[编号]-[功能名]`（如 `001-quantitative-page`）
- 修复分支：`fix/[编号]-[描述]`
- 重构分支：`refactor/[编号]-[描述]`

### 3. 提交消息格式
```
[类型]([范围]): [描述]
```
类型：`feat` | `fix` | `refactor` | `docs` | `chore`

## 工作流（4步）

```bash
# 1. 提交
./git-workflow.sh commit "feat: 添加功能"

# 2. 推送
./git-workflow.sh push

# 3. 创建 PR
./git-workflow.sh pr

# 4. 同步（可选）
./git-workflow.sh sync
```

## 配置

**必需配置**（`git-workflow-config.json`）：
- 仓库 URL
- 主分支名称
- 远程名称

**可选配置**：
- PR 自动合并
- 冲突策略（rebase/merge）
- 重试次数

## 安全规则

- ✅ 禁止强制推送到 `main` 分支
- ✅ GitHub Token 安全存储
- ✅ 操作日志记录

## 脚本清单

| 脚本 | 功能 |
|------|------|
| `git-workflow.sh` | 主入口（统一命令） |
| `git-auto-commit.sh` | 自动提交 |
| `git-auto-push.sh` | 自动推送 |
| `git-auto-pull.sh` | 自动拉取 |
| `git-auto-pr.sh` | 自动创建 PR |
| `git-auto-sync.sh` | 自动同步 |

## 快速开始

```bash
# 1. 初始化
./git-workflow.sh setup

# 2. 登录 GitHub
gh auth login

# 3. 使用
./git-workflow.sh commit "feat: 新功能"
./git-workflow.sh push
./git-workflow.sh pr
```

---

**完整文档**: 见 `GIT_WORKFLOW_README.md`

