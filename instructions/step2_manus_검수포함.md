# Step 2 — Manus (QA 실행) / 검수포함

> 공통 설정값: `instructions/pipeline_config.md` 참고

---

## Git 준비

```bash
git clone https://github.com/mhkim11/qa-pipeline-shared-humanintheloop qa-pipeline
cd qa-pipeline
```

---

## 환경 설정

`pipeline_config.md`의 **스테이징 서버** 섹션 값으로 `.env` 파일 생성:

```
STAGING_URL = {pipeline_config.md의 STAGING_URL}
STAGING_ID  = {pipeline_config.md의 STAGING_ID}
STAGING_PW  = {pipeline_config.md의 STAGING_PW}
```

---

## RUN_ID 확인

```bash
RUN_ID=$(cat qa-pipeline/output/latest_run)
echo "대상 Run: $RUN_ID"
```

> `output/latest_run` 파일은 Step 1 검수 UI에서 **저장 & 커밋** 클릭 시 자동 생성됩니다.

---

## 입력 파일

```
qa-pipeline/output/step1/$RUN_ID/qa_scenarios.csv
qa-pipeline/output/step1/$RUN_ID/qa_definition.md
```

> 사람 검수가 완료된 파일 기준입니다. Step 1 검수 완료 후 진행하세요.

---

## 실행 규칙

1. 로그인(SCR-00)을 가장 먼저 실행
2. 우선순위 P1 → P2 → P3 순서로 실행 — **`qa_scenarios.csv`의 모든 시나리오를 빠짐없이 실행**
3. 각 시나리오 실행 시:
   - `qa_results.csv`의 시나리오ID는 **반드시 `qa_scenarios.csv`의 시나리오ID를 그대로 복사** (`SCR-00` 형식 — 임의 변경 금지)
   - 테스트 단계를 순서대로 진행
   - `qa_definition.md`의 판단 기준으로 성공/실패 결정
   - **결과에 관계없이 모든 시나리오에 스크린샷 첨부** (성공 포함)
   - 실패·블로킹 시 재현 경로 추가 기록
4. 시나리오에 없는 버그 발견 시 `extra_bugs.md`에 별도 기록
   - 형식: 발견 화면 URL / 재현 경로 / 스크린샷 경로 / 예상 원인
5. QA 완료 후 실제 확인된 URL과 동적 ID로 `pipeline_config.md` 업데이트
   - **캡처 대상 화면 목록**: 추상 경로가 아닌 실제 접근 가능한 전체 URL로 교체
   - **테스트 데이터 ID**: `qa_scenarios.csv`에 `SAMPLE_`로 시작하는 플레이스홀더가 있으면 실제 확인된 ID로 추가
     - 예: `SAMPLE_ANNOTATION_ID` 발견 → 스테이징에서 실제 ID 확인 후 `ANNOTATION_ID = actual_id_value` 추가
   - 업데이트 후 커밋 (아래 Git 완료 참고)

---

## AI 판단 규칙

1. 로그인(SCR-00) 실패 시 → **즉시 중단** — 이후 모든 시나리오 실행 불가. `qa_results.csv`에 실패 기록 후 종료
2. 예상치 못한 팝업/모달 발생 시 → 내용 기록 후 닫고 계속 진행
3. 페이지 로딩 10초 이상 지연 시 → 타임아웃 처리
4. 시나리오 경로와 다른 화면으로 이동 시 → 실패 처리 후 다음 진행
5. 명확하지 않은 성공/실패 → 블로킹으로 기록 + 스크린샷 첨부
6. 시나리오 외 비정상 동작 발견 시 → 재현경로 + 스크린샷을 `extra_bugs.md`에 기록

---

## 저장 위치

```
qa-pipeline/output/step2/$RUN_ID/qa_results.csv
qa-pipeline/output/step2/$RUN_ID/extra_bugs.md   ← 시나리오 외 버그 (없으면 생략)
qa-pipeline/output/step2/$RUN_ID/screenshots/
```

---

## Git 완료

```bash
git add output/step2/$RUN_ID/ instructions/pipeline_config.md
git commit -m "step2[$RUN_ID]: Manus QA 실행 결과 + pipeline_config 업데이트"
git push origin main
```

---

## 산출물

`qa_results.csv` 컬럼:

| 컬럼 | 내용 |
|---|---|
| 시나리오ID | **반드시 `SCR-00` 형식** — Step 1 `qa_scenarios.csv`의 시나리오ID와 완전 일치해야 함 |
| 실행결과 | 성공 / 실패 / 블로킹 |
| 실패원인 | 실패·블로킹 시 원인 기술 (성공 시 빈 칸) |
| 재현경로 | 실패·블로킹 시 재현 순서 기술 (성공 시 빈 칸) |
| 스크린샷경로 | screenshots/ 내 파일 경로 (모든 결과에 첨부) |
| 메모 | 성공이지만 아래 중 하나라도 해당되면 기록, 없으면 빈 칸:<br>- 응답이 느림 (3초 이상)<br>- UI 요소가 잠깐 깜빡이거나 레이아웃이 순간 틀어짐<br>- 경고·알림 메시지가 예상과 다른 타이밍에 표시됨<br>- 기능은 동작하나 화면 문구·레이블이 어색함 |

### extra_bugs.md

시나리오 외 버그 목록 (발견된 경우에만 생성)

---

> 다음 단계: **Step 3** → `instructions/step3_playwright_검수포함.md` 참고
