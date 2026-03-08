# QA 파이프라인

## 지시문 파일 구조

```
instructions/
  pipeline_config.md                 ← 공통 설정 (경로·URL·ID) — 여기만 수정하면 됨
  step1_claude_code_전자동.md
  step1_claude_code_검수포함.md
  step2_manus_전자동.md
  step2_manus_검수포함.md
  step3_playwright_전자동.md
  step3_playwright_검수포함.md
  step4_claude_code_전자동.md
  step4_claude_code_검수포함.md
```

---

## AI에게 지시하는 방법

```
# Claude Code — 전자동 Step 1
instructions/step1_claude_code_전자동.md 파일을 읽고 지시대로 실행해줘.

# Manus — 전자동 Step 2
instructions/step2_manus_전자동.md 파일을 읽고 지시대로 실행해줘.

# Claude Code — 검수포함 Step 3
instructions/step3_playwright_검수포함.md 파일을 읽고 지시대로 실행해줘.
```

---

## 지시문 변경 후 구성도 업데이트

```bash
# 1. instructions/ 내 MD 파일 수정
# 2. 구성도 자동 재생성
node scripts/update_pipeline_doc.js

# 3. 커밋
git add docs/ instructions/
git commit -m "docs: 지시문 및 구성도 업데이트"
git push origin main
```

---

## GitHub 저장소

| 방식 | 저장소 | 로컬 폴더 |
|---|---|---|
| 전자동 | qa-pipeline-shared | ~/qa-pipeline |
| 검수포함 | qa-pipeline-shared-humanintheloop | ~/qa-pipeline_humanintheloop |
