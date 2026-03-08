# 기획서 초안 (spec_draft.md)

> 생성일: 2026-03-08 | RUN_ID: 2603082245
> 소스: 프론트엔드 코드(router.tsx + 페이지 컴포넌트) + Figma(AiLex Copy — ⭐️ 최종 디자인)

---

## 서비스 개요

**AiLex** — AI 기반 법률 증거 관리 및 서면 작성 플랫폼
- 로펌·변호사가 민사/형사 사건의 증거 문서를 업로드·관리하고, AI를 활용해 서면을 작성하는 SaaS 서비스
- 스테이징 서버: https://staging.ailex.co.kr
- 사용자 역할: 일반 사용자(USER), 관리자(ADMIN)

---

## 화면 목록 및 경로

### [로그아웃 상태] 공개 화면

| 화면명 | 경로 | 컴포넌트 | 설명 |
|--------|------|----------|------|
| 로그인 | `/` | LoginPage | 이메일/비밀번호 로그인, 초기 진입점 |
| 회원가입 | `/register` | RegisterPage | 이메일 인증 기반 회원가입 |
| 회원가입 인증 | `/register/certify` | RegisterCertifyPage | 이메일 인증 코드 입력 |
| 이메일 입력 | `/register_email` | EmailPassPage | 이메일 확인 |
| 비밀번호 설정 | `/register_pw` | RegisterPwPage | 비밀번호 등록 |
| 사무소명 등록 | `/register_office` | OfficeNamePage | 사무소/법인명 입력 |
| 회원가입 완료 | `/register_complete` | RegisterCompletePage | 가입 완료 안내 |
| 마케팅 동의 | `/register_marketing` | RegisterMarketingPage | 마케팅 수신 동의 |
| 이용약관 | `/terms` | TermsPage | 서비스 이용약관 |
| 개인정보처리방침 | `/policy` | PolicyPage | 개인정보 처리방침 |
| 아이디 찾기 | `/find_id` | FindIdPage | 이메일로 아이디 조회 |
| 아이디 인증 | `/id_certify` | IdCertifyPage | 아이디 찾기 인증 |
| 아이디 표시 | `/show_id` | ShowIdPage | 찾은 아이디 표시 |
| 비밀번호 재설정 | `/reset_password` | RePwPage | 비밀번호 재설정 |
| 인증 완료 | `/certify_complete` | CertifyCompletePage | 본인인증 완료 |
| 인증 실패 | `/auth_failed` | AuthFailedPage | 인증 실패 안내 |
| 증거 요청 | `/evidence-request` | EvidenceRequestPage | 외부 사용자 증거 제출 링크 |
| 이벤트 회원가입 | `/event-signup-ailex-authentication` | ResRegisterPage | 이벤트 초대 회원가입 |
| 데모 메인 | `/demo` | EvidenceDemoMainPage | 비로그인 데모 화면 |
| 데모 PDF 뷰어 | `/demo-viewer/:evidenceId` | EvidenceDemoViewerPage | 데모 문서 뷰어 |
| 데모 요약 PDF | `/demo-summary-pdf/:evidenceId` | EvidenceDemoSummaryPdfPage | 데모 요약 PDF |

### [로그인 상태 — 일반 사용자] 주요 화면

| 화면명 | 경로 | 컴포넌트 | 탭/서브화면 | 설명 |
|--------|------|----------|------------|------|
| 홈 (증거목록) | `/` | HomePage → EvidenceListTable | - | 전체 프로젝트/사건 목록, 좌측 네비게이션 |
| 사건 목록 | `/case-list?civil_case_id={id}&project_id={id}&tab=list` | CaseEvidenceHomePage | tab=list | 민사 기록 목록 |
| 자료 요청 | `/case-list?...&tab=client_request` | CaseEvidenceHomePage | tab=client_request | 의뢰인 자료 요청 관리 |
| 전체 자료 | `/case-list?...&tab=client_list` | CaseEvidenceHomePage | tab=client_list | 의뢰인 제출 전체 자료 |
| 서면 작성 (탭) | `/case-list?...&tab=editor` | CaseEvidenceHomePage → CaseDocumentEditorWrapper | tab=editor | 사건 내 서면 목록 |
| 권한관리 | `/case-list?...&tab=authority` | CaseEvidenceHomePage → CaseAuthorityTable | tab=authority | 사건 접근 권한 관리 |
| 서면 작성 에디터 | `/case-list/editor?civil_case_id={id}&project_id={id}` | CaseDocumentEditorPage | - | AI 기반 서면 작성 에디터 (전체화면) |
| 증거 목록 | `/evidence/list` | EvidenceMainPage | - | 증거 문서 목록 검색/조회 |
| 증거 검색 | `/evidence/search` | EvidenceMainPage | - | 증거 문서 검색 |
| 증거 PDF 뷰어 | `/evidence/pdf/:evidenceId` | EvidenceViewer | - | PDF 문서 뷰어 (간편검색 포함) |
| 증거 케이스 뷰어 | `/evidence/case-viewer/:evidenceId` | CaseViewerPage | - | 사건별 문서 뷰어 |
| 증거 탭 뷰어 | `/evidence/case-tap/:evidenceId` | CaseTapPage | - | 탭 형태 문서 뷰어 |
| 증거 요약 텍스트 | `/evidence/summary/:evidenceId` | EvidenceSummaryViewer | - | 요약 텍스트 보기 |
| 증거 요약 PDF | `/evidence/summaryPdf/:evidenceId` | EvidenceSummaryPdfPage | - | 요약 PDF 보기 |
| 증거 텍스트 | `/evidence/text/:evidenceId` | EvidenceTextViewer | - | OCR 텍스트 뷰어 |
| AI 분석 | `/ai` | AIPage | - | AI 분석 결과 카테고리별 조회 |
| 설정 | `/settings` | SettingPage | - | 계정/사무소 설정 |
| 알림 | `/notifications` | NotificationPage | - | 알림 목록 |
| 메모 | `/memo` | MemoPage | - | 메모 관리 (미구현 — 빈 컴포넌트) |
| 결제 관리 | `/payment` | PaymentPage | - | 결제 수단 관리 |
| 구독 관리 | `/subscription` | SubscriptionPage | - | 플랜 구독 관리 |
| 결제 성공 | `/billing/success` | BillingSuccessPage | - | 결제 완료 안내 |
| 결제 실패 | `/billing/fail` | BillingFailPage | - | 결제 실패 안내 |

### [로그인 상태 — 관리자] ADMIN 전용 화면

| 화면명 | 경로 | 컴포넌트 | 설명 |
|--------|------|----------|------|
| 어드민 홈 | `/` | AdminHomePage | 어드민 메인 대시보드 |
| 어드민 증거 PDF | `/admin/evidence/pdf/:evidenceId` | AdminEvidenceViewer | 어드민 PDF 뷰어 |
| 어드민 증거 OCR | `/admin/evidence/text/:evidenceId` | AdminEvidenceTextViewer | 어드민 OCR 뷰어 |
| 어드민 문서 PDF | `/admin/evidence-document/pdf/:evidenceId` | AdminViewer | 어드민 문서 PDF 뷰어 |
| 어드민 문서 OCR | `/admin/evidence-document/text/:evidenceId` | AdminTextViewer | 어드민 문서 텍스트 뷰어 |
| 어드민 증거 미리보기 | `/admin/evidence-preview` | EvidencePreviewPage | 사용자 증거목록 미리보기 |
| AI 미리보기 | `/admin/ai-preview` | AIPreviewPage | AI화면 미리보기 |

---

## 화면 간 이동 경로 (주요 플로우)

### 1. 로그인 플로우
```
/ (로그인) → 로그인 성공 → / (홈 — EvidenceListTable)
/ (로그인) → 회원가입 링크 → /register → /register/certify → /register_email → /register_pw → /register_office → /register_complete
/ (로그인) → 아이디 찾기 → /find_id → /id_certify → /show_id
/ (로그인) → 비밀번호 재설정 → /reset_password
```

### 2. 사건 관리 플로우
```
/ (홈) → 사건 클릭 → /case-list?civil_case_id={id}&project_id={id}&tab=list
/case-list?tab=list → 기록 목록 탭 (CaseMainListTable)
/case-list?tab=list → 문서 클릭 → /case-list?tab=list&case_document_id={id} (CaseDetailListTable)
/case-list?tab=client_request → 의뢰인 자료 요청 탭
/case-list?tab=client_list → 전체 자료 탭
/case-list?tab=editor → 서면 작성 탭 (CaseDocumentEditorWrapper)
/case-list?tab=editor → 서면 편집 버튼 → /case-list/editor?civil_case_id={id}&project_id={id}
/case-list?tab=authority → 권한관리 탭
```

### 3. 증거 문서 뷰어 플로우
```
/evidence/list → 문서 클릭 → /evidence/pdf/{DOCUMENT_ID}
/evidence/pdf/{id} → 간편검색 버튼 → 텍스트 검색 모달 오버레이
/evidence/list → case-viewer → /evidence/case-viewer/{id}
/evidence/list → 요약 보기 → /evidence/summary/{id}
/evidence/list → 요약 PDF → /evidence/summaryPdf/{id}
```

### 4. AI 분석 플로우
```
/ (홈) → AI 메뉴 → /ai?project_id={PROJECT_ID}
/ai → 카테고리 선택 → 카테고리별 메뉴 목록 표시
/ai → 메뉴 항목 클릭 → 우측 콘텐츠 영역에 HTML/MD 파일 렌더링
```

### 5. 설정/결제 플로우
```
/ (홈) 또는 사이드바 → /settings (계정 설정)
/ (홈) → /notifications (알림)
/ (홈) → /payment (결제 관리)
/ (홈) → /subscription (구독 관리)
/payment → 결제 → /billing/success 또는 /billing/fail
```

---

## 주요 기능

### 증거 관리
- 증거 문서 업로드 (파일 형식 제한 미확인, PDF 포함)
- 증거 문서 목록 조회/검색
- PDF 뷰어 (PC: blob URL, 모바일: 서버 URL 직접 또는 Google Docs Viewer 폴백)
- OCR 텍스트 간편검색 (드래그 이동 가능한 플로팅 모달)
- 증거 요약 (텍스트/PDF)
- 의뢰인 증거 제출 요청 (링크 복사 방식, `/evidence-request`)

### 사건 관리 (case-list)
- 민사/형사 사건 등록 및 목록 조회
- 기록 목록 탭: 사건 문서 목록 및 상세 조회
- 자료 요청 탭: 의뢰인에게 자료 요청 관리
- 전체 자료 탭: 의뢰인 제출 자료 일괄 조회
- 서면 작성 탭 / 서면 작성 에디터: AI 기반 서면 생성 (TinyMCE 에디터 사용 추정)
- 권한관리: 사건 참여자 접근 권한 설정
- 좌측 사이드바 접기/펼치기

### AI 기능
- AI 분석 결과 카테고리별 메뉴 조회 (project_id 기반)
- HTML/Markdown 파일 렌더링 (DOMPurify sanitize 적용)
- 챗봇 (Figma 확인, 코드 내 별도 라우트 미확인 → 사건 화면 내 사이드패널로 추정)
- AI 클립핑 제안 (Figma 확인, 코드 내 증거목록 뷰어에 통합된 것으로 추정)

### 사용자/계정
- 이메일 기반 회원가입 (인증 코드)
- 아이디/비밀번호 찾기
- 설정 (계정, 사무소 정보)
- 알림 목록
- 결제/구독 관리

---

## 사용자 플로우 요약

```
[신규 사용자]
비로그인 → /register → 이메일 인증 → 비밀번호/사무소 설정 → 로그인 → 홈

[기존 사용자 — 핵심 업무 플로우]
로그인 → 홈(사건 목록) → 사건 선택 → 사건 화면(기록목록/자료요청/서면작성) → 서면 작성 에디터(AI 서면 생성)

[증거 문서 검토 플로우]
홈 → 증거 목록(/evidence/list) → PDF 뷰어(/evidence/pdf/{id}) → 간편검색 → 요약 보기

[AI 분석 플로우]
홈 → AI 분석(/ai) → 카테고리 선택 → 분석 리포트 열람

[외부 의뢰인]
증거 제출 링크 수신 → /evidence-request → 파일 업로드 제출
```

---

## Figma 화면 vs 코드 비교 요약

| Figma 섹션 | 코드 대응 | 비고 |
|------------|----------|------|
| 홈 | `/` — HomePage, EvidenceListTable | 일치 |
| AI 서면 생성 | `/case-list/editor` — CaseDocumentEditorPage | 일치 |
| 챗봇 | 별도 라우트 없음 — 사건 화면 내 통합 추정 | 코드 전용 라우트 미확인 |
| 클립핑 / AI 클립핑 제안 | 별도 라우트 없음 — 증거 뷰어 내 기능으로 추정 | 코드 전용 라우트 미확인 |
| 증거제출 요청 | `/evidence-request` — EvidenceRequestPage | 일치 |
| 사건목록 | `/case-list` — CaseEvidenceHomePage | 일치 |
| 사건 히스토리 | 별도 라우트 없음 — 사건 화면 내 탭 기능 추정 | 코드 확인 필요 |
| 설정 | `/settings` — SettingPage | 일치 |
| 알림 | `/notifications` — NotificationPage | 일치 |
| 메모 | `/memo` — MemoPage (빈 컴포넌트) | 미구현 |
| 결제/구독 | `/payment`, `/subscription` | Figma에 미확인 |
