# 불일치 리포트 (mismatch_report.md)

> 생성일: 2026-03-08 | RUN_ID: 2603082245

---

## Figma API 상태

- **상태: 정상 완료** — 429 없음
- 다운로드 프레임 수: 12개
- 딜레이: 4초 적용
- 저장 위치: `input/figma_frames/2603082245/`

---

## 코드에만 있는 화면 (피그마 미확인)

| 시나리오ID | 화면 설명 | 판단 근거 |
|-----------|----------|----------|
| SCR-15 | `/payment` — 결제 관리. PaymentPage 컴포넌트, PaymentTable 렌더링 | 코드에 결제 관련 라우트 및 컴포넌트 존재, Figma 최종 디자인 페이지에 대응 섹션 미확인 |
| SCR-16 | `/subscription` — 구독 관리. SubscriptionPage 컴포넌트, SubscriptionTable 렌더링 | 코드에 구독 관련 라우트 및 컴포넌트 존재, Figma 최종 디자인 페이지에 대응 섹션 미확인 |
| SCR-17 | `/billing/success` — 결제 성공 안내. BillingSuccessPage 컴포넌트 | 코드에 존재, Figma 미확인 |
| SCR-18 | `/billing/fail` — 결제 실패 안내. BillingFailPage 컴포넌트 | 코드에 존재, Figma 미확인 |
| SCR-19 | `/evidence/case-tap/:evidenceId` — 탭 형태 증거 뷰어. CaseTapPage 컴포넌트 | 코드에 존재, Figma 최종 디자인에 별도 섹션 미확인 |
| SCR-20 | `/register_marketing` — 마케팅 수신 동의. RegisterMarketingPage 컴포넌트 | 코드에 존재, Figma 미확인 |
| SCR-21 | `/event-signup-ailex-authentication` — 이벤트 초대 회원가입. ResRegisterPage 컴포넌트 | 코드에 존재, Figma 미확인 |
| SCR-22 | 어드민 전용 화면 `/admin/*` — AdminHomePage, AdminEvidenceViewer 등 6개 라우트 | 코드에 ADMIN 역할 전용 라우터 존재, Figma에 어드민 전용 디자인 섹션 미확인 |

---

## 피그마에만 있는 화면 (코드 미확인)

| 피그마 섹션 | 피그마 프레임 파일명 | 판단 |
|-----------|-------------------|------|
| 챗봇 (Chatbot) | `챗봇.png`, `챗봇_사이드바닫힘.png`, `챗봇_전체.png` | Figma에 '챗봇' 섹션 존재(id: 237:26348). 별도 라우트 없음. 사건 화면(/case-list) 내 사이드패널로 통합된 것으로 추정. 코드 내 ChatBot 컴포넌트 추가 확인 필요 → **미구현 또는 embedded** |
| 클립핑 / AI 클립핑 제안 | `클립핑.png`, `AI클립핑제안_최초진입.png` | Figma에 '클립핑' 섹션(id: 221:11767), 'AI 클립핑 제안' 섹션(id: 341:50524) 존재. 별도 라우트 없음. 증거 뷰어 내 기능으로 통합 추정 → **미구현 또는 embedded** |
| 사건 히스토리 | `사건히스토리.png` | Figma에 '사건 요약 History' 섹션(id: 221:40871) 존재. 별도 라우트 없음 → **미구현 또는 사건 화면 내 기능** |
| 사건 목록 민/형사 등록 프로세스 | `사건목록_민사.png`, `새사건등록.png` | Figma 섹션(id: 2005:44405) — 민사/형사 사건 등록 플로우. 코드에 사건 등록 모달/팝업 형태로 구현된 것으로 추정(별도 라우트 없음) → **모달 embedded** |

---

## 경로 불일치

| 항목 | 코드 경로 | Figma/Config 경로 | 비고 |
|------|----------|-----------------|------|
| 증거 PDF 뷰어 | `/evidence/pdf/:evidenceId` | `/evidence/pdf/{DOCUMENT_ID}` (pipeline_config) | 일치 |
| 사건 케이스 뷰어 | `/evidence/case-viewer/:evidenceId` | `/evidence/case-viewer/{DOCUMENT_ID}` | 일치 |
| AI 분석 | `/ai` | `/ai` | 일치 |

---

## 동적 경로 ID 플레이스홀더

| 경로 | 플레이스홀더 | config 대응 여부 |
|------|-----------|----------------|
| `/case-list?civil_case_id={id}` | `ccase_01KJ9BX7N9407DKCQ2SMNT6XC8` | CIVIL_CASE_ID — 대응 있음 |
| `/case-list?project_id={id}` | `prj_01KJ9BX7GMEGDP0XARME8DR3RG` | PROJECT_ID — 대응 있음 |
| `/evidence/pdf/:evidenceId` | `cdoc_01KK089FYR0HD07J1580F1VXPD` | DOCUMENT_ID — 대응 있음 |
| `/evidence/case-viewer/:evidenceId` | `cdoc_01KK089FYR0HD07J1580F1VXPD` | DOCUMENT_ID — 대응 있음 |
| `/demo-viewer/:evidenceId` | SAMPLE_DEMO_EVIDENCE_ID | **대응 없음 → 플레이스홀더 사용** |
| `/demo-summary-pdf/:evidenceId` | SAMPLE_DEMO_EVIDENCE_ID | **대응 없음 → 플레이스홀더 사용** |
| `/admin/evidence/pdf/:evidenceId` | SAMPLE_ADMIN_EVIDENCE_ID | **대응 없음 → 플레이스홀더 사용** |

---

## 메모 화면 특이사항

- `/memo` — MemoPage 컴포넌트가 `return <></>` 로 완전 미구현 상태
- QA 시나리오 생성 시 P3로 분류, 미구현 화면으로 표시
