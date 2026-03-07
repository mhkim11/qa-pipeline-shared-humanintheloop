# AiLex QA 정상 동작 정의서

> 생성일: 2026-03-07
> 제품명: AiLex (by A2D2)
> 스테이징: https://staging.ailex.co.kr
> Figma: BD1dtm9YOZJmMOlqm5eaQA (260307 R03)
> 코드: softplant-shk-evidence-frontend

---

## 테스트 환경

| 항목 | 값 |
|---|---|
| 스테이징 URL | https://staging.ailex.co.kr |
| 테스트 계정 | test2026@softplant.co.kr / softplant1234! |
| 민사 사건 ID | ccase_01KJ9BX7N9407DKCQ2SMNT6XC8 |
| 프로젝트 ID | prj_01KJ9BX7GMEGDP0XARME8DR3RG |
| 프로젝트명 | 민사 사건등록테스트 250225 |
| 의뢰인명 | 유슬기 |
| 문서 ID | cdoc_01KK089FYR0HD07J1580F1VXPD |

---

## 라우팅 구조 요약

### 비로그인 라우터

| 경로 | 화면명 |
|---|---|
| `/` | 로그인 |
| `/register` | 회원가입 |
| `/register/certify` | 이메일 인증 |
| `/find_id` | 아이디 찾기 (`?tab=pw` → 비밀번호 재설정 탭) |
| `/reset_password` | 비밀번호 재설정 |
| `/evidence-request` | 외부 증거 제출 요청 (공개) |
| `/terms` | 이용약관 |
| `/policy` | 개인정보 처리방침 |
| `/demo` | 데모 메인 |
| `/demo-viewer/:evidenceId` | 데모 PDF 뷰어 |

### 로그인 라우터 – 일반 사용자

| 경로 | 화면명 | 비고 |
|---|---|---|
| `/` | 홈 (사건목록) | EvidenceListTable |
| `/evidence/list` | 증거목록 | 탭: evidence/history/authority/setting/payment/subscription/ai |
| `/evidence/search` | 증거 검색 | |
| `/evidence/pdf/:evidenceId` | 증거 PDF 뷰어 | |
| `/evidence/text/:evidenceId` | 증거 OCR 뷰어 | |
| `/evidence/summary/:evidenceId` | 증거 요약 뷰어 | |
| `/evidence/summaryPdf/:evidenceId` | 증거 요약 PDF | |
| `/evidence/case-viewer/:evidenceId` | 클립핑 뷰어 | |
| `/case-list` | 민사 사건 | 탭: list/client_request/client_list/editor/authority |
| `/case-list/editor` | 서면 작성 에디터 | |
| `/memo` | 메모 관리 | |
| `/settings` | 설정 | |
| `/notifications` | 알림 | |
| `/payment` | 결제 관리 | |
| `/subscription` | 구독 관리 | |
| `/billing/success` | 결제 성공 | |
| `/billing/fail` | 결제 실패 | |
| `/ai` | AI 페이지 | |

### 로그인 라우터 – 어드민 (role === 'ADMIN')

| 경로 | 화면명 |
|---|---|
| `/` | 어드민 홈 |
| `/admin/evidence/pdf/:evidenceId` | 어드민 증거 PDF 뷰어 |
| `/admin/evidence/text/:evidenceId` | 어드민 OCR 뷰어 |
| `/admin/evidence-document/pdf/:evidenceId` | 어드민 문서 PDF 뷰어 |
| `/admin/evidence-document/text/:evidenceId` | 어드민 문서 OCR 뷰어 |
| `/admin/evidence-preview` | 사용자 증거목록 미리보기 |
| `/admin/ai-preview` | AI 화면 미리보기 |

---

## 화면별 정상 동작 정의

---

### SCR-00 로그인 (`/`)

**Figma 참조:** 없음 (이전 Figma 파일 기반)

#### 정상 상태 정의
- 이메일/비밀번호 입력 필드가 렌더링된다
- 두 필드 모두 입력 시 로그인 버튼이 활성(파란색 `#004AA4`)화된다
- 로그인 성공 시 accessToken이 저장되고 `/` (홈)으로 리다이렉트된다
- '아이디 저장' 체크 시 localStorage에 이메일이 저장되고 재방문 시 자동 입력된다
- 비밀번호 입력창 포커스 시 이메일 존재 여부를 API로 사전 확인한다

#### 의도된 제한사항
- 이메일 또는 비밀번호 미입력 시 로그인 버튼 비활성(회색) 유지
- 이메일 최대 255자, 비밀번호 최대 30자
- debounce 100ms 적용으로 중복 제출 방지

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 잘못된 비밀번호 | 토스트: '비밀번호가 일치하지 않습니다.' |
| 미가입 이메일 | 비밀번호 포커스 시 '가입되지 않은 이메일입니다. 회원가입을 진행해주세요.' |
| 네트워크 오류 | '이메일 확인 중 오류가 발생했습니다.' |

#### Manus 판단 기준
- **성공:** 로그인 클릭 후 URL이 `/` 홈으로 변경되고 사건목록 화면 렌더링
- **실패:** 로그인 화면 유지, 에러 없이 무반응

---

### SCR-10 민사사건 – 기록 목록 (`/case-list?tab=list`)

**Figma 참조:** `SCR-CASE-01_기록목록.png`, `SCR-CASE-02_기록목록_검색결과.png`
**스테이징 URL:** `https://staging.ailex.co.kr/case-list?civil_case_id=ccase_01KJ9BX7N9407DKCQ2SMNT6XC8&project_id=prj_01KJ9BX7GMEGDP0XARME8DR3RG&tab=list`

#### 정상 상태 정의
- 좌측 사이드바에 기록 목록 / 의뢰인 자료 / 서면 작성 탭이 표시된다
- 사건에 속한 문서 기록이 테이블 형태로 렌더링된다
- 컬럼 헤더 필터 아이콘 클릭 시 드롭다운 필터가 표시된다
- 행 클릭 시 우측에 문서 뷰어 패널이 열린다
- 사이드바 접기/펼치기(collapse)가 동작한다
- URL 파라미터(`civil_case_id`, `project_id`, `tab`)로 상태 복원이 된다

#### 의도된 제한사항
- `civil_case_id` 또는 `project_id` 없으면 빈 목록 또는 최상위 목록 표시
- 의뢰인 자료 탭은 `selectedCaseId`가 있어야 클릭 가능
- 레거시 파라미터 `client_hidden` → `client_list` 자동 변환

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 사건 미선택 후 의뢰인 자료 클릭 | 클릭 무반응 |
| 유효하지 않은 civil_case_id | 빈 목록 또는 에러 UI |
| 문서 없는 사건 | 빈 상태 UI |

#### Manus 판단 기준
- **성공:** 기록 목록 테이블이 렌더링되고 행 클릭 시 우측 뷰어 패널이 열림
- **실패:** 빈 화면, 뷰어 패널 미열림, URL 파라미터 변경 없음

---

### SCR-10 민사사건 – 문서 열람 뷰어

**Figma 참조:** `SCR-CASE-05_기록열람_뷰어_기본.png`, `SCR-CASE-06_하이라이트.png`, `SCR-CASE-07_전체메모.png`

#### 정상 상태 정의
- 기록 목록에서 문서 행 클릭 시 우측 패널에 PDF가 렌더링된다
- 문서 뷰어 우측 패널 헤더에 툴바(하이라이트, 메모, 새탭 열기 등) 아이콘이 표시된다
- 텍스트 드래그 선택 후 Floating Toolbar가 나타나고 하이라이트/클립핑 액션을 수행할 수 있다
- 하이라이트 추가 시 해당 텍스트 영역에 하이라이트가 표시된다
- 메모 추가 후 '전체 메모' 패널에서 전체 메모 목록 조회가 가능하다
- '새탭으로 열기' 클릭 시 Document Viewer Container가 새 탭에서 열린다

#### 의도된 제한사항
- 뷰어는 우측 패널 슬라이드 방식으로 열리며 기록 목록과 동시에 표시된다
- 하이라이트는 저장 후 페이지 새로고침해도 유지된다

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| PDF 로드 실패 | 에러 메시지 또는 재시도 안내 |
| 하이라이트 저장 실패 | 에러 토스트 표시 |

#### Manus 판단 기준
- **성공:** PDF 렌더링, 하이라이트 표시, 메모 패널 목록 갱신
- **실패:** PDF 미렌더링, 하이라이트 미표시, 메모 미저장

---

### SCR-10 민사사건 – 검색 기능

**Figma 참조:** `SCR-CASE-02_기록목록_검색결과.png`, `SCR-CASE-03_검색_문서열람_메모.png`, `SCR-CASE-04_파워검색.png`

#### 정상 상태 정의
- 메인 헤더 검색창에 키워드 입력 시 기록 목록이 실시간 필터링된다
- 검색 결과에서 문서 클릭 시 검색 키워드가 하이라이트된 상태로 뷰어가 열린다
- 검색 중 메모 추가가 가능하다
- '파워검색' 버튼 클릭 시 Dialog가 열리며 다중 조건 검색이 가능하다

#### 의도된 제한사항
- 검색은 현재 사건(`civil_case_id`) 내 문서 기준으로 수행된다
- 파워검색 Dialog는 별도 오버레이로 렌더링된다

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 검색 결과 없음 | 빈 상태 UI |
| 검색 API 오류 | 에러 메시지 |

#### Manus 판단 기준
- **성공:** 키워드 입력 후 필터링된 목록 표시, 파워검색 Dialog 렌더링
- **실패:** 입력 후 목록 변화 없음, Dialog 미열림

---

### SCR-10 민사사건 – 자료 요청 탭 (`?tab=client_request`)

**Figma 참조:** `SCR-CASE-09_자료요청탭.png`, `SCR-CASE-10_의뢰인제출화면.png`, `SCR-CASE-11_기타자료제출.png`
**스테이징 URL:** `https://staging.ailex.co.kr/case-list?civil_case_id=ccase_01KJ9BX7N9407DKCQ2SMNT6XC8&project_id=prj_01KJ9BX7GMEGDP0XARME8DR3RG&tab=client_request`

#### 정상 상태 정의
- `CaseRequestListTable`이 렌더링된다
- 자료 요청 목록이 표시된다
- 의뢰인 제출 항목 클릭 시 의뢰인 제출 화면으로 이동한다
- '기타자료 제출하기' 버튼 클릭 시 파일 첨부 화면이 표시된다
- Comment 파일 첨부 기능이 동작한다

#### 의도된 제한사항
- `selectedCaseId`(civil_case_id)가 있어야 탭 진입 가능
- 의뢰인 자료 하위에 '자료 요청'과 '전체 자료' 서브탭이 존재한다

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 파일 업로드 실패 | 에러 토스트 표시 |
| 지원하지 않는 파일 형식 | 형식 오류 안내 |

#### Manus 판단 기준
- **성공:** 자료 요청 목록 렌더링, 의뢰인 제출 화면 이동, 파일 첨부 완료
- **실패:** 빈 목록, 의뢰인 제출 화면 미이동

---

### SCR-10 민사사건 – 전체 자료 탭 (`?tab=client_list`)

**Figma 참조:** `SCR-CASE-08_전체자료탭.png`

#### 정상 상태 정의
- `CaseRequestDocumentListTable`이 렌더링된다
- 제출된 전체 자료 목록이 표시된다
- 문서 클릭 시 뷰어 패널이 열린다

#### Manus 판단 기준
- **성공:** 전체 자료 목록 렌더링, 문서 클릭 시 뷰어 열림
- **실패:** 빈 화면, 뷰어 미열림

---

### SCR-11 서면 작성 (`/case-list?tab=editor`, `/case-list/editor`)

**Figma 참조:** `SCR-CASE-12_서면작성목록.png`
**스테이징 URL:** `https://staging.ailex.co.kr/case-list?civil_case_id=ccase_01KJ9BX7N9407DKCQ2SMNT6XC8&tab=editor`

#### 정상 상태 정의
- 서면 작성 목록 화면(`CaseDocumentEditorWrapper`)이 렌더링된다
- 기존 서면 목록이 표시되고 새 서면 작성 진입이 가능하다
- `/case-list/editor`로 이동 시 TinyMCE 기반 에디터가 렌더링된다
- '뒤로 가기' 클릭 시 `civil_case_id`, `project_id`, `project_name`, `client_name` 파라미터를 보존하며 `/case-list?tab=editor`로 이동한다 (replace: false)

#### 의도된 제한사항
- 에디터 이탈 시 URL 파라미터를 보존하여 맥락 유지
- 에디터는 `/case-list/editor` 경로, 목록은 `/case-list?tab=editor`로 분리

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 저장 중 네트워크 오류 | 에러 토스트 또는 재시도 안내 |
| 내용 없이 저장 시도 | 저장 버튼 비활성 또는 경고 |

#### Manus 판단 기준
- **성공:** 에디터 렌더링, 저장 성공 피드백, 뒤로 가기 시 case-list?tab=editor 이동
- **실패:** 에디터 미렌더링, 저장 무반응, URL 파라미터 소실

---

### SCR-04 증거 PDF 뷰어 (`/evidence/pdf/:evidenceId`)

**스테이징 URL:** `https://staging.ailex.co.kr/evidence/pdf/cdoc_01KK089FYR0HD07J1580F1VXPD`

#### 정상 상태 정의
- 유효한 `evidenceId`로 접근 시 PDF 문서가 렌더링된다
- 페이지 네비게이션(이전/다음)이 동작한다

#### 의도된 제한사항
- `evidenceId`는 유효한 ID가 필요하다
- `cdoc_` prefix 사용 (case_document_id 기준 — 실제 evidence ID와 다를 경우 별도 확인 필요)

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 존재하지 않는 evidenceId | 에러 UI 또는 빈 상태 |
| 비로그인 접근 | 로그인 화면으로 리다이렉트 |
| 타 사용자 증거 접근 | 403 또는 권한 없음 처리 |

#### Manus 판단 기준
- **성공:** PDF 페이지 렌더링
- **실패:** 빈 화면, 에러 페이지

---

### SCR-08 클립핑 뷰어 (`/evidence/case-viewer/:evidenceId`)

**스테이징 URL:** `https://staging.ailex.co.kr/evidence/case-viewer/cdoc_01KK089FYR0HD07J1580F1VXPD`

#### 정상 상태 정의
- 클립핑 인터페이스(CaseViewerPage)가 렌더링된다
- 텍스트/영역 선택 후 클립핑 저장이 가능하다
- 폴더 생성 및 클립핑 항목 분류가 가능하다
- AI 클립핑 제안 목록이 표시된다
- 검색 및 페이지네이션이 동작한다

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| 클립핑 저장 실패 | 에러 토스트 |
| AI 제안 API 오류 | 에러 안내 또는 빈 제안 목록 |

#### Manus 판단 기준
- **성공:** 클립핑 UI 렌더링, 저장 후 목록 추가
- **실패:** UI 미렌더링, 저장 무반응

---

### SCR-09 AI 페이지 (`/ai`)

#### 정상 상태 정의
- AI 서면 생성 인터페이스가 렌더링된다
- 챗봇 입력 후 AI 응답이 스트리밍 또는 일괄 표시된다
- 서면 생성 조건 설정 후 생성 요청 시 생성 진행 UI 후 결과가 반환된다
- 사이드바 열림/닫힘 토글이 동작한다
- 대화 삭제 기능이 동작한다

#### 의도된 제한사항
- 서면 생성은 클립핑된 근거 데이터 기반으로 동작한다
- 최초 진입 시 대화 없으면 빈 상태 UI 표시

#### 비정상 케이스
| 케이스 | 기대 동작 |
|---|---|
| AI API 오류 | 에러 메시지 토스트 |
| 조건 미입력 서면 생성 요청 | 버튼 비활성 또는 입력 안내 |

#### Manus 판단 기준
- **성공:** 챗봇 응답 표시, 서면 생성 결과 렌더링
- **실패:** 요청 후 무응답, 빈 화면

---

### SCR-LOGOUT 로그아웃

#### 정상 상태 정의
- `/logout` 접근 시 로그인 화면(`/`)으로 Navigate 리다이렉트된다
- 로그아웃 버튼 클릭 시 세션/토큰 초기화 후 로그인 화면으로 이동한다
- `storage-reset` 이벤트 발생으로 캐시가 초기화된다

#### Manus 판단 기준
- **성공:** 로그아웃 후 URL `/`, 로그인 폼 표시
- **실패:** 로그인 화면 외 이동, 재접속 시 세션 유지

---

## Figma 화면 참조 목록

저장 경로: `~/qa-pipeline/input/figma_frames/`

| 파일명 | 화면 | Figma 노드 ID |
|---|---|---|
| `SCR-CASE-01_기록목록.png` | 기록 목록 기본 | 15848:137396 |
| `SCR-CASE-02_기록목록_검색결과.png` | 기록 목록 검색 결과 | 15848:133765 |
| `SCR-CASE-03_검색_문서열람_메모.png` | 검색 + 문서 열람 + 메모 | 15848:142146 |
| `SCR-CASE-04_파워검색.png` | 파워검색 Dialog | 15866:159830 |
| `SCR-CASE-05_기록열람_뷰어_기본.png` | 문서 뷰어 (하이라이트 없음) | 15848:141514 |
| `SCR-CASE-06_하이라이트.png` | 하이라이트 추가됨 | 15848:156735 |
| `SCR-CASE-07_전체메모.png` | 전체 메모 패널 | 15848:146851 |
| `SCR-CASE-08_전체자료탭.png` | 전체 자료 탭 | 16553:150563 |
| `SCR-CASE-09_자료요청탭.png` | 자료 요청 탭 | 16553:150623 |
| `SCR-CASE-10_의뢰인제출화면.png` | 의뢰인 제출 화면 | 16553:150880 |
| `SCR-CASE-11_기타자료제출.png` | 기타자료 제출 | 16553:151051 |
| `SCR-CASE-12_서면작성목록.png` | 서면 작성 목록 | 17203:108035 |

---

## 미확인 항목

| 항목 | 내용 |
|---|---|
| evidenceId 타입 확인 | `cdoc_` prefix가 `/evidence/pdf/:evidenceId` 경로에서도 유효한지 스테이징에서 직접 확인 필요 |
| ADMIN 계정 | 어드민 시나리오(TC-A-*)를 위한 ADMIN role 계정 별도 필요 |
| 결제 콜백 파라미터 | 토스페이먼츠 sandbox 환경에서 `billing/success`, `billing/fail` 파라미터 확인 필요 |
| 서면 작성 > 서면 생성 섹션 | Figma `16971:138105` 섹션 내용 추가 확인 필요 |
