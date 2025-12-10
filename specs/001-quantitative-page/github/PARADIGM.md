# Git 自动化工作流范式（精简版）

## 📋 核心原则（3条）

1. **自动化优先**：所有 Git 操作通过脚本执行
2. **分支命名**：`[编号]-[功能名]` 格式
3. **提交规范**：`[类型]([范围]): [描述]`

## 🚀 工作流（4步）

```bash
./git-workflow.sh commit "feat: 功能描述"
./git-workflow.sh push
./git-workflow.sh pr
./git-workflow.sh sync  # 可选
```

## ⚙️ 配置（精简）

**配置文件**: `git-workflow-config.json`

```json
{
  "repository": {
    "url": "https://github.com/FBCD1012/agent_repo.git",
    "remote": "origin",
    "mainBranch": "main"
  },
  "pr": {
    "autoCreate": true,
    "autoMerge": false
  },
  "sync": {
    "conflictStrategy": "rebase",
    "maxRetries": 3
  }
}
```

## 📝 提交类型

- `feat`: 新功能
- `fix`: 修复
- `refactor`: 重构
- `docs`: 文档
- `chore`: 其他

## 🔒 安全规则

- ❌ 禁止强制推送到 `main` 分支
- ✅ GitHub Token 安全存储
- ✅ 操作日志记录

## 📦 脚本清单

| 脚本 | 功能 | 必需 |
|------|------|------|
| `git-workflow.sh` | 主入口 | ✅ |
| `git-auto-commit.sh` | 提交 | ✅ |
| `git-auto-push.sh` | 推送 | ✅ |
| `git-auto-pr.sh` | 创建 PR | ✅ |
| `git-auto-pull.sh` | 拉取 | ⚪ |
| `git-auto-sync.sh` | 同步 | ⚪ |

## 🎯 快速开始

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

## 📚 完整文档

- **范式**: `PARADIGM.md`（本文档）
- **宪法**: `git-workflow-constitution.md`
- **使用指南**: `GIT_WORKFLOW_README.md`

---

**版本**: 1.0.0 | **创建**: 2025-01-27

