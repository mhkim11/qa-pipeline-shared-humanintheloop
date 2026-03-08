# Step 2 — Manus (QA 실행) / 전자동

> 공통 설정값: `instructions/pipeline_config.md` 참고

---

## Git 준비

```bash
git clone https://github.com/mhkim11/qa-pipeline-shared qa-pipeline
cd qa-pipeline
```

---

## 환경 설정

아래 값으로 `.env` 파일 생성:

```
STAGING_URL = https://staging.ailex.co.kr
STAGING_ID  = test2026@softplant.co.kr
STAGING_PW  = softplant1234!
```

---

## 입력 파일

```
qa-pipeline/output/step1/qa_scenarios.csv
qa-pipeline/output/step1/qa_definition.md
```

---

## 실행 규칙

1. 로그인(SCR-00)을 가장 먼저 실행
2. 우선순위 P1 → P2 → P3 순서로 실행
3. 각 시나리오 실행 시:
   - 테스트 단계를 순서대로 진행
   - `qa_definition.md`의 판단 기준으로 성공/실패 결정
   - 실패 시 스크린샷 캡처 + 재현 경로 기록
4. 시나리오에 없는 버그 발견 시 별도 기록
5. QA 완료 후 실제 확인된 URL 구조와 동적 ID를 Step 3 캡처 대상 목록으로 정리
   - 추상 경로(/case/:id)가 아닌 실제 접근 가능한 전체 URL 기준

---

## AI 판단 규칙

1. 예상치 못한 팝업/모달 발생 시 → 내용 기록 후 닫고 계속 진행
2. 페이지 로딩 10초 이상 지연 시 → 타임아웃 처리
3. 시나리오 경로와 다른 화면으로 이동 시 → 실패 처리 후 다음 진행
4. 명확하지 않은 성공/실패 → 블로킹으로 기록 + 스크린샷 첨부
5. 시나리오 외 비정상 동작 발견 시 → 재현경로 + 스크린샷 별도 기록

---

## 저장 위치

```
qa-pipeline/output/step2/qa_results.csv
qa-pipeline/output/step2/screenshots/
```

---

## Git 완료

```bash
git add output/step2/
git commit -m "step2: Manus QA 실행 결과"
git push origin main
```

---

## 산출물

`qa_results.csv` 컬럼:

| 컬럼 | 내용 |
|---|---|
| 시나리오ID | SCR-00, TC-01-01 등 |
| 실행결과 | 성공 / 실패 / 블로킹 |
| 실패원인 | 실패 시 원인 기술 |
| 재현경로 | 재현 순서 기술 |
| 스크린샷경로 | screenshots/ 내 파일 경로 |
| 실행시간 | 소요 시간 |

---

> 다음 단계: **Step 3** → `instructions/step3_playwright_전자동.md` 참고
