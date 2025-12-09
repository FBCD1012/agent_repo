#!/usr/bin/env bash

# Git 工作流主脚本
# 用法: ./git-workflow.sh [命令] [选项]

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
  cat << EOF
Git 工作流自动化脚本

用法: $0 [命令] [选项]

命令:
  commit [消息]      自动提交变更
  push               自动推送到远程
  pull               自动拉取远程更新
  sync               同步（拉取 + 推送）
  pr [选项]          创建 Pull Request
  status             显示当前状态
  setup              初始化 Git 仓库和配置

选项:
  --dry-run          仅显示将要执行的操作
  --verbose          显示详细输出
  --help             显示此帮助信息

示例:
  $0 commit "feat: 添加新功能"
  $0 push
  $0 sync
  $0 pr --auto-merge
EOF
}

case "${1:-help}" in
  commit)
    shift
    "$SCRIPT_DIR/git-auto-commit.sh" "$@"
    ;;
  push)
    shift
    "$SCRIPT_DIR/git-auto-push.sh" "$@"
    ;;
  pull)
    shift
    "$SCRIPT_DIR/git-auto-pull.sh" "$@"
    ;;
  sync)
    shift
    "$SCRIPT_DIR/git-auto-sync.sh" "$@"
    ;;
  pr)
    shift
    "$SCRIPT_DIR/git-auto-pr.sh" "$@"
    ;;
  status)
    echo "=== Git 状态 ==="
    git status --short
    echo ""
    echo "=== 分支信息 ==="
    git branch -vv
    echo ""
    echo "=== 待推送提交 ==="
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    REMOTE=$(git remote | head -1 || echo "origin")
    if git ls-remote --heads "$REMOTE" "$CURRENT_BRANCH" >/dev/null 2>&1; then
      git log "$REMOTE/$CURRENT_BRANCH"..HEAD --oneline 2>/dev/null || echo "无待推送提交"
    else
      echo "远程分支不存在，所有提交都需要推送"
    fi
    ;;
  setup)
    echo "=== 初始化 Git 工作流 ==="
    
    # 检查是否在 Git 仓库中
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
      echo "初始化 Git 仓库..."
      git init
    fi
    
    # 检查远程仓库
    CONFIG_FILE="$SCRIPT_DIR/git-workflow-config.json"
    if [[ -f "$CONFIG_FILE" ]]; then
      REMOTE_URL=$(jq -r '.repository.url' "$CONFIG_FILE" 2>/dev/null || echo "")
      REMOTE_NAME=$(jq -r '.repository.remote' "$CONFIG_FILE" 2>/dev/null || echo "origin")
      
      if [[ -n "$REMOTE_URL" ]]; then
        if ! git remote | grep -q "^${REMOTE_NAME}$"; then
          echo "添加远程仓库: $REMOTE_NAME -> $REMOTE_URL"
          git remote add "$REMOTE_NAME" "$REMOTE_URL"
        else
          echo "更新远程仓库 URL..."
          git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
        fi
      fi
    fi
    
    # 检查 GitHub CLI
    if ! command -v gh >/dev/null 2>&1; then
      echo ""
      echo "警告: 未安装 GitHub CLI (gh)"
      echo "安装: brew install gh"
      echo "或访问: https://cli.github.com"
    else
      echo "✓ GitHub CLI 已安装"
    fi
    
    echo ""
    echo "=== 设置完成 ==="
    echo ""
    echo "下一步:"
    echo "1. 配置 GitHub Token: gh auth login"
    echo "2. 检查配置: cat $CONFIG_FILE"
    echo "3. 测试工作流: $0 status"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "错误: 未知命令 '$1'"
    echo ""
    show_help
    exit 1
    ;;
esac

