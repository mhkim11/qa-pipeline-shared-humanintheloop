# Pipeline Config

모든 지시문이 참조하는 공통 설정값입니다.
경로·URL·ID가 변경될 경우 이 파일만 수정하세요.

---

## 저장소

| 항목 | 전자동 | 검수포함 |
|---|---|---|
| GitHub 저장소 | https://github.com/mhkim11/qa-pipeline-shared | https://github.com/mhkim11/qa-pipeline-shared-humanintheloop |
| 로컬 폴더 | ~/qa-pipeline | ~/qa-pipeline_humanintheloop |

---

## 스테이징 서버

```
STAGING_URL = https://staging.ailex.co.kr
STAGING_ID  = test2026@softplant.co.kr
STAGING_PW  = softplant1234!
```

---

## Figma

```
FIGMA_API_TOKEN = 발급받은_토큰
FIGMA_FILE_KEY  = R1qBV5JwTX051wql9sgJWd
```

---

## 테스트 데이터 ID

```
CIVIL_CASE_ID = ccase_01KJ9BX7N9407DKCQ2SMNT6XC8
PROJECT_ID    = prj_01KJ9BX7GMEGDP0XARME8DR3RG
DOCUMENT_ID   = cdoc_01KK089FYR0HD07J1580F1VXPD
```

---

## 캡처 대상 화면 (Step 3 기준)

Step 2 Manus가 실제 스테이징 탐색 후 도출한 실제 URL 목록입니다.
추상 경로가 아닌 실제 접근 가능한 전체 URL 기준입니다.

| 파일명 | URL |
|---|---|
| 00_login_staging.png | https://staging.ailex.co.kr |
| 01_home_staging.png | / |
| 02_case-list_staging.png | /case-list?civil_case_id={CIVIL_CASE_ID}&project_id={PROJECT_ID}&tab=list |
| 03_case-request_staging.png | /case-list?...&tab=client_request |
| 04_case-client-list_staging.png | /case-list?...&tab=client_list |
| 05_case-editor-list_staging.png | /case-list?...&tab=editor |
| 06_case-editor_staging.png | /case-list/editor?civil_case_id={CIVIL_CASE_ID}&project_id={PROJECT_ID} |
| 07_evidence-list_staging.png | /evidence/list |
| 08_evidence-pdf_staging.png | /evidence/pdf/{DOCUMENT_ID} |
| 09_evidence-case-viewer_staging.png | /evidence/case-viewer/{DOCUMENT_ID} |
| 10_ai_staging.png | /ai |
| 11_settings_staging.png | /settings |
| 12_notifications_staging.png | /notifications |
| 13_memo_staging.png | /memo |
| 14_payment_staging.png | /payment |
| 15_subscription_staging.png | /subscription |
