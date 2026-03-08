# 불일치 리포트 (mismatch_report.md)

> RUN_ID: 2603082313
> 생성일시: 2026-03-08 23:13

---

## Figma API 상태

- **상태**: 정상 (전체 성공)
- Figma 파일키: BD1dtm9YOZJmMOlqm5eaQA
- 사용 페이지: v2.3 하이라이팅
- 다운로드 프레임 수: 12개
- 429 발생: 없음

---

## 코드에만 있고 Figma에 없는 화면

| 시나리오ID | 화면 설명 | 판단 근거 |
|-----------|-----------|-----------|
| SCR-00 | 로그인 — LoginPage 컴포넌트, POST /api/auth/login 호출 | 로그인 페이지 피그마 프레임 없음. 코드 기준 시나리오 생성 |
| SCR-01 | 홈(사건목록) — HomePage 컴포넌트, GET /projects 호출 | 홈 화면 전용 피그마 프레임 없음. 코드 기준 시나리오 생성 |
| SCR-02 | 회원가입 — RegisterPage, POST /api/auth/register | 피그마에 회원가입 전용 화면 없음 |
| SCR-10 | AI — AIPage 컴포넌트, /ai 경로 | 피그마 v2.3에 AI 화면 미포함 |
| SCR-11 | 설정 — SettingPage 컴포넌트, /settings | 피그마 v2.3에 설정 화면 미포함 |
| SCR-12 | 알림 — NotificationPage 컴포넌트, /notifications | 피그마 v2.3에 알림 화면 미포함 |
| SCR-13 | 메모 — MemoPage 컴포넌트, /memo | 피그마 v2.3에 메모 전용 화면 미포함 |
| SCR-14 | 결제 관리 — PaymentPage 컴포넌트, /payment | 피그마 v2.3에 결제 화면 미포함 |
| SCR-15 | 구독 관리 — SubscriptionPage 컴포넌트, /subscription | 피그마 v2.3에 구독 화면 미포함 |
| SCR-16 | 데모 — EvidenceDemoMainPage, /demo | 피그마 v2.3에 데모 화면 미포함 |
| SCR-17 | 증거 PDF 뷰어 — EvidenceViewer, /evidence/pdf/:evidenceId | 피그마에 뷰어 UI 상세 화면 없음 |
| SCR-18 | 케이스 뷰어 — CaseViewerPage, /evidence/case-viewer/:evidenceId | 피그마에 해당 화면 없음 |
| SCR-19 | 케이스 탭 뷰어 — CaseTapPage, /evidence/case-tap/:evidenceId | 피그마에 해당 화면 없음 |
| SCR-20 | 요약 텍스트 뷰어 — EvidenceSummaryViewer, /evidence/summary/:evidenceId | 피그마에 해당 화면 없음 |
| SCR-21 | 요약 PDF 뷰어 — EvidenceSummaryPdfPage, /evidence/summaryPdf/:evidenceId | 피그마에 해당 화면 없음 |
| SCR-22 | 텍스트 뷰어 — EvidenceTextViewer, /evidence/text/:evidenceId | 피그마에 해당 화면 없음 |

---

## Figma에만 있고 코드에 없는 화면

> v2.3 하이라이팅 페이지 기준으로, 코드에서 대응되는 페이지가 확인되지 않은 피그마 전용 프레임

| 피그마 프레임 파일명 | 설명 | 판단 |
|---------------------|------|------|
| — | v2.3 하이라이팅 페이지의 모든 주요 FRAME들은 코드 기능과 대응됨 | 미구현 화면 없음 |

- 피그마의 "서면 작성 > 서면 생성", "서면 작성 > 검토 요청", "서면 작성 > 증거 첨부", "서면 작성 > 버전기록" 섹션들은 모두 `/case-list/editor` (CaseDocumentEditorPage)의 서브 기능으로 대응됨

---

## 동적 경로 ID 플레이스홀더 목록

| 경로 | 사용 플레이스홀더 | 대응 테스트 데이터 |
|------|----------------|----------------|
| /case-list?civil_case_id=... | ccase_01KJ9BX7N9407DKCQ2SMNT6XC8 | pipeline_config.md CIVIL_CASE_ID |
| /case-list?project_id=... | prj_01KJ9BX7GMEGDP0XARME8DR3RG | pipeline_config.md PROJECT_ID |
| /evidence/pdf/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /evidence/case-viewer/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /evidence/case-tap/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /evidence/summary/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /evidence/summaryPdf/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /evidence/text/:evidenceId | cdoc_01KK089FYR0HD07J1580F1VXPD | pipeline_config.md DOCUMENT_ID |
| /admin/evidence/pdf/:evidenceId | SAMPLE_EVIDENCE_ID | pipeline_config.md에 어드민 전용 evidenceId 없음 → 플레이스홀더 |
| /admin/evidence/text/:evidenceId | SAMPLE_EVIDENCE_ID | 동일 |
| /demo-viewer/:evidenceId | SAMPLE_DEMO_EVIDENCE_ID | 데모용 ID 없음 → 플레이스홀더 |

---

## 기타 특이사항

- Figma 파일에는 로그인/회원가입 화면 프레임이 없어 코드만으로 시나리오 생성
- `v2.3 하이라이팅` 페이지가 현재 개발 기준 최신 디자인 페이지로 판단됨
- `✅ Final Release` 페이지에는 "문서뷰어 패널 헤더 인터렉션 정리" 섹션 1개만 존재
- 데모 화면(/demo, /demo-viewer, /demo-summary-pdf)은 비로그인 접근 가능하나 피그마에 미포함 — 코드 기준으로만 시나리오 생성
- 결제/구독 관련 화면(payment, subscription)은 NicePay 연동이 있으나 피그마 미포함 — P2 시나리오로 처리
