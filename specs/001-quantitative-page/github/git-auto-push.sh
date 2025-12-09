#!/usr/bin/env bash

# 自动推送脚本
# 用法: ./git-auto-push.sh [--dry-run] [--verbose] [--force]

set -e

# 加载配置
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/git-workflow-config.json"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/../../.." && pwd)")"

# 解析参数
DRY_RUN=false
VERBOSE=false
FORCE=false
MAX_RETRIES=3

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
    --force|-f)
      FORCE=true
      shift
      ;;
    --help|-h)
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --dry-run    仅显示将要执行的操作"
      echo "  --verbose    显示详细输出"
      echo "  --force      强制推送（谨慎使用）"
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
  MAIN_BRANCH=$(jq -r '.repository.mainBranch' "$CONFIG_FILE" 2>/dev/null || echo "main")
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  MAX_RETRIES=$(jq -r '.sync.maxRetries' "$CONFIG_FILE" 2>/dev/null || echo "3")
  ALLOW_FORCE_PUSH=$(jq -r '.security.allowForcePush' "$CONFIG_FILE" 2>/dev/null || echo "false")
else
  REMOTE="origin"
  MAIN_BRANCH="main"
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  MAX_RETRIES=3
  ALLOW_FORCE_PUSH=false
fi

# 检查受保护分支
if [[ "$CURRENT_BRANCH" == "$MAIN_BRANCH" ]] && [[ "$FORCE" == "true" ]] && [[ "$ALLOW_FORCE_PUSH" != "true" ]]; then
  echo "错误: 不能强制推送到受保护分支 $MAIN_BRANCH"
  exit 1
fi

# 检查是否有远程
if ! git remote | grep -q "^${REMOTE}$"; then
  echo "错误: 未找到远程仓库 $REMOTE"
  exit 1
fi

# 获取远程 URL
REMOTE_URL=$(git remote get-url "$REMOTE" 2>/dev/null || echo "")

# 检查是否有待推送的提交
if ! git rev-list --count "$REMOTE/$CURRENT_BRANCH"..HEAD >/dev/null 2>&1; then
  # 远程分支不存在，直接推送
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] git push -u $REMOTE $CURRENT_BRANCH"
  else
    PUSH_CMD="git push -u $REMOTE $CURRENT_BRANCH"
    [[ "$FORCE" == "true" ]] && PUSH_CMD="$PUSH_CMD --force"
    
    RETRY_COUNT=0
    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
      if eval "$PUSH_CMD"; then
        [[ "$VERBOSE" == "true" ]] && echo "✓ 推送成功"
        exit 0
      else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        [[ "$VERBOSE" == "true" ]] && echo "推送失败，重试 $RETRY_COUNT/$MAX_RETRIES"
        sleep 2
      fi
    done
    
    echo "错误: 推送失败，已重试 $MAX_RETRIES 次"
    exit 1
  fi
else
  # 检查是否有冲突
  git fetch "$REMOTE" "$CURRENT_BRANCH" >/dev/null 2>&1 || true
  
  if git merge-base --is-ancestor "$REMOTE/$CURRENT_BRANCH" HEAD 2>/dev/null; then
    # 本地领先，可以推送
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY RUN] git push $REMOTE $CURRENT_BRANCH"
    else
      PUSH_CMD="git push $REMOTE $CURRENT_BRANCH"
      [[ "$FORCE" == "true" ]] && PUSH_CMD="$PUSH_CMD --force"
      
      RETRY_COUNT=0
      while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        if eval "$PUSH_CMD"; then
          [[ "$VERBOSE" == "true" ]] && echo "✓ 推送成功"
          exit 0
        else
          RETRY_COUNT=$((RETRY_COUNT + 1))
          [[ "$VERBOSE" == "true" ]] && echo "推送失败，重试 $RETRY_COUNT/$MAX_RETRIES"
          sleep 2
        fi
      done
      
      echo "错误: 推送失败，已重试 $MAX_RETRIES 次"
      exit 1
    fi
  else
    echo "警告: 远程分支有新的提交，需要先拉取"
    echo "建议运行: git-auto-pull.sh"
    exit 1
  fi
fi

echo "推送完成"

