# Step 1 — Claude Code (시나리오 생성) / 검수포함

> 공통 설정값: `instructions/pipeline_config.md` 참고

---

## Git 준비

```bash
git -C ~/qa-pipeline_humanintheloop pull origin main
```

---

## 환경 설정

모든 인증 정보는 `~/qa-pipeline_humanintheloop/.env` 파일 참고

---

## 할 일 (순서대로)

0. 실행 ID 생성 및 디렉토리 준비
   ```bash
   RUN_ID=$(date +%y%m%d%H%M)   # 예: 2603081420
   mkdir -p ~/qa-pipeline_humanintheloop/input/figma_frames/$RUN_ID
   mkdir -p ~/qa-pipeline_humanintheloop/output/step1/$RUN_ID
   ```
   - `output/step1/run_log.md` 에 실행 이력 누적 append
   - 형식: `## $RUN_ID — {zip파일명}, Figma 키, 샘플문서 {N}개`

1. `~/qa-pipeline_humanintheloop/input/` 의 프론트엔드 코드 zip 압축 해제 후 라우팅 구조 분석
   - 화면 목록, 화면 간 이동 경로, 주요 기능 추출
   - **실패 시 즉시 중단** — 이후 모든 단계가 불가능하므로 오류 메시지 출력 후 종료

2. Figma API로 파일 프레임 목록과 Annotation 추출
   - 추출한 프레임 이미지는 `~/qa-pipeline_humanintheloop/input/figma_frames/$RUN_ID/` 에 저장
   - 이미지 추출 시 요청 사이 **4초 딜레이** 적용 (Pro 플랜 분당 15회 한도 기준)
   - 429 응답 수신 시 → 즉시 중단, `mismatch_report.md` 에 발생 시점과 미추출 프레임 목록 기록 후 코드 단독으로 계속 진행
   - 429가 반복 발생하면 딜레이를 6초 → 8초 순으로 늘려서 재실행
   - **전체 실패 시** → 코드 단독으로 계속 진행, `mismatch_report.md` 상단에 실패 사실 명시

3. 코드 라우팅 + 피그마 화면 교차 분석 → 기획서 초안 작성 후 `spec_draft.md` 로 저장
   - 포함 항목: 화면명, 경로, 주요기능, 사용자플로우
   - 불일치 항목(코드에만 있음 / 피그마에만 있음 / 경로 불일치)은 `mismatch_report.md` 에 기록

4. `~/qa-pipeline_humanintheloop/input/sample_docs/` 에 PDF 파일이 있으면 분석
   - 실제 문서 구조·필드·데이터 패턴 추출
   - 추출 결과를 시나리오 생성 시 반영: 엣지케이스(빈 필드, 대용량 파일, 특수문자 등), 실제 데이터 기반 전제조건
   - 파일이 없으면 이 단계 건너뜀

5. 기획서 기반으로 화면별 QA 시나리오 생성 — **코드에서 발견 가능한 모든 시나리오를 빠짐없이 도출**
   - 로그인 시나리오(SCR-00) 반드시 포함
   - 동적 경로 전제조건에 `pipeline_config.md`의 테스트 데이터 ID 사용
   - 대응하는 ID가 없는 동적 경로는 플레이스홀더로 대체 (AI 판단 규칙 6번 참고)
   - **아래 항목은 각각 독립 시나리오로 반드시 분리**:
     - 라우터에 등록된 모든 경로(route) → 경로 1개당 최소 시나리오 1개
     - 동일 URL의 탭/섹션 → 탭 1개당 1개
     - 파일 업로드 기능 → 정상 업로드 / 형식 오류 / 용량 초과 각 1개
     - 폼(form) 제출 → 정상 제출 / 필수 입력 누락 / 서버 오류 각 1개
     - 모달·다이얼로그 → 열기·닫기·확인 동작 1개

6. 결과를 `qa_scenarios.csv`로 저장 — 아래 컬럼 구조 고정

   | 컬럼 | 설명 |
   |------|------|
   | 시나리오ID | SCR-00 형식 |
   | 화면명 | 한글 화면명 |
   | URL | 실제 접근 경로 (동적 ID 포함) |
   | 전제조건 | 로그인 상태, 필요 데이터 등 |
   | 테스트단계 | 번호 매긴 순서 |
   | 기대결과 | 정상 동작 기준 |
   | 우선순위 | P1 / P2 / P3 |
   | 피그마일치여부 | 일치 / 코드만 / 피그마만 / 경로불일치 |

7. `qa_scenarios.csv` + 코드 기반으로 화면별 정상 동작 정의서 작성 (`qa_definition.md`)
   - 각 화면마다 아래 템플릿 구조를 반드시 준수

   ```markdown
   ## [화면명] (URL)

   ### 정상 상태 정의
   - (정상적으로 표시·동작해야 할 항목)

   ### 의도된 제한사항
   - (권한, 조건에 따라 제한되는 동작)

   ### 비정상 케이스
   - (오류, 예외 상황)

   ### 성공 기준
   - (이 화면의 QA 통과 조건)

   ### 실패 기준
   - (재작업이 필요한 조건)
   ```

---

## AI 판단 규칙

1. zip 압축 해제 실패 → **즉시 중단**
2. Figma API 추출 실패 (일부 화면) → 해당 화면명과 실패 사유를 `mismatch_report.md` 에 기록 후 계속 진행
3. Figma API 전체 실패 → `mismatch_report.md` 상단에 명시 후 코드 단독으로 계속 진행
4. 코드에는 있는데 피그마에 없는 화면 → 코드 기준 시나리오 생성 + `mismatch_report.md` 기록
   - 기록 형식: 시나리오ID, 화면 설명 (컴포넌트명·주요 API 엔드포인트·핵심 UI 요소), 판단 근거
   - 예시: `SCR-06 — /case-list/editor: 서면 작성 에디터. CaseEditorPage 컴포넌트, POST /api/documents 호출`
5. 피그마에는 있는데 코드에 없는 화면 → 미구현 화면으로 분류 + `mismatch_report.md` 기록
   - 기록 형식: 피그마 프레임 파일명(`input/figma_frames/$RUN_ID/` 저장 시 사용한 파일명)을 **반드시 백틱(`)으로 감싸서 기재**
   - 예시: `온보딩 화면 — 피그마 프레임: \`온보딩.png\` / 코드 없음 → 미구현으로 제외`
   - 피그마에만 있는 화면이 없더라도 섹션 자체는 유지하고 "해당 없음"으로 명시
6. 동적 경로 ID 확보 실패 시 → 플레이스홀더(예: SAMPLE_CASE_ID)로 대체 후 `mismatch_report.md` 에 기록
   - 발생 조건: 코드에서 발견된 동적 경로인데 `pipeline_config.md`의 테스트 데이터 ID에 대응값이 없는 경우
   - 검수자가 Step 1 검수 UI에서 실제 ID를 직접 입력하여 수정
7. 동일 URL에 탭으로 구분된 화면 → 탭별로 별도 시나리오로 분리
8. 우선순위 기준:
   - P1: 핵심 플로우 (로그인, 사건 생성, 서면 작성)
   - P2: 주요 기능 (탭 전환, 파일 업로드)
   - P3: 부가 기능 (설정, 알림, 메모)

---

## 저장 위치

```
~/qa-pipeline_humanintheloop/input/figma_frames/$RUN_ID/
~/qa-pipeline_humanintheloop/output/step1/$RUN_ID/
~/qa-pipeline_humanintheloop/output/step1/run_log.md   ← 전체 실행 이력 공유
```

---

## Git 완료

```bash
git -C ~/qa-pipeline_humanintheloop add input/figma_frames/$RUN_ID/ output/step1/$RUN_ID/ output/step1/run_log.md
git -C ~/qa-pipeline_humanintheloop commit -m "step1[$RUN_ID]: 시나리오 및 정의서 생성"
git -C ~/qa-pipeline_humanintheloop push origin main
```

---

## 산출물

- `run_log.md` (실행 이력 누적)
- `spec_draft.md` (기획서 초안)
- `qa_scenarios.csv`
- `qa_definition.md`
- `mismatch_report.md` (불일치 및 실패 항목 요약)

---

## ★ 사람 검수 — Step 2 진행 전 필수

검수 UI를 실행하고 브라우저에서 확인·수정합니다.

```bash
node ~/qa-pipeline_humanintheloop/scripts/review_server.js
```

브라우저에서 `http://localhost:3000` 열기

---

### 검수 순서

**1단계 — 왼쪽 패널 참고 자료 확인**

`불일치 리포트` 탭
- AI 실패 항목 확인 (Figma API 실패 등)
- 코드에만 있는 화면 → 포함/제외 결정 → 오른쪽 시나리오 테이블에 즉시 반영
- 피그마에만 있는 화면 → 미구현 제외 또는 P3 조정 → 오른쪽 테이블에 반영

`기획서 초안` 탭
- AI의 화면 이해 오류 확인
- 오류 발견 시 → 오른쪽 테스트단계·기대결과·성공기준 수정

**2단계 — 오른쪽 패널 직접 수정**

`시나리오 CSV` 탭 (셀 클릭으로 인라인 편집)
- 1단계 판단 결과 반영 (행 추가/삭제)
- SCR-00 (로그인) 포함 여부 확인
- 우선순위(P1/P2/P3) 조정
- URL 컬럼에 `SAMPLE_` 로 시작하는 플레이스홀더가 있으면 실제 스테이징 ID로 직접 수정

`정의서` 탭
- 성공/실패 기준 모호한 표현 수정
- 의도된 제한사항 보정

**3단계 — 저장 & 커밋**

`저장 & 커밋` 버튼 클릭 (단축키: `Cmd+S` 후 버튼)

> 다음 단계: **Step 2** → `instructions/step2_manus_검수포함.md` 참고
