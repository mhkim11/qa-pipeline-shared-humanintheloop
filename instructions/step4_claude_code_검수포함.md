# Step 4 — Claude Code (최종 리포트) / 검수포함

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

## 입력 파일 위치

```
~/qa-pipeline_humanintheloop/output/step1/qa_scenarios.csv
~/qa-pipeline_humanintheloop/output/step1/qa_definition.md
~/qa-pipeline_humanintheloop/output/step2/qa_results.csv
~/qa-pipeline_humanintheloop/output/step2/screenshots/
~/qa-pipeline_humanintheloop/output/step3/screenshots/
~/qa-pipeline_humanintheloop/output/step3/capture_errors.log
~/qa-pipeline_humanintheloop/input/figma_frames/
```

---

## 리포트 구성

1. **전체 요약**
   - 총 시나리오 수 / 성공·실패·블로킹 건수 및 비율 / 전체 패스율
   - 우선순위별(P1/P2/P3) 이슈 현황

2. **심각도별 이슈 분류**
   - Critical: P1 실패 또는 서비스 불가 수준
   - Major: P2 실패 또는 핵심 기능 오작동
   - Minor: P3 실패 또는 UI 불일치

3. **화면별 상세 결과**
   - 시나리오 실행 결과
   - 피그마 캡처 vs 스테이징 캡처 비교
   - 명확한 불일치 항목만 AI 플래그

4. **이슈 목록**
   - 실패/블로킹 시나리오 / 심각도 / 재현 경로 / 스크린샷 경로 / 예상 원인

5. **캡처 오류 현황** (`capture_errors.log` 기반)

6. **개선 권고사항**
   - Critical/Major 우선 처리 권고
   - 반복 패턴 이슈 요약

---

## AI 판단 규칙

1. 피그마 이미지 없는 화면 → 디자인 비교 생략, 시나리오 결과만 기록
2. 캡처 실패 화면 → 스크린샷 비교 없이 시나리오 결과만 기록
3. 성공이지만 명확한 UI 불일치 발견 시 → 별도 UI 이슈로 분류
4. 동일 실패 원인 3개 이상 반복 시 → 공통 원인으로 묶어서 요약
5. 판단 불명확한 항목 → 검토필요로 분류 + 스크린샷 첨부

---

## 저장 위치

```
~/qa-pipeline_humanintheloop/output/step4/
```

---

## Git 완료

```bash
git -C ~/qa-pipeline_humanintheloop add output/step4/
git -C ~/qa-pipeline_humanintheloop commit -m "step4: 최종 QA 리포트 생성"
git -C ~/qa-pipeline_humanintheloop push origin main
```

---

## 산출물

### qa_final_report.csv 컬럼

| 컬럼 | 내용 |
|---|---|
| 시나리오ID | TC-00-01 등 |
| 화면명 | 로그인, 사건목록 등 |
| 우선순위 | P1 / P2 / P3 |
| 실행결과 | 성공 / 실패 / 블로킹 |
| 심각도 | Critical / Major / Minor |
| 실패원인 | 실패 사유 기술 |
| 예상원인 | 추정 원인 |
| 재현경로 | 재현 순서 |
| UI불일치여부 | Y / N |
| 스크린샷경로 | 해당 파일 경로 |
| 검토필요여부 | Y / N |

### qa_summary.md

전체 요약 + 개선 권고사항 마크다운 문서
