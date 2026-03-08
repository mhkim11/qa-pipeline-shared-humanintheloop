# 기획서 초안 (spec_draft.md)

> RUN_ID: 2603082313
> 생성일시: 2026-03-08 23:13
> 기반 소스: softplant-shk-evidence-frontend-b8982d297de8 / Figma BD1dtm9YOZJmMOlqm5eaQA

---

## 서비스 개요

**AiLex** — AI 기반 법률 증거 관리 및 서면 작성 플랫폼 (민사 사건 특화)

- 변호사/법률 사무소가 민사 사건의 기록 문서, 의뢰인 자료를 관리하고 AI 보조로 준비서면을 작성하는 SaaS
- 사용자 역할: 일반 사용자(변호사), 어드민(관리자)
- 스테이징 URL: https://staging.ailex.co.kr

---

## 화면 목록 및 라우팅 구조

### 비로그인 영역 (logoutRouter)

| 화면명 | 경로 | 주요 기능 |
|--------|------|-----------|
| 로그인 | / | 이메일/비밀번호 로그인 |
| 회원가입 | /register | 이메일·사무소 정보 입력 가입 |
| 회원가입 인증 | /register/certify | 이메일 인증 코드 확인 |
| 이용약관 | /terms | 이용약관 열람 |
| 개인정보처리방침 | /policy | 개인정보처리방침 |
| 아이디 찾기 | /find_id | 아이디 찾기 |
| 아이디 인증 | /id_certify | 아이디 인증 |
| 아이디 표시 | /show_id | 찾은 아이디 표시 |
| 비밀번호 재설정 | /reset_password | 비밀번호 재설정 |
| 회원가입 이메일 | /register_email | 이메일 입력 단계 |
| 회원가입 비밀번호 | /register_pw | 비밀번호 설정 단계 |
| 사무소 이름 등록 | /register_office | 사무소 이름 입력 |
| 마케팅 동의 | /register_marketing | 마케팅 수신 동의 |
| 가입 완료 | /register_complete | 가입 완료 안내 |
| 인증 실패 | /auth_failed | 인증 실패 안내 |
| 인증 완료 | /certify_complete | 인증 완료 안내 |
| 증거 요청 | /evidence-request | 외부 의뢰인 증거 제출 요청 수신 |
| 데모 | /demo | 비회원 데모 (증거 목록 탐색) |
| 데모 뷰어 | /demo-viewer/:evidenceId | 비회원 증거 문서 뷰어 |
| 데모 요약 PDF | /demo-summary-pdf/:evidenceId | 비회원 요약 PDF 뷰어 |

### 로그인 영역 — 일반 사용자 (userRouter)

| 화면명 | 경로 | 주요 기능 | 탭 구조 |
|--------|------|-----------|---------|
| 홈 (사건목록) | / | 사건 목록 표시, 사건 선택 진입 | - |
| 민사 사건 메인 | /case-list | 사건별 기록·문서 관리 허브 | 기록 목록(list) / 자료 요청(client_request) / 전체 자료(client_list) / 서면 작성(editor) / 권한관리(authority) |
| 서면 작성 에디터 | /case-list/editor | AI 보조 준비서면 작성·편집 | - |
| 증거 목록 | /evidence/list | 증거 문서 목록 조회 및 검색 | - |
| 증거 검색 | /evidence/search | 증거 문서 검색 (파워서치) | - |
| 증거 PDF 뷰어 | /evidence/pdf/:evidenceId | PDF 형태 증거 문서 열람 | - |
| 케이스 뷰어 | /evidence/case-viewer/:evidenceId | 사건 문서 통합 뷰어 | - |
| 케이스 탭 뷰어 | /evidence/case-tap/:evidenceId | 탭 형태 문서 뷰어 | - |
| 요약 텍스트 뷰어 | /evidence/summary/:evidenceId | AI 요약 텍스트 열람 | - |
| 요약 PDF 뷰어 | /evidence/summaryPdf/:evidenceId | AI 요약 PDF 열람 | - |
| 텍스트 뷰어 | /evidence/text/:evidenceId | OCR 텍스트 열람 | - |
| AI | /ai | AI 문서 분석·질의응답 | - |
| 설정 | /settings | 계정·알림 설정 | - |
| 알림 | /notifications | 알림 목록 | - |
| 메모 | /memo | 메모 목록·관리 | - |
| 결제 관리 | /payment | 결제 수단·이력 관리 | - |
| 구독 관리 | /subscription | 구독 플랜·상태 관리 | - |
| 결제 성공 | /billing/success | 결제 성공 안내 | - |
| 결제 실패 | /billing/fail | 결제 실패 안내 | - |

### 로그인 영역 — 어드민 (adminRouter)

| 화면명 | 경로 | 주요 기능 |
|--------|------|-----------|
| 어드민 홈 | / | 관리자 메인 대시보드 |
| 어드민 증거 PDF | /admin/evidence/pdf/:evidenceId | 관리자 PDF 뷰어 |
| 어드민 증거 텍스트 | /admin/evidence/text/:evidenceId | 관리자 OCR 뷰어 |
| 어드민 문서 PDF | /admin/evidence-document/pdf/:evidenceId | 관리자 문서 PDF |
| 어드민 문서 텍스트 | /admin/evidence-document/text/:evidenceId | 관리자 문서 텍스트 |
| 어드민 사용자 증거 미리보기 | /admin/evidence-preview | 사용자 증거목록 미리보기 |
| 어드민 AI 미리보기 | /admin/ai-preview | AI 화면 미리보기 |

---

## 화면별 주요 기능 상세

### 민사 사건 메인 (/case-list) — 탭 구조

#### 탭 1: 기록 목록 (tab=list)
- 사건 문서 목록 테이블 (CaseMainListTable)
- 문서 상세 펼치기 (CaseDetailListTable)
- 키워드 검색, 파워검색, 컬럼 헤더 필터
- 문서 클릭 → 뷰어 전환
- 하이라이트 드래그앤드랍

#### 탭 2: 자료 요청 (tab=client_request)
- 의뢰인에게 자료 제출 요청 (CaseRequestListTable)
- 요청 메시지 작성·발송
- 이메일 추가/삭제
- 첨부 파일 포함 요청 가능

#### 탭 3: 전체 자료 (tab=client_list)
- 의뢰인이 제출한 자료 목록 (CaseRequestDocumentListTable)
- 문서 검색
- 기타 자료 직접 제출하기 (파일 업로드)

#### 탭 4: 서면 작성 (tab=editor)
- 준비서면 목록 조회 (문서 작성 - 목록)
- 새 서면 생성 (AI 보조)
- 서면 작성 에디터 진입 (/case-list/editor)

#### 탭 5: 권한 관리 (tab=authority)
- 프로젝트 구성원 권한 설정 (CaseAuthorityTable)

### 서면 작성 에디터 (/case-list/editor)
- TinyMCE 기반 리치텍스트 에디터
- 증거 첨부 패널 (드래그앤드랍)
- 기록 목록에서 하이라이트·문서 드랍
- 의뢰인 자료에서 드랍
- 버전 기록 열람·복원
- 검토 요청 발송 (검토자 지정, 메시지 작성)
- 목차 열기/닫기
- 메모 추가·수정·삭제
- 문서 다운로드 (DOCX 등)
- 문서 이름 변경
- 문서 삭제
- 제출 정보 입력 (제출일, 담당 변호사 등)
- 증명 방법 명세 관리

### 파일 업로드 기능 목록 (코드 분석)

| 업로드 기능 | API 엔드포인트 | 파일 형식 | 위치 |
|------------|---------------|----------|------|
| 증거 파일 업로드 | POST /evidence/upload (TUploadFileInput) | PDF 등 | 증거 목록 |
| 민사 사건 문서 업로드 | fetchUploadDocument (multipart) | PDF | 기록 목록 |
| 의뢰인 기타 자료 제출 | case-api/request-api FormData | PDF/기타 | 전체 자료 탭 |
| 클리핑 파일 첨부 | cliping-api multipart/form-data | - | 서면 작성 |
| 어드민 증거 업로드 | /admin/project/evidence/upload | PDF | 어드민 |
| 어드민 매칭 업로드 | /admin/project/matching/upload | - | 어드민 |
| 어드민 요약 업로드 | /admin/project/summary/upload | - | 어드민 |
| 어드민 원본 파일 업로드 | /admin/project/file/original/upload | - | 어드민 |
| 사용자 프로필 사진 | fetchUpdateUserPhoto (multipart) | 이미지 | 설정 |

---

## Figma 화면 목록 (v2.3 하이라이팅 페이지 기준)

| 피그마 프레임 파일명 | 화면 설명 |
|---------------------|-----------|
| 기록목록_검색결과.png | 기록 목록 키워드 검색 결과 화면 |
| 전체자료_탭.png | 의뢰인 전체 자료 탭 |
| 자료요청_탭.png | 의뢰인 자료 요청 탭 |
| 의뢰인_제출화면.png | 의뢰인 자료 제출 화면 |
| 기타자료_제출하기.png | 기타 자료 제출 모달 |
| 문서작성_목록.png | 서면 목록 (준비서면 목록) |
| 문서작성_문서생성.png | 새 서면 생성 화면 |
| 서면작성_검토요청.png | 서면 작성 — 검토 요청 패널 |
| 서면작성_증거첨부.png | 서면 작성 — 증거 첨부 패널 |
| 서면작성.png | 서면 작성 에디터 메인 |
| 문서이름바꾸기_모달.png | 문서 이름 바꾸기 모달 |
| 다운로드_모달.png | 문서 다운로드 모달 |

---

## 사용자 플로우

### 핵심 플로우 1: 사건 기록 관리
로그인 → 홈(사건 목록) → 사건 선택 → /case-list?tab=list → 문서 클릭 → 뷰어(PDF/텍스트) → 하이라이트 작성

### 핵심 플로우 2: 의뢰인 자료 요청
로그인 → /case-list → 자료 요청 탭(client_request) → 요청 생성(이메일 입력, 메시지 작성, 자료명 지정) → 발송 → /case-list?tab=client_list에서 제출 자료 확인

### 핵심 플로우 3: 준비서면 작성
로그인 → /case-list?tab=editor → 새 서면 생성 → /case-list/editor → 기록 목록·의뢰인 자료 드래그앤드랍으로 증거 첨부 → 텍스트 작성 → 검토 요청 → 다운로드

### 핵심 플로우 4: 파일 업로드 (증거 등록)
로그인 → /case-list?tab=list → 문서 업로드 버튼 → PDF 파일 선택 → multipart POST → 업로드 완료 → 목록 갱신

### 핵심 플로우 5: 의뢰인 기타 자료 제출
의뢰인 수신 이메일 링크(/evidence-request) → 자료 제출 화면 → 파일 선택·이름 작성 → 제출

---

## 샘플 PDF 분석 반영

**sample_file.pdf**: Claude Code 사용 가이드 (파이프라인 설정 문서, 4페이지)

- 문서 구조: 제목-섹션-코드블록-테이블 혼재
- 한글·영문 혼합 텍스트
- 코드 블록 내 특수문자 포함 (=, !, /, ~, .)
- 테이블: 2~3컬럼, 셀 내 개행 없음
- 빈 필드 없음, 모든 항목 채워진 완성 문서
- 파일 크기: 199.1KB (4페이지 기준 소용량)

**QA 시나리오 반영 항목:**
- 엣지케이스: 한글 파일명 포함 PDF 업로드, 특수문자가 포함된 문서명
- 실제 파일 크기 기반 업로드 테스트: 200KB 이하 정상 케이스
- 파이프라인 설정 문서처럼 코드블록·테이블 포함 문서의 파싱 결과 확인
