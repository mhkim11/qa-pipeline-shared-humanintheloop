# 불일치 리포트

## AI 실패 항목

- Figma API: 프레임 3개 이미지 추출 실패 (rate limit)
  - `/evidence/case-viewer` 프레임
  - `/ai` 프레임
  - `/settings` 프레임

---

## 코드에만 있는 화면 (피그마 없음)

1. SCR-06 — `/case-list/editor`: 서면 작성 에디터. CaseEditorPage 컴포넌트, POST /api/documents 호출, 리치 텍스트 에디터 포함
   - 현재 처리: 시나리오 포함 (P1)
   - 판단 필요: 피그마에 미반영된 화면인지 확인 요망

2. SCR-12 — `/notifications`: 알림 목록 화면. NotificationsPage 컴포넌트, GET /api/notifications 호출, 읽음/안읽음 상태 표시
   - 현재 처리: 시나리오 포함 (P3)

---

## 피그마에만 있는 화면 (코드 없음)

1. `온보딩 화면` — 피그마 프레임: 00_login.png / 코드 없음 → 미구현으로 제외
   - 판단 필요: 실제 미구현인지 확인 요망

---

## 동적 경로 ID 미확보

- SCR-08 (`/evidence/pdf/:document_id`) — pipeline_config.md의 DOCUMENT_ID 사용
- SCR-09 (`/evidence/case-viewer/:document_id`) — pipeline_config.md의 DOCUMENT_ID 사용
