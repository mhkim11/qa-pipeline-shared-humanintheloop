# 기획서 초안 (spec_draft)

> RUN_ID: 2603082329 | 생성일시: 2026-03-08 23:29
> 소스: softplant-shk-evidence-frontend-b8982d297de8 (프론트엔드 코드) + Figma v2.3 하이라이팅 페이지

---

## 서비스 개요

AiLex는 법률 사무소를 위한 증거 관리 및 서면 작성 지원 SaaS 서비스입니다.
변호사(사용자)가 사건별 증거 문서를 업로드·열람하고, AI 분석 결과를 바탕으로 서면을 작성하며,
의뢰인에게 자료를 요청하는 워크플로우를 제공합니다.

---

## 라우터 구조 요약

### logoutRouter (비로그인 상태)

| 경로 | 컴포넌트 | 화면명 |
|------|----------|--------|
| `/` | LoginPage | 로그인 |
| `/terms` | TermsPage | 이용약관 |
| `/register` | RegisterPage | 회원가입 (약관동의) |
| `/register/certify` | RegisterCertifyPage | 회원가입 (본인인증) |
| `/register_email` | EmailPassPage | 이메일 인증 |
| `/register_pw` | RegisterPwPage | 비밀번호 설정 |
| `/register_office` | OfficeNamePage | 사무소명 입력 |
| `/register_complete` | RegisterCompletePage | 회원가입 완료 |
| `/register_marketing` | RegisterMarketingPage | 마케팅 동의 |
| `/find_id` | FindIdPage | 아이디 찾기 |
| `/id_certify` | IdCertifyPage | 아이디 찾기 본인인증 |
| `/show_id` | ShowIdPage | 아이디 확인 |
| `/reset_password` | RePwPage | 비밀번호 재설정 |
| `/auth_failed` | AuthFailedPage | 인증 실패 |
| `/certify_complete` | CertifyCompletePage | 인증 완료 |
| `/evidence-request` | EvidenceRequestPage | 증거 제출 요청 (의뢰인용) |
| `/policy` | PolicyPage | 개인정보처리방침 |
| `/demo` | EvidenceDemoMainPage | 데모 메인 |
| `/demo-viewer/:evidenceId` | EvidenceDemoViewerPage | 데모 문서 뷰어 |
| `/demo-summary-pdf/:evidenceId` | EvidenceDemoSummaryPdfPage | 데모 요약 PDF |
| `/demo-table` | EvidenceDemoTable | 데모 테이블 |
| `/demo-history` | DemoHistoryTable | 데모 히스토리 |
| `/demo-authority` | DemoAuthorityTable | 데모 권한 |
| `/demo-ai` | DemoAIPage | 데모 AI |
| `/event-signup-ailex-authentication` | ResRegisterPage | 이벤트 회원가입 |
| `/graph` | GraphPageTest | 그래프 테스트 |
| `/xmind` | XMindGraph | 마인드맵 |

### userRouter (일반 사용자 로그인 상태)

| 경로 | 컴포넌트 | 화면명 |
|------|----------|--------|
| `/` | HomePage | 홈 (증거 목록 메인) |
| `/case-list` | CaseEvidenceHomePage | 민사 사건 — 기록 목록 탭 |
| `/case-list?tab=client_request` | CaseEvidenceHomePage | 민사 사건 — 자료 요청 탭 |
| `/case-list?tab=client_list` | CaseEvidenceHomePage | 민사 사건 — 전체 자료 탭 |
| `/case-list?tab=editor` | CaseEvidenceHomePage | 민사 사건 — 서면 작성 탭 |
| `/case-list/editor` | CaseDocumentEditorPage | 서면 작성 에디터 |
| `/evidence/list` | EvidenceMainPage | 증거 목록 |
| `/evidence/search` | EvidenceMainPage | 증거 검색 |
| `/evidence/pdf/:evidenceId` | EvidenceViewer | 증거 PDF 뷰어 |
| `/evidence/case-viewer/:evidenceId` | CaseViewerPage | 사건 문서 뷰어 |
| `/evidence/case-tap/:evidenceId` | CaseTapPage | 사건 탭 뷰어 |
| `/evidence/summary/:evidenceId` | EvidenceSummaryViewer | 요약 텍스트 뷰어 |
| `/evidence/summaryPdf/:evidenceId` | EvidenceSummaryPdfPage | 요약 PDF 뷰어 |
| `/evidence/text/:evidenceId` | EvidenceTextViewer | 텍스트 뷰어 |
| `/settings` | SettingPage | 세팅 |
| `/notifications` | NotificationPage | 알림 |
| `/payment` | PaymentPage | 결제관리 |
| `/subscription` | SubscriptionPage | 구독관리 |
| `/memo` | MemoPage | 메모관리 |
| `/ai` | AIPage | AI 분석 |
| `/billing/success` | BillingSuccessPage | 결제 성공 |
| `/billing/fail` | BillingFailPage | 결제 실패 |

### adminRouter (어드민 로그인 상태)

| 경로 | 컴포넌트 | 화면명 |
|------|----------|--------|
| `/` | AdminHomePage | 어드민 메인 |
| `/admin/evidence/pdf/:evidenceId` | AdminEvidenceViewer | 어드민 증거 PDF 뷰어 |
| `/admin/evidence/text/:evidenceId` | AdminEvidenceTextViewer | 어드민 증거 OCR 뷰어 |
| `/admin/evidence-document/pdf/:evidenceId` | AdminViewer | 어드민 문서 PDF 뷰어 |
| `/admin/evidence-document/text/:evidenceId` | AdminTextViewer | 어드민 문서 텍스트 뷰어 |
| `/admin/evidence-preview` | EvidencePreviewPage | 사용자 증거목록 미리보기 |
| `/admin/ai-preview` | AIPreviewPage | AI화면 미리보기 |
| `/admin/evidence-preview/pdf/:evidenceId` | EvidenceViewer | 사용자 문서 미리보기 |
| `/admin/evidence-preview/text/:evidenceId` | EvidenceTextViewer | 사용자 문서 텍스트 미리보기 |
| `/admin/evidence-preview/summaryPdf/:evidenceId` | EvidenceSummaryPdfPage | 사용자 요약PDF 미리보기 |
| `/pdf/:evidenceId` | EvidenceViewer | 어드민 PDF 직접 뷰어 |
| `/summary/:evidenceId` | EvidenceSummaryViewer | 어드민 요약 뷰어 |
| `/summaryPdf/:evidenceId` | EvidenceSummaryPdfPage | 어드민 요약 PDF 뷰어 |

---

## 화면별 상세 기획

### 1. 로그인 화면 (`/`)
- **컴포넌트**: LoginPage
- **주요 기능**:
  - 이메일 + 비밀번호 입력 폼 (react-hook-form + zod 유효성 검사)
  - 아이디 저장 기능 (localStorage)
  - 비밀번호 표시/숨김 토글
  - 이메일 존재 여부 실시간 체크 (비밀번호 필드 포커스 시 API 호출)
  - 로그인 버튼
  - 아이디 찾기 / 비밀번호 재설정 링크
  - 회원가입 링크
- **사용자 플로우**: 이메일 입력 → 비밀번호 입력 → 로그인 클릭 → 홈 이동

### 2. 회원가입 화면 (`/register` ~ `/register_complete`)
- **컴포넌트**: RegisterPage → RegisterCertifyPage → EmailPassPage → RegisterPwPage → OfficeNamePage → RegisterCompletePage
- **주요 기능**:
  - 약관 동의 (서비스 이용약관, 개인정보처리방침, 마케팅 동의)
  - NICE 본인인증 (SMS, 팝업/리다이렉트)
  - 이메일 등록 및 비밀번호 설정
  - 사무소명 입력
  - 가입 완료 처리
- **특이사항**: 24시간 내 5회 이상 인증 시도 시 차단

### 3. 홈 화면 (`/`) — userRouter
- **컴포넌트**: HomePage
- **주요 기능**: 증거 목록(EvidenceTable), 히스토리(HistoryTable), 권한관리(AuthorityTable), 세팅(SettingTable), 결제(PaymentTable), 구독(SubscriptionTable), AI(AIPage) 탭 전환
- **URL 파라미터**: `?active=authority|payment|setting|subscription`

### 4. 민사 사건 화면 (`/case-list`)
- **컴포넌트**: CaseEvidenceHomePage
- **탭 구성**:
  - `tab=list`: 기록 목록 — 사건 문서 목록 조회, 문서 클릭 시 상세 보기
  - `tab=client_request`: 자료 요청 — 의뢰인에게 자료 요청 목록
  - `tab=client_list`: 전체 자료 — 의뢰인이 제출한 전체 자료
  - `tab=editor`: 서면 작성 — 서면 문서 목록 및 작성
  - `authority`: 권한 관리 — 사이드바 아이콘으로 접근
- **필수 파라미터**: `civil_case_id` 또는 `project_id`
- **사이드바**: 기록 목록, 의뢰인 자료(자료 요청/전체 자료), 서면 작성

### 5. 서면 작성 에디터 (`/case-list/editor`)
- **컴포넌트**: CaseDocumentEditorPage → DocumentEditorView
- **주요 기능**: TinyMCE 에디터 기반 서면 작성, 검토 요청, 증거 첨부(드래그앤드롭), 버전 기록, 디테일 수정, 목차 관리, 메모
- **파생 화면**: 서면 생성, 이름 바꾸기 모달, 다운로드 모달

### 6. 증거 목록 화면 (`/evidence/list`)
- **컴포넌트**: EvidenceMainPage
- **주요 기능**: 증거 문서 목록, 파일 업로드(PDF 전용, 500MB 제한), 검색, 필터, 정렬, 다운로드
- **파일 업로드 제한**: PDF만 허용, 500MB 이하, HWP/HWPX 차단

### 7. 증거 PDF 뷰어 (`/evidence/pdf/:evidenceId`)
- **컴포넌트**: EvidenceViewer
- **주요 기능**: PDF 렌더링, 하이라이트, 텍스트 검색, 인쇄

### 8. 사건 문서 뷰어 (`/evidence/case-viewer/:evidenceId`)
- **컴포넌트**: CaseViewerPage
- **주요 기능**: 민사 사건 문서 PDF/텍스트 뷰어, 텍스트 모달, 인쇄

### 9. AI 분석 화면 (`/ai`)
- **컴포넌트**: AIPage
- **주요 기능**: project_id 기반 AI 분석 메뉴 조회, 카테고리별 메뉴 선택, HTML/MD 파일 렌더링

### 10. 세팅 화면 (`/settings`)
- **컴포넌트**: SettingPage → SettingTable
- **주요 기능**: 사용자 설정(폰트 크기 등)

### 11. 알림 화면 (`/notifications`)
- **컴포넌트**: NotificationPage → NotificationTable
- **주요 기능**: 알림 목록 조회

### 12. 결제관리 화면 (`/payment`)
- **컴포넌트**: PaymentPage → PaymentTable
- **주요 기능**: 결제 내역 조회, 결제 수단 관리

### 13. 구독관리 화면 (`/subscription`)
- **컴포넌트**: SubscriptionPage → SubscriptionTable
- **주요 기능**: 구독 플랜 조회·변경

### 14. 메모관리 화면 (`/memo`)
- **컴포넌트**: MemoPage
- **주요 기능**: 현재 빈 컴포넌트(미구현), 추후 메모 관리 기능 예정

### 15. 어드민 메인 (`/`) — adminRouter
- **컴포넌트**: AdminHomePage
- **주요 기능**: 어드민 전용 대시보드, 증거 목록 관리

### 16. 의뢰인 자료 제출 화면 (`/evidence-request`) — logoutRouter
- **컴포넌트**: EvidenceRequestPage
- **주요 기능**: 로그인 없이 의뢰인이 자료 제출 가능, 파일 첨부 (PDF/DOC/DOCX/이미지, 500MB 제한, HWP 불가)

---

## 파일 업로드 규칙 (코드 분석)

| 항목 | 증거 목록 (`/evidence`) | 의뢰인 자료 제출 (`/evidence-request`) |
|------|------------------------|---------------------------------------|
| 허용 형식 | PDF만 | PDF, DOC, DOCX, 이미지(png/jpg/jpeg/webp/gif/bmp/tif/tiff/heic) |
| 차단 형식 | HWP, HWPX | HWP, HWPX |
| 최대 크기 | 500MB | 500MB |
| 다중 업로드 | 가능 | 가능 |

---

## Figma 화면 목록 (v2.3 하이라이팅 페이지)

| 파일명 | Figma 프레임명 | 대응 코드 화면 |
|--------|---------------|---------------|
| `기록목록_검색결과.png` | 기록목록 검색 결과 | /case-list?tab=list |
| `전체자료_탭.png` | 전체 자료 탭 | /case-list?tab=client_list |
| `자료요청_탭.png` | 자료 요청 탭 | /case-list?tab=client_request |
| `의뢰인_제출화면.png` | 의뢰인 제출 화면 | /evidence-request |
| `기타자료_제출하기.png` | 기타자료 제출하기 | /evidence-request (파일 첨부 모달) |
| `문서작성_목록.png` | 문서 작성 - 목록 | /case-list?tab=editor |
| `문서작성_문서생성.png` | 문서 작성 - 문서 생성 | /case-list?tab=editor |
| `서면_생성하기.png` | 서면 생성하기 | /case-list/editor |
| `서면작성_검토요청.png` | 서면 작성 > 검토 요청 | /case-list/editor |
| `서면작성_증거첨부.png` | 서면 작성 > 증거 첨부 | /case-list/editor |
| `문서이름바꾸기_모달.png` | 문서 이름 바꾸기 모달 | /case-list/editor (모달) |
| `다운로드_모달.png` | 다운로드 모달 | /case-list/editor (모달) |
| `서면작성_디테일수정.png` | 서면 작성 > 디테일 수정 | /case-list/editor |
| `서면작성_버전기록.png` | 서면 작성 > 버전기록 | /case-list/editor |
| `자료목록_탭.png` | 자료 목록 탭 | /case-list?tab=client_list |
| `서면작성_메인.png` | 서면 작성 | /case-list/editor |
| `문서뷰어_컨테이너.png` | Document Viewer Container | /evidence/case-viewer/:evidenceId |
| `하이라이트_요청하기.png` | 하이라이트로 요청하기 | /case-list?tab=editor |
