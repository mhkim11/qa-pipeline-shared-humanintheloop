# 불일치 리포트

## AI 실패 항목

- Figma API: 프레임 3개 이미지 추출 실패 (rate limit)
  - `/evidence/case-viewer` 프레임
  - `/ai` 프레임
  - `/settings` 프레임

---

## 코드에만 있는 화면 (피그마 없음)

1. `/case-list/editor` — 코드에 존재하나 피그마 프레임 없음
   - 현재 처리: 시나리오 포함 (SCR-06)
   - 판단 필요: 미구현 화면인지 확인 요망

2. `/notifications` — 코드에 존재하나 피그마 프레임 없음
   - 현재 처리: P3로 포함

---

## 피그마에만 있는 화면 (코드 없음)

1. `온보딩 화면` — 피그마에 존재하나 라우팅 코드 없음
   - 현재 처리: 미구현으로 제외
   - 판단 필요: 확인 요망

---

## 동적 경로 ID 미확보

- SCR-08 (`/evidence/pdf/:document_id`) — pipeline_config.md의 DOCUMENT_ID 사용
- SCR-09 (`/evidence/case-viewer/:document_id`) — pipeline_config.md의 DOCUMENT_ID 사용
