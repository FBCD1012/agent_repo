#!/usr/bin/env bash

# 自动拉取脚本
# 用法: ./git-auto-pull.sh [--dry-run] [--verbose] [--rebase]

set -e

# 加载配置
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/git-workflow-config.json"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/../../.." && pwd)")"

# 解析参数
DRY_RUN=false
VERBOSE=false
USE_REBASE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      set -x
      shift
      ;;
    --rebase)
      USE_REBASE=true
      shift
      ;;
    --help|-h)
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --dry-run    仅显示将要执行的操作"
      echo "  --verbose    显示详细输出"
      echo "  --rebase     使用 rebase 而不是 merge"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

# 加载配置
if [[ -f "$CONFIG_FILE" ]]; then
  REMOTE=$(jq -r '.repository.remote' "$CONFIG_FILE" 2>/dev/null || echo "origin")
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  CONFLICT_STRATEGY=$(jq -r '.sync.conflictStrategy' "$CONFIG_FILE" 2>/dev/null || echo "rebase")
else
  REMOTE="origin"
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  CONFLICT_STRATEGY="rebase"
fi

# 如果没有指定 --rebase，使用配置的策略
if [[ "$USE_REBASE" == "false" ]]; then
  USE_REBASE=false
  [[ "$CONFLICT_STRATEGY" == "rebase" ]] && USE_REBASE=true
fi

# 检查是否有未提交的变更
if [[ -n "$(git status --porcelain)" ]]; then
  echo "警告: 有未提交的变更，正在保存..."
  
  # 创建备份分支
  BACKUP_BRANCH="backup/$(date +%Y%m%d-%H%M%S)-before-pull"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] git branch $BACKUP_BRANCH"
    echo "[DRY RUN] git stash"
  else
    git branch "$BACKUP_BRANCH" 2>/dev/null || true
    git stash push -m "Auto-stash before pull $(date +%Y-%m-%d\ %H:%M:%S)"
    [[ "$VERBOSE" == "true" ]] && echo "✓ 已保存变更到 stash"
  fi
fi

# 获取远程更新
if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY RUN] git fetch $REMOTE"
else
  git fetch "$REMOTE"
  [[ "$VERBOSE" == "true" ]] && echo "✓ 已获取远程更新"
fi

# 检查远程分支是否存在
if ! git ls-remote --heads "$REMOTE" "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
  echo "信息: 远程分支 $REMOTE/$CURRENT_BRANCH 不存在"
  exit 0
fi

# 拉取更新
if [[ "$USE_REBASE" == "true" ]]; then
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] git pull --rebase $REMOTE $CURRENT_BRANCH"
  else
    if git pull --rebase "$REMOTE" "$CURRENT_BRANCH"; then
      [[ "$VERBOSE" == "true" ]] && echo "✓ Rebase 成功"
    else
      echo "错误: Rebase 失败，存在冲突"
      echo "请手动解决冲突后运行: git rebase --continue"
      exit 1
    fi
  fi
else
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] git pull $REMOTE $CURRENT_BRANCH"
  else
    if git pull "$REMOTE" "$CURRENT_BRANCH"; then
      [[ "$VERBOSE" == "true" ]] && echo "✓ Merge 成功"
    else
      echo "错误: Merge 失败，存在冲突"
      echo "请手动解决冲突后运行: git commit"
      exit 1
    fi
  fi
fi

# 恢复 stash
if [[ -n "$(git stash list)" ]] && [[ "$DRY_RUN" != "true" ]]; then
  if git stash pop; then
    [[ "$VERBOSE" == "true" ]] && echo "✓ 已恢复暂存的变更"
  else
    echo "警告: 恢复 stash 时出现冲突"
    echo "请手动解决冲突"
  fi
fi

echo "拉取完成"

