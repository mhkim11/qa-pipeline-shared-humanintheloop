#!/bin/sh
#
# scripts/setup_hooks.sh
#
# 역할:
#   git hook을 설치합니다.
#   저장소를 처음 clone한 후 1회 실행하면 됩니다.
#
# 사용법:
#   sh scripts/setup_hooks.sh
#

echo "🔧 Git hook 설치 중..."

cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ 설치 완료"
echo ""
echo "이제 instructions/ 내 MD 파일을 수정하고 git commit 하면"
echo "docs/qa_pipeline_구성도.docx 가 자동으로 재생성됩니다."
