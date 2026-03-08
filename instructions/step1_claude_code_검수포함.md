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

1. `~/qa-pipeline_humanintheloop/input/` 의 프론트엔드 코드 zip 압축 해제 후 라우팅 구조 분석
   - 화면 목록, 화면 간 이동 경로, 주요 기능 추출

2. Figma API로 파일 프레임 목록과 Annotation 추출
   - 추출한 프레임 이미지는 `~/qa-pipeline_humanintheloop/input/figma_frames/` 에 저장

3. 코드 라우팅 + 피그마 화면 교차 분석 → 기획서 초안 작성
   - 포함 항목: 화면명, 경로, 주요기능, 사용자플로우

4. 기획서 기반으로 화면별 QA 시나리오 생성
   - 로그인 시나리오(SCR-00) 반드시 포함
   - 동적 경로 전제조건에 스테이징에서 확인한 실제 테스트 데이터 ID 포함

5. 결과를 `qa_scenarios.csv`로 저장

6. `qa_scenarios.csv` + 코드 기반으로 화면별 정상 동작 정의서 작성 (`qa_definition.md`)
   - 각 화면마다 포함: 정상 상태 정의 / 의도된 제한사항 / 비정상 케이스 / 성공·실패 기준

---

## AI 판단 규칙

1. Figma API 추출 실패 시 → 해당 화면명과 실패 사유 기록 후 계속 진행
2. 코드에는 있는데 피그마에 없는 화면 → 코드 기준 시나리오 생성 + 불일치 기록
3. 피그마에는 있는데 코드에 없는 화면 → 미구현 화면으로 분류 + 기록
4. 동적 경로 ID 확보 실패 시 → 플레이스홀더(예: SAMPLE_CASE_ID)로 대체 후 기록
5. 동일 URL에 탭으로 구분된 화면 → 탭별로 별도 시나리오로 분리
6. 우선순위 기준:
   - P1: 핵심 플로우 (로그인, 사건 생성, 서면 작성)
   - P2: 주요 기능 (탭 전환, 파일 업로드)
   - P3: 부가 기능 (설정, 알림, 메모)

---

## 저장 위치

```
~/qa-pipeline_humanintheloop/output/step1/
```

---

## Git 완료

```bash
git -C ~/qa-pipeline_humanintheloop add input/figma_frames/ output/step1/
git -C ~/qa-pipeline_humanintheloop commit -m "step1: 시나리오 및 정의서 생성"
git -C ~/qa-pipeline_humanintheloop push origin main
```

---

## 산출물

- `qa_scenarios.csv`
- `qa_definition.md`

---

## ★ 사람 검수 — Step 2 진행 전 필수

Step 1 완료 후 아래 항목을 검토하고 수정한 뒤 Step 2로 진행합니다.

### 검수 항목

1. `output/step1/qa_scenarios.csv` 확인
   - 시나리오 누락 여부
   - 우선순위 적절성 (P1/P2/P3)
   - 전제조건 및 테스트 데이터 ID 정확성

2. `output/step1/qa_definition.md` 확인
   - 성공/실패 판단 기준 적절성
   - 의도된 제한사항 정확성

### 수정 완료 후

```bash
git -C ~/qa-pipeline_humanintheloop add output/step1/
git -C ~/qa-pipeline_humanintheloop commit -m "step1: 검수 후 수정"
git -C ~/qa-pipeline_humanintheloop push origin main
```

> 다음 단계: **Step 2** → `instructions/step2_manus_검수포함.md` 참고
