# 불일치 리포트 (mismatch_report)

> RUN_ID: 2603082329 | 생성일시: 2026-03-08 23:29
> Figma API 상태: 정상 완료 (18개 프레임 추출)

---

## Figma API 실행 결과

- 상태: **정상**
- 추출 페이지: `v2.3 하이라이팅` (node: 15677:114541)
- 다운로드 프레임 수: **18개**
- 저장 경로: `input/figma_frames/2603082329/`
- 딜레이: 4초 준수, 429 없음

---

## 1. 코드에만 있는 화면 (피그마에 없음)

| 시나리오ID | 화면 설명 | 판단 근거 |
|-----------|----------|----------|
| SCR-01 | `/` (로그인) — LoginPage. 이메일/비밀번호 폼, zod 유효성 검사, 아이디 저장 기능 | 코드에 LoginPage 명확히 존재, Figma v2.3 하이라이팅 페이지에 로그인 화면 프레임 없음 |
| SCR-02 | `/register` — RegisterPage. 약관 동의 (서비스·개인정보·마케팅), NICE 본인인증 팝업 | 코드에 RegisterPage 존재, Figma에 회원가입 화면 없음 |
| SCR-03 | `/register/certify` — RegisterCertifyPage. NICE 본인인증 결과 처리 | 코드에 RegisterCertifyPage 존재, Figma 없음 |
| SCR-04 | `/find_id` — FindIdPage. 아이디 찾기, `/find_id?tab=pw` 비밀번호 재설정 탭 포함 | 코드에 FindIdPage 존재, LoginPage에서 handleTabClick으로 연결, Figma 없음 |
| SCR-05 | `/reset_password` — RePwPage. 비밀번호 재설정 | 코드에 RePwPage 존재, Figma 없음 |
| SCR-06 | `/evidence/list` — EvidenceMainPage. 증거 목록. EvidenceTable 컴포넌트, POST /api/v1/evidence 업로드, GET /api/v1/evidence 목록 조회 | 코드에 EvidenceMainPage 존재, Figma v2.3에 해당 화면 없음 (별도 디자인 시스템 페이지에 있을 가능성) |
| SCR-07 | `/evidence/pdf/:evidenceId` — EvidenceViewer. PDF 렌더링, 하이라이트, 인쇄 | 코드에 EvidenceViewer 존재, Figma 별도 프레임 없음 |
| SCR-08 | `/evidence/case-viewer/:evidenceId` — CaseViewerPage. 민사 사건 문서 PDF/텍스트 뷰어, re-resizable 패널, 텍스트 모달 | 코드에 CaseViewerPage 존재, 문서뷰어_컨테이너.png와 부분 대응하나 전체 화면 프레임 없음 |
| SCR-09 | `/ai` — AIPage. project_id 기반 AI 분석 메뉴 조회, 카테고리별 HTML/MD 뷰 | 코드에 AIPage 존재, Figma v2.3에 없음 |
| SCR-10 | `/settings` — SettingPage. 사용자 설정(폰트 크기 등) | 코드에 SettingPage 존재, Figma 없음 |
| SCR-11 | `/notifications` — NotificationPage. 알림 목록 | 코드에 NotificationPage 존재, Figma 없음 |
| SCR-12 | `/payment` — PaymentPage. 결제 내역 및 수단 관리 | 코드에 PaymentPage 존재, Figma 없음 |
| SCR-13 | `/subscription` — SubscriptionPage. 구독 플랜 조회·변경 | 코드에 SubscriptionPage 존재, Figma 없음 |
| SCR-14 | `/memo` — MemoPage. 메모관리 (현재 빈 컴포넌트) | 코드에 MemoPage 존재하나 내용 없음, Figma 없음 |
| SCR-15 | `/demo` ~ `/demo-ai` — EvidenceDemoMainPage 외 6개. 데모 전용 화면 | 코드에 존재, Figma 없음 — 데모 화면으로 별도 QA 불필요 판단 |
| SCR-16 | `/billing/success`, `/billing/fail` — BillingSuccessPage, BillingFailPage. 결제 완료/실패 콜백 | 코드에 존재, Figma 없음 |
| SCR-17 | `/case-list?tab=authority` — CaseAuthorityTable. 권한 관리 (사이드바 아이콘 접근) | 코드에 권한관리 탭 존재, Figma에 직접 프레임 없음 |
| SCR-18 | `/evidence/case-tap/:evidenceId` — CaseTapPage. 사건 탭 뷰어 | 코드에 CaseTapPage 존재, Figma 없음 |
| SCR-19 | `/evidence/summary/:evidenceId` — EvidenceSummaryViewer. 요약 텍스트 뷰어 | 코드에 존재, Figma 없음 |
| SCR-20 | `/evidence/summaryPdf/:evidenceId` — EvidenceSummaryPdfPage. 요약 PDF 뷰어 | 코드에 존재, Figma 없음 |
| SCR-21 | `/evidence/text/:evidenceId` — EvidenceTextViewer. 텍스트(OCR) 뷰어 | 코드에 존재, Figma 없음 |

---

## 2. 피그마에만 있는 화면 (코드 없음)

피그마에만 있는 화면이 없더라도 섹션 자체는 유지합니다.

현재 Figma v2.3 하이라이팅 페이지의 모든 주요 FRAME은 코드의 기존 화면과 대응됩니다.
아래 프레임은 코드 화면의 세부 인터렉션/상태 디자인으로, 독립 화면이 아닌 내부 상태입니다:

- `파워검색.png` (미다운로드): 파워검색 모달 — 코드 `power-search-modal.tsx` 존재하여 일치
- 하이라이트 관련 세부 상태 프레임 — 코드의 하이라이트 기능에 포함

**해당 없음** — 피그마에만 있고 코드에 전혀 없는 완전 미구현 화면은 발견되지 않았습니다.

---

## 3. 경로 불일치 항목

| 항목 | 코드 경로 | Figma 경로/명칭 | 비고 |
|------|----------|----------------|------|
| 서면 작성 에디터 | `/case-list/editor` | 서면 작성 > 서면 작성 (별도 라우트) | 코드에서는 `/case-list/editor`가 독립 라우트이면서 `/case-list?tab=editor`에서도 에디터 진입 가능 — 중복 진입 경로 |

---

## 4. 동적 경로 플레이스홀더 사용 항목

| 시나리오ID | 경로 | 플레이스홀더 | 실제 값 (pipeline_config.md) |
|-----------|------|------------|------------------------------|
| SCR-25 | `/evidence/pdf/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-26 | `/evidence/case-viewer/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-27 | `/evidence/case-tap/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-28 | `/evidence/summary/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-29 | `/evidence/summaryPdf/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-30 | `/evidence/text/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
| SCR-31 | `/case-list?civil_case_id=...` | CIVIL_CASE_ID | `ccase_01KJ9BX7N9407DKCQ2SMNT6XC8` |
| SCR-32 | `/case-list?project_id=...` | PROJECT_ID | `prj_01KJ9BX7GMEGDP0XARME8DR3RG` |
| SCR-33 | `/demo-viewer/:evidenceId` | SAMPLE_DEMO_ID | 코드에만 있는 경로, 테스트 데이터 없음 — 플레이스홀더 사용 |
| SCR-34 | `/admin/evidence/pdf/:evidenceId` | DOCUMENT_ID | `cdoc_01KK089FYR0HD07J1580F1VXPD` |
