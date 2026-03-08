# 기획서 초안 — Ailex 스테이징 QA 대상 화면

> 생성 기준: 프론트엔드 코드 라우팅 + Figma 프레임 교차 분석

---

## 화면 목록

| 화면명 | URL 경로 | 피그마 일치 |
|---|---|---|
| 로그인 | / | 일치 |
| 홈 | /home | 일치 |
| 사건목록 | /case-list | 일치 |
| 사건목록 > 의뢰인 요청 탭 | /case-list?tab=client_request | 일치 |
| 사건목록 > 의뢰인 목록 탭 | /case-list?tab=client_list | 일치 |
| 사건목록 > 편집자 탭 | /case-list?tab=editor | 일치 |
| 서면 작성 에디터 | /case-list/editor | 일치 |
| 증거목록 | /evidence/list | 일치 |
| 증거 PDF 뷰어 | /evidence/pdf/:id | 일치 |
| 사건 뷰어 | /evidence/case-viewer/:id | 일치 |
| AI 분석 | /ai | 코드만 |
| 설정 | /settings | 일치 |
| 알림 | /notifications | 일치 |
| 메모 | /memo | 일치 |
| 결제 | /payment | 피그마만 |
| 구독 | /subscription | 피그마만 |

---

## 주요 사용자 플로우

### 플로우 1 — 사건 서면 작성
1. 로그인 → 홈
2. 사건목록 진입 → 사건 선택
3. 편집자 탭 → 서면 작성 에디터 진입
4. 문서 작성 → 저장

### 플로우 2 — 증거 분석
1. 로그인 → 증거목록
2. 증거 문서 선택 → PDF 뷰어 또는 사건 뷰어
3. AI 분석 요청

---

## 화면 간 이동 경로

```
로그인(/)
  └─ 홈(/home)
       ├─ 사건목록(/case-list)
       │    ├─ 탭: 의뢰인 요청 / 의뢰인 목록 / 편집자
       │    └─ 서면 작성 에디터(/case-list/editor)
       ├─ 증거목록(/evidence/list)
       │    ├─ PDF 뷰어(/evidence/pdf/:id)
       │    └─ 사건 뷰어(/evidence/case-viewer/:id)
       ├─ AI 분석(/ai)
       ├─ 설정(/settings)
       ├─ 알림(/notifications)
       ├─ 메모(/memo)
       └─ 결제/구독(/payment, /subscription)
```
