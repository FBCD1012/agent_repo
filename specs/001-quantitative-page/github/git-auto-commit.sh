#!/usr/bin/env bash

# 自动提交脚本
# 用法: ./git-auto-commit.sh [提交消息] [--dry-run] [--verbose]

set -e

# 加载配置
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/git-workflow-config.json"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/../../.." && pwd)")"

# 解析参数
COMMIT_MESSAGE=""
DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      echo "用法: $0 [提交消息] [选项]"
      echo ""
      echo "选项:"
      echo "  --dry-run    仅显示将要执行的操作，不实际执行"
      echo "  --verbose    显示详细输出"
      echo "  --help       显示此帮助信息"
      exit 0
      ;;
    *)
      COMMIT_MESSAGE="$1"
      shift
      ;;
  esac
done

# 加载配置
if [[ -f "$CONFIG_FILE" ]]; then
  AUTO_STAGE=$(jq -r '.commits.autoStageAll' "$CONFIG_FILE" 2>/dev/null || echo "true")
else
  AUTO_STAGE=true
fi

# 检查是否有变更
if [[ -z "$(git status --porcelain)" ]]; then
  echo "没有需要提交的变更"
  exit 0
fi

# 显示变更
if [[ "$VERBOSE" == "true" ]]; then
  echo "=== 待提交的变更 ==="
  git status --short
  echo ""
fi

# 自动暂存
if [[ "$AUTO_STAGE" == "true" ]]; then
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] git add -A"
  else
    git add -A
    [[ "$VERBOSE" == "true" ]] && echo "✓ 已暂存所有变更"
  fi
fi

# 生成提交消息
if [[ -z "$COMMIT_MESSAGE" ]]; then
  # 从变更生成默认消息
  CHANGED_FILES=$(git diff --cached --name-only | head -5 | tr '\n' ',' | sed 's/,$//')
  COMMIT_MESSAGE="chore: 自动提交变更

变更文件: $CHANGED_FILES"
fi

# 提交
if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY RUN] git commit -m \"$COMMIT_MESSAGE\""
else
  git commit -m "$COMMIT_MESSAGE"
  [[ "$VERBOSE" == "true" ]] && echo "✓ 已提交: $COMMIT_MESSAGE"
fi

echo "提交完成"

