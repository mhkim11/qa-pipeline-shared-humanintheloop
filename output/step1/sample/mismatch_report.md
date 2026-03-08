# 불일치 리포트

---

## Figma API 추출 결과

- 추출 성공: 14개 프레임
- 추출 실패: 0개
- 적용 딜레이: 4초

---

## 코드에만 있는 화면

- SCR-11 — /ai: AI 분석 화면. AiPage 컴포넌트, POST /api/ai/analyze 호출, 분석 결과 스트리밍 표시
  → 피그마 미등록 화면으로 판단. 코드 기준 시나리오 생성.

---

## 피그마에만 있는 화면

- 결제 화면 — 피그마 프레임: 14_payment.png / 코드 없음 → 미구현으로 제외
- 구독 화면 — 피그마 프레임: 15_subscription.png / 코드 없음 → 미구현으로 제외

---

## 동적 경로 ID 미확보

- SCR-09 — /evidence/pdf/:id → 플레이스홀더: SAMPLE_DOCUMENT_ID
- SCR-10 — /evidence/case-viewer/:id → 플레이스홀더: SAMPLE_DOCUMENT_ID

> 시나리오 CSV의 해당 URL 셀(노란색)을 클릭해서 실제 스테이징 ID로 직접 수정하세요.
