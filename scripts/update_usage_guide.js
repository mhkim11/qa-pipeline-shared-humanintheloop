#!/usr/bin/env node
/**
 * update_usage_guide.js
 *
 * 사용법:
 *   node scripts/update_usage_guide.js
 *
 * 설명:
 *   docs/claude_code_사용가이드.docx 를 재생성합니다.
 *   지시문이나 파이프라인 구조가 크게 바뀐 경우 이 스크립트를 실행하세요.
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, BorderStyle, WidthType, ShadingType } = require('docx');
const fs   = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'claude_code_사용가이드.docx');
const FONT = "Apple SD Gothic Neo";

// ── 헬퍼 ─────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: "1F3864" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: "2E75B6" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 20, ...opts })]
  });
}
function bullet(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [new TextRun({ text: `• ${text}`, font: FONT, size: 20, color: "333333" })]
  });
}
function spacer() {
  return new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun("")] });
}
function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 1 } },
    children: [new TextRun("")]
  });
}
function infoBox(lines) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 1,  color: "4472C4" },
          bottom: { style: BorderStyle.SINGLE, size: 1,  color: "4472C4" },
          left:   { style: BorderStyle.THICK,  size: 12, color: "4472C4" },
          right:  { style: BorderStyle.SINGLE, size: 1,  color: "CCCCCC" },
        },
        shading: { fill: "F5F8FF", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        width: { size: 9026, type: WidthType.DXA },
        children: lines.map(line => new Paragraph({
          spacing: { before: 36, after: 36 },
          children: [new TextRun({ text: line, font: "Courier New", size: 17, color: "1F3864" })]
        }))
      })]
    })]
  });
}
function makeTable(headers, rows, colWidths) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders: { top: border, bottom: border, left: border, right: border },
          shading: { fill: "2E75B6", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          width: { size: colWidths[i], type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT, size: 20, bold: true, color: "FFFFFF" })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
          borders,
          shading: { fill: ri % 2 === 0 ? "F5F8FF" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          width: { size: colWidths[ci], type: WidthType.DXA },
          children: String(cell).split('\n').map(line => new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: line, font: FONT, size: 19 })]
          }))
        }))
      }))
    ]
  });
}

// ── 문서 생성 ─────────────────────────────────────────────
async function main() {
  const now = new Date().toLocaleDateString('ko-KR');

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 20 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: FONT, color: "1F3864" },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: FONT, color: "2E75B6" },
          paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [

        // ── 표지 ────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 800, after: 400 },
          children: [new TextRun({ text: "Claude Code 사용 가이드", font: FONT, size: 52, bold: true, color: "1F3864" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: "QA 파이프라인 (Human-in-the-Loop) 운영 안내", font: FONT, size: 26, color: "2E75B6" })]
        }),
        p(`최종 수정: ${now}`, { color: "888888", size: 18 }),
        divider(),

        // ── 1. 저장소 초기 설정 ───────────────────────────────
        h1("1. 저장소 초기 설정 (최초 1회)"),
        h2("1-1. 저장소 clone"),
        infoBox([
          "git clone https://github.com/mhkim11/qa-pipeline-shared-humanintheloop \\",
          "  ~/qa-pipeline_humanintheloop",
        ]),
        spacer(),
        h2("1-2. .env 파일 생성"),
        p(".env 파일은 .gitignore 처리되어 있어 저장소에 포함되지 않습니다. 직접 생성하세요."),
        spacer(),
        infoBox([
          "cat > ~/qa-pipeline_humanintheloop/.env << 'EOF'",
          "FIGMA_API_TOKEN = {발급받은_토큰}",
          "FIGMA_FILE_KEY  = BD1dtm9YOZJmMOlqm5eaQA",
          "STAGING_URL     = https://staging.ailex.co.kr",
          "STAGING_ID      = test2026@softplant.co.kr",
          "STAGING_PW      = softplant1234!",
          "CIVIL_CASE_ID   = ccase_01KJ9BX7N9407DKCQ2SMNT6XC8",
          "PROJECT_ID      = prj_01KJ9BX7GMEGDP0XARME8DR3RG",
          "DOCUMENT_ID     = cdoc_01KK089FYR0HD07J1580F1VXPD",
          "EOF",
        ]),
        spacer(),
        h2("1-3. 프론트엔드 코드 zip 복사"),
        infoBox([
          "cp ~/다운로드/프론트엔드코드.zip ~/qa-pipeline_humanintheloop/input/",
        ]),
        spacer(),
        h2("1-4. npm 의존성 설치 (검수 UI 실행용)"),
        infoBox([
          "cd ~/qa-pipeline_humanintheloop",
          "npm install",
        ]),
        spacer(),
        divider(),

        // ── 2. 파이프라인 실행 ────────────────────────────────
        h1("2. 파이프라인 단계별 실행"),
        p("4단계로 구성됩니다. Step 2는 Manus에서 실행하고, 나머지는 Claude Code에서 실행합니다."),
        spacer(),
        makeTable(
          ["단계", "실행 주체", "단축 명령어 / 실행 방법", "산출물"],
          [
            ["Step 1\n시나리오 생성",   "Claude Code", "터미널에 숫자 1 입력",                              "qa_scenarios.csv\nqa_definition.md\nspec_draft.md\nmismatch_report.md"],
            ["Step 1 검수",             "사람",        "node scripts/review_server.js\n→ http://localhost:3000", "검수 완료 + latest_run 생성"],
            ["Step 2\nQA 실행",         "Manus",       "step2_manus_검수포함.md 파일을\nManus에 전달",       "qa_results.csv\nscreenshots/\nextra_bugs.md"],
            ["Step 3\n화면 캡처",       "Claude Code", "터미널에 숫자 3 입력",                              "screenshots/\ncapture.py\ncapture_errors.log"],
            ["Step 4\n최종 리포트",     "Claude Code", "터미널에 숫자 4 입력",                              "qa_final_report.csv\nqa_summary.md\nqa_report.html"],
          ],
          [1600, 1400, 3000, 3026]
        ),
        spacer(),
        h2("단축 명령어 상세"),
        p("Claude Code 터미널에서 숫자만 입력하면 해당 지시문을 자동으로 읽고 실행합니다."),
        spacer(),
        infoBox([
          "# Step 1 실행",
          "1",
          "",
          "# Step 3 실행",
          "3",
          "",
          "# Step 4 실행",
          "4",
        ]),
        spacer(),
        p("※ Step 2는 Manus에서 실행하므로 Claude Code 단축 명령어 없음.", { color: "888888", size: 18 }),
        spacer(),
        divider(),

        // ── 3. 검수 UI ────────────────────────────────────────
        h1("3. 검수 UI 실행 (Step 1 완료 후)"),
        p("Step 1 완료 후 브라우저에서 시나리오를 검수·수정·커밋합니다."),
        spacer(),
        infoBox([
          "node ~/qa-pipeline_humanintheloop/scripts/review_server.js",
          "# → http://localhost:3000 열기",
        ]),
        spacer(),
        makeTable(
          ["패널", "탭", "주요 기능"],
          [
            ["왼쪽 (참고)", "불일치 리포트", "코드에만/피그마에만 있는 화면 확인\n시나리오 삭제 버튼\nFigma 프레임 인라인 이미지"],
            ["왼쪽 (참고)", "기획서 초안",  "AI가 작성한 화면 구조 확인 + 편집"],
            ["왼쪽 (참고)", "Figma 프레임", "다운로드된 전체 Figma 프레임 썸네일 브라우징"],
            ["오른쪽 (편집)", "시나리오 CSV", "셀 클릭 인라인 편집\nSAMPLE_ 플레이스홀더 → 노란 셀 강조\n행 추가·삭제"],
            ["오른쪽 (편집)", "정의서",       "qa_definition.md 직접 편집"],
          ],
          [1600, 2000, 5426]
        ),
        spacer(),
        p("검수 완료 후 [저장 & 커밋] 버튼 클릭 → output/latest_run 자동 생성 → Step 2 진행 가능."),
        spacer(),
        divider(),

        // ── 4. 지시문 수정 방법 ────────────────────────────────
        h1("4. 지시문 수정 방법"),
        h2("방법 A — Claude Code에 자연어로 요청 (권장)"),
        spacer(),
        makeTable(
          ["상황", "Claude Code에 하는 말"],
          [
            ["스테이징 URL 변경",    "pipeline_config.md 에서 STAGING_URL을 새 주소로 바꿔줘."],
            ["테스트 계정 변경",     "pipeline_config.md 에서 STAGING_ID와 STAGING_PW를 새 계정으로 업데이트해줘."],
            ["캡처 대상 화면 추가",  "pipeline_config.md 캡처 대상 화면에 16_admin.png → /admin 항목 추가해줘."],
            ["시나리오 규칙 추가",   "step1 지시문에 모달 열기/닫기를 독립 시나리오로 분리하는 규칙 추가해줘."],
            ["QA 실행 규칙 변경",    "step2 지시문 AI 판단 규칙에 로그인 실패 시 3회 재시도 규칙 추가해줘."],
          ],
          [2800, 6226]
        ),
        spacer(),
        h2("방법 B — 직접 편집"),
        infoBox([
          "# 파일 직접 수정 후 커밋",
          "cd ~/qa-pipeline_humanintheloop",
          "git add instructions/",
          "git commit -m \"docs: 지시문 수정\"",
          "git push origin main",
        ]),
        spacer(),
        divider(),

        // ── 5. 변경 유형별 수정 파일 ──────────────────────────
        h1("5. 변경 유형별 수정 파일 가이드"),
        makeTable(
          ["변경 내용", "수정 파일", "영향 범위"],
          [
            ["스테이징 URL / 계정 / ID 변경",    "pipeline_config.md",                   "전체 공통"],
            ["Figma 토큰 / 파일키 변경",          "pipeline_config.md + .env",            "전체 공통"],
            ["캡처 대상 화면 추가·삭제",          "pipeline_config.md",                   "Step 3"],
            ["시나리오 생성 규칙 변경",           "step1_claude_code_검수포함.md",        "Step 1"],
            ["QA 실행 규칙 변경",                 "step2_manus_검수포함.md",              "Step 2 (Manus)"],
            ["캡처 규칙 변경 (viewport 등)",      "step3_playwright_검수포함.md",         "Step 3"],
            ["리포트 구성 변경",                  "step4_claude_code_검수포함.md",        "Step 4"],
          ],
          [3000, 3200, 2826]
        ),
        spacer(),
        divider(),

        // ── 6. 파일 흐름도 ────────────────────────────────────
        h1("6. 파일 흐름도 (GitHub 연동)"),
        p("Manus는 클라우드 기반 AI라 로컬 파일에 직접 접근 불가. GitHub 저장소를 공유 공간으로 사용합니다.", { color: "666666" }),
        spacer(),
        makeTable(
          ["주체", "Git 액션", "대상 경로"],
          [
            ["사람 (초기 설정)", "push",            "input/frontend_code/ (zip)\ninput/sample_docs/ (PDF)\ninstructions/ (MD 파일)"],
            ["Step 1\nClaude Code", "pull → push",  "input/figma_frames/$RUN_ID/\noutput/step1/$RUN_ID/\noutput/step1/run_log.md"],
            ["사람 (검수 UI)", "저장 & 커밋 버튼", "output/step1/$RUN_ID/ (수정)\noutput/latest_run"],
            ["Step 2\nManus", "clone → push",       "output/step2/$RUN_ID/\nqa_results.csv, screenshots/"],
            ["Step 3\nClaude Code", "pull → push",  "output/step3/$RUN_ID/\nscreenshots/, capture_errors.log"],
            ["Step 4\nClaude Code", "pull → push",  "output/step4/$RUN_ID/\nqa_report.html, qa_final_report.csv"],
            ["사람 (최종 확인)", "pull",             "output/step4/$RUN_ID/qa_report.html\n→ 브라우저에서 바로 열기"],
          ],
          [2000, 2000, 5026]
        ),
        spacer(),
        divider(),

        // ── 7. 문서 업데이트 ──────────────────────────────────
        h1("7. 구성도·사용 가이드 수동 업데이트"),
        p("지시문이 안정화된 시점에 아래 명령어로 문서를 재생성합니다."),
        spacer(),
        infoBox([
          "cd ~/qa-pipeline_humanintheloop",
          "",
          "# 구성도 재생성",
          "node scripts/update_pipeline_doc.js",
          "",
          "# 사용 가이드 재생성",
          "node scripts/update_usage_guide.js",
          "",
          "# 커밋 & push",
          "git add docs/",
          "git commit -m \"docs: 구성도·사용 가이드 업데이트\"",
          "git push origin main",
        ]),
        spacer(),
      ]
    }]
  });

  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`✅ 사용 가이드 재생성 완료: ${OUTPUT_PATH}`);
}

main().catch(console.error);
