# QA 파이프라인

## 지시문 파일 구조

```
instructions/
  pipeline_config.md              ← 공통 설정 (경로·URL·ID) — 여기만 수정하면 됨
  step1_claude_code_검수포함.md
  step2_manus_검수포함.md
  step3_playwright_검수포함.md
  step4_claude_code_검수포함.md
```

---

## AI에게 지시하는 방법

```
# Step 1 — Claude Code
instructions/step1_claude_code_검수포함.md 파일을 읽고 지시대로 실행해줘.

# Step 2 — Manus
instructions/step2_manus_검수포함.md 파일을 읽고 지시대로 실행해줘.

# Step 3 — Claude Code
instructions/step3_playwright_검수포함.md 파일을 읽고 지시대로 실행해줘.

# Step 4 — Claude Code
instructions/step4_claude_code_검수포함.md 파일을 읽고 지시대로 실행해줘.
```

---

## 검수 UI 실행

Step 1 완료 후 시나리오 검수:

```bash
node scripts/review_server.js
# http://localhost:3000
```

---

## 지시문 변경 후 구성도 업데이트

```bash
# instructions/ 내 MD 파일 수정 후 커밋하면 pre-commit 훅이 자동으로 구성도 재생성
git add instructions/
git commit -m "docs: 지시문 업데이트"
git push origin main
```

---

## GitHub 저장소

| 항목 | 내용 |
|---|---|
| 저장소 | qa-pipeline-shared-humanintheloop |
| 로컬 폴더 | ~/qa-pipeline_humanintheloop |
