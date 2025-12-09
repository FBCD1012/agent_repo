#!/usr/bin/env bash

# 自动同步脚本（拉取 + 推送）
# 用法: ./git-auto-sync.sh [--dry-run] [--verbose]

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 解析参数
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
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --dry-run    仅显示将要执行的操作"
      echo "  --verbose    显示详细输出"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

echo "=== 开始同步 ==="

# 先拉取
echo "1. 拉取远程更新..."
DRY_RUN_FLAG=""
[[ "$DRY_RUN" == "true" ]] && DRY_RUN_FLAG="--dry-run"
VERBOSE_FLAG=""
[[ "$VERBOSE" == "true" ]] && VERBOSE_FLAG="--verbose"

"$SCRIPT_DIR/git-auto-pull.sh" $DRY_RUN_FLAG $VERBOSE_FLAG || {
  echo "警告: 拉取时出现问题，继续推送..."
}

# 再推送
echo ""
echo "2. 推送本地变更..."
"$SCRIPT_DIR/git-auto-push.sh" $DRY_RUN_FLAG $VERBOSE_FLAG || {
  echo "错误: 推送失败"
  exit 1
}

echo ""
echo "=== 同步完成 ==="

