#!/usr/bin/env bash

# 自动创建 PR 脚本
# 用法: ./git-auto-pr.sh [--dry-run] [--verbose] [--title "标题"] [--body "描述"]

set -e

# 检查依赖
command -v gh >/dev/null 2>&1 || {
  echo "错误: 需要安装 GitHub CLI (gh)"
  echo "安装: brew install gh 或访问 https://cli.github.com"
  exit 1
}

# 加载配置
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/git-workflow-config.json"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/../../.." && pwd)")"

# 解析参数
DRY_RUN=false
VERBOSE=false
PR_TITLE=""
PR_BODY=""
AUTO_MERGE=false

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
    --title)
      PR_TITLE="$2"
      shift 2
      ;;
    --body)
      PR_BODY="$2"
      shift 2
      ;;
    --auto-merge)
      AUTO_MERGE=true
      shift
      ;;
    --help|-h)
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --dry-run        仅显示将要执行的操作"
      echo "  --verbose        显示详细输出"
      echo "  --title TITLE    PR 标题"
      echo "  --body BODY      PR 描述"
      echo "  --auto-merge     自动合并 PR（如果通过检查）"
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
  DEVELOP_BRANCH=$(jq -r '.repository.developBranch' "$CONFIG_FILE" 2>/dev/null || echo "develop")
  AUTO_CREATE_PR=$(jq -r '.pr.autoCreate' "$CONFIG_FILE" 2>/dev/null || echo "true")
  AUTO_MERGE_PR=$(jq -r '.pr.autoMerge' "$CONFIG_FILE" 2>/dev/null || echo "false")
else
  REMOTE="origin"
  MAIN_BRANCH="main"
  DEVELOP_BRANCH="develop"
  AUTO_CREATE_PR=true
  AUTO_MERGE_PR=false
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 检查是否在主分支
if [[ "$CURRENT_BRANCH" == "$MAIN_BRANCH" ]] || [[ "$CURRENT_BRANCH" == "$DEVELOP_BRANCH" ]]; then
  echo "错误: 不能从主分支创建 PR"
  exit 1
fi

# 确保已推送
if [[ -z "$(git ls-remote --heads $REMOTE $CURRENT_BRANCH)" ]]; then
  echo "错误: 分支 $CURRENT_BRANCH 尚未推送到远程"
  echo "请先运行: git-auto-push.sh"
  exit 1
fi

# 生成 PR 标题
if [[ -z "$PR_TITLE" ]]; then
  # 从分支名和提交消息生成标题
  if [[ "$CURRENT_BRANCH" =~ ^([0-9]+)-(.+)$ ]]; then
    BRANCH_NUM="${BASH_REMATCH[1]}"
    BRANCH_NAME="${BASH_REMATCH[2]}"
    LAST_COMMIT=$(git log -1 --pretty=%s)
    PR_TITLE="feat $BRANCH_NUM-$BRANCH_NAME: $LAST_COMMIT"
  else
    LAST_COMMIT=$(git log -1 --pretty=%s)
    PR_TITLE="$LAST_COMMIT"
  fi
fi

# 生成 PR 描述
if [[ -z "$PR_BODY" ]]; then
  COMMITS=$(git log "$MAIN_BRANCH"..HEAD --pretty=format:"- %s" | head -10)
  CHANGED_FILES=$(git diff --name-only "$MAIN_BRANCH"..HEAD | head -10)
  
  PR_BODY="## 功能概述

$(git log -1 --pretty=%B)

## 变更列表

$COMMITS

## 变更文件

\`\`\`
$CHANGED_FILES
\`\`\`

## 测试说明

- [ ] 已通过本地测试
- [ ] 已通过 CI/CD 检查

## 相关 Issue

<!-- 关联相关 Issue -->
"
fi

# 创建 PR
if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY RUN] 将创建 PR:"
  echo "  标题: $PR_TITLE"
  echo "  从: $CURRENT_BRANCH"
  echo "  到: $MAIN_BRANCH"
  echo "  描述: $PR_BODY"
else
  # 获取仓库信息
  REMOTE_URL=$(git remote get-url "$REMOTE" 2>/dev/null || echo "")
  if [[ "$REMOTE_URL" =~ github.com[:/]([^/]+)/([^/]+)\.git ]]; then
    REPO_OWNER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
  else
    echo "错误: 无法解析仓库信息"
    exit 1
  fi
  
  # 创建 PR
  PR_URL=$(gh pr create \
    --repo "$REPO_OWNER/$REPO_NAME" \
    --base "$MAIN_BRANCH" \
    --head "$CURRENT_BRANCH" \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    2>&1)
  
  if [[ $? -eq 0 ]]; then
    echo "✓ PR 创建成功: $PR_URL"
    
    # 如果需要自动合并
    if [[ "$AUTO_MERGE" == "true" ]] || [[ "$AUTO_MERGE_PR" == "true" ]]; then
      PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$')
      echo "等待 CI 检查通过后自动合并..."
      gh pr merge "$PR_NUMBER" --auto --squash
    fi
  else
    echo "错误: PR 创建失败"
    echo "$PR_URL"
    exit 1
  fi
fi

echo "PR 操作完成"

