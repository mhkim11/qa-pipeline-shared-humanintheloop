# Step 3 — Claude Code + Playwright (화면 캡처) / 검수포함

> 캡처 대상 URL 목록: `instructions/pipeline_config.md` 참고

---

## Git 준비

```bash
git -C ~/qa-pipeline_humanintheloop pull origin main
```

---

## 환경 설정

모든 인증 정보는 `~/qa-pipeline_humanintheloop/.env` 파일 참고

---

## RUN_ID 확인

```bash
RUN_ID=$(cat ~/qa-pipeline_humanintheloop/output/latest_run)
echo "대상 Run: $RUN_ID"
```

---

## 개요

Playwright 스크립트를 작성하고 직접 실행해서 스테이징 화면을 캡처합니다.
캡처 대상은 Step 2 Manus가 실제 스테이징을 탐색하며 도출한 실제 URL 기준입니다.
(프론트엔드 코드의 추상 경로가 아닌 실제 접근 가능한 전체 URL)

---

## 스크립트 저장 위치

```
~/qa-pipeline_humanintheloop/scripts/capture.py
```

---

## 캡처 대상 화면

`instructions/pipeline_config.md` 의 **캡처 대상 화면** 섹션 참고

---

## 실행 규칙

1. 비로그인 상태에서 로그인 화면 먼저 캡처
2. 로그인 후 각 화면 순서대로 접근
3. 각 화면 캡처 전 네트워크 idle 상태까지 대기
4. full page 기준으로 캡처

---

## AI 판단 규칙

1. 팝업/모달 발생 시 → 닫고 계속 진행
2. 로딩 10초 이상 → 타임아웃 기록 후 다음 화면 진행
3. 로그인 세션 만료 시 → 재로그인 후 이어서 진행
4. 캡처 실패 시 → `capture_errors.log`에 사유 기록

---

## 저장 위치

```
~/qa-pipeline_humanintheloop/output/step3/$RUN_ID/screenshots/
~/qa-pipeline_humanintheloop/output/step3/$RUN_ID/capture_errors.log
~/qa-pipeline_humanintheloop/scripts/capture.py
```

---

## Git 완료

```bash
git -C ~/qa-pipeline_humanintheloop add output/step3/$RUN_ID/ scripts/capture.py
git -C ~/qa-pipeline_humanintheloop commit -m "step3[$RUN_ID]: Playwright 화면 캡처"
git -C ~/qa-pipeline_humanintheloop push origin main
```

---

## 산출물

- 화면별 캡처 이미지 16개 (png)
- `capture_errors.log`
- `capture.py`

---

> 다음 단계: **Step 4** → `instructions/step4_claude_code_검수포함.md` 참고
