#!/usr/bin/env node
/**
 * update_pipeline_doc.js
 *
 * 사용법:
 *   node scripts/update_pipeline_doc.js
 *
 * 설명:
 *   instructions/ 폴더의 MD 파일을 읽어
 *   qa_pipeline_구성도.docx를 자동으로 재생성합니다.
 *   지시문에 변동사항이 생기면 MD 파일을 수정한 뒤
 *   이 스크립트를 실행하면 구성도가 자동 업데이트됩니다.
 *
 * 의존성:
 *   npm install -g docx
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, BorderStyle, WidthType, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

// ── 설정 변수 ─────────────────────────────────────────────
const INSTRUCTIONS_DIR = path.join(__dirname, '..', 'instructions');
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'qa_pipeline_구성도.docx');
const FONT = "Apple SD Gothic Neo";

// ── MD 파일 읽기 ──────────────────────────────────────────
function readMD(filename) {
  const filePath = path.join(INSTRUCTIONS_DIR, filename);
  if (!fs.existsSync(filePath)) return `[파일 없음: ${filename}]`;
  return fs.readFileSync(filePath, 'utf8');
}

function extractSection(md, heading) {
  const lines = md.split('\n');
  const start = lines.findIndex(l => l.startsWith(`## ${heading}`));
  if (start === -1) return '';
  let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  if (end === -1) end = lines.length;
  return lines.slice(start + 1, end).join('\n').trim();
}

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
function mdToParas(mdText) {
  return mdText.split('\n').map(line => {
    const isBullet = line.trim().startsWith('- ');
    const isCode = line.startsWith('  ') || line.startsWith('\t');
    const text = isBullet ? line.trim().replace(/^- /, '• ') : line;
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: isCode ? { left: 360 } : undefined,
      children: [new TextRun({
        text,
        font: isCode ? "Courier New" : FONT,
        size: 18,
        color: isCode ? "2E4057" : "333333"
      })]
    });
  });
}
function infoBox(input) {
  const lines = Array.isArray(input) ? input : String(input).split('\n');
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" },
          left: { style: BorderStyle.THICK, size: 12, color: "4472C4" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
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
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" }, left: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" }, right: { style: BorderStyle.SINGLE, size: 1, color: "4472C4" } },
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
          children: [new Paragraph({ children: [new TextRun({ text: cell, font: FONT, size: 19 })] })]
        }))
      }))
    ]
  });
}

// ── MD에서 변경 이력 추출 ─────────────────────────────────
function extractChangelog(md) {
  const section = extractSection(md, '변경 이력');
  if (!section) return null;
  return section;
}

// ── 문서 생성 ─────────────────────────────────────────────
async function main() {
  // MD 파일 로드
  const config = readMD('pipeline_config.md');
  const step1md = readMD('step1_claude_code.md');
  const step2md = readMD('step2_manus.md');
  const step3md = readMD('step3_playwright.md');
  const step4md = readMD('step4_claude_code.md');

  // 최종 수정일 추출
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
        // 타이틀
        new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [new TextRun({ text: "AI QA 파이프라인 구성도", font: FONT, size: 48, bold: true, color: "1F3864" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [new TextRun({ text: "스테이징 서버 자동화 QA 시스템", font: FONT, size: 22, color: "666666" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 400 },
          children: [new TextRun({ text: `최종 업데이트: ${now}  |  instructions/ 폴더 MD 파일 기준으로 자동 생성됨`, font: FONT, size: 18, color: "999999" })]
        }),

        // 1. 프로젝트 개요
        h1("1. 프로젝트 개요"),
        p("피그마 디자인과 프론트엔드 코드를 소스로 삼아, 스테이징 서버에 대한 QA를 AI가 자동으로 수행하는 파이프라인입니다."),
        spacer(),
        makeTable(
          ["항목", "내용"],
          [
            ["서비스명", "Ailex (https://staging.ailex.co.kr)"],
            ["피그마 파일키", "R1qBV5JwTX051wql9sgJWd"],
            ["GitHub 계정", "mhkim11"],
            ["QA 저장소 (전자동)", "qa-pipeline-shared"],
            ["QA 저장소 (검수포함)", "qa-pipeline-shared-humanintheloop"],
            ["지시문 관리", "instructions/ 폴더 MD 파일"],
            ["구성도 갱신", "node scripts/update_pipeline_doc.js"],
          ],
          [3600, 5426]
        ),
        spacer(),

        // 2. 파이프라인 흐름
        h1("2. 전체 파이프라인 흐름"),
        makeTable(
          ["단계", "담당 AI", "주요 역할", "Input", "Output"],
          [
            ["Step 1", "Claude Code", "시나리오 생성", "프론트엔드 코드 zip\nFigma API", "qa_scenarios.csv\nqa_definition.md"],
            ["Step 2", "Manus", "QA 실행\n+ 실제 URL·ID 파악", "qa_scenarios.csv\nqa_definition.md", "qa_results.csv\nscreenshots/ (실패)\n캡처 대상 URL 목록"],
            ["Step 3", "Claude Code\n+ Playwright", "화면 캡처", "Step 2 도출 실제 URL\ncapture.py 스크립트", "screenshots/ (전체)\ncapture_errors.log"],
            ["Step 4", "Claude Code", "최종 리포트 생성", "Step 1~3 전체 산출물", "qa_final_report.csv\nqa_summary.md"],
          ],
          [1000, 1800, 2400, 2200, 1626]
        ),
        spacer(),

        h2("단계별 설계 이유"),
        makeTable(
          ["단계", "설계 이유"],
          [
            ["Step 1\nClaude Code", "피그마(정답 소스)와 코드(구조 파악)를 교차 분석해야 하므로\n코드 읽기·API 호출·파일 생성을 동시에 처리할 수 있는 Claude Code 적합."],
            ["Step 2\nManus", "예상치 못한 화면 전환·팝업·에러 상황을 스스로 판단해야 하므로\n브라우저 조작 특화된 Manus 사용.\n또한 실제 스테이징 탐색으로 동적 경로 ID와 실제 URL 구조 파악 → Step 3 캡처 목록 도출."],
            ["Step 2→3\n연결", "Playwright는 실제 접근 가능한 URL이 필요.\nStep 1 코드 기반 추상 경로만으로는 실제 ID·쿼리파라미터 불가.\nManus가 실제 URL 확인 후 Step 3에 전달."],
            ["Step 3\nPlaywright", "정해진 화면 안정적 캡처가 목적 → 코드 기반 자동화가 적합.\nscripts/capture.py 저장으로 이후 QA 사이클 재사용 가능."],
            ["Step 4\nClaude Code", "CSV·이미지·로그 이기종 산출물 종합 판단 필요.\n심각도 분류·디자인 비교·반복 패턴 묶기 등 단순 집계 이상의 판단 필요."],
          ],
          [1800, 7226]
        ),
        spacer(),
        divider(),

        // 3. 지시문 관리 방식
        h1("3. 지시문 관리 방식"),
        p("지시문은 GitHub 저장소의 instructions/ 폴더에 MD 파일로 관리됩니다."),
        p("각 AI는 해당 MD 파일을 직접 읽고 실행합니다. 터미널에 지시문을 직접 입력하지 않습니다.", { color: "666666" }),
        spacer(),
        makeTable(
          ["파일", "대상 AI", "설명"],
          [
            ["instructions/pipeline_config.md", "전체 공통", "경로·URL·ID 등 공통 설정값 모음\n이 파일만 수정하면 전체 반영"],
            ["instructions/step1_claude_code_전자동.md", "Claude Code", "Step 1 시나리오 생성 — 전자동"],
            ["instructions/step1_claude_code_검수포함.md", "Claude Code", "Step 1 시나리오 생성 — 검수포함\n(사람 검수 단계 포함)"],
            ["instructions/step2_manus_전자동.md", "Manus", "Step 2 QA 실행 — 전자동"],
            ["instructions/step2_manus_검수포함.md", "Manus", "Step 2 QA 실행 — 검수포함"],
            ["instructions/step3_playwright_전자동.md", "Claude Code", "Step 3 화면 캡처 — 전자동"],
            ["instructions/step3_playwright_검수포함.md", "Claude Code", "Step 3 화면 캡처 — 검수포함"],
            ["instructions/step4_claude_code_전자동.md", "Claude Code", "Step 4 최종 리포트 — 전자동"],
            ["instructions/step4_claude_code_검수포함.md", "Claude Code", "Step 4 최종 리포트 — 검수포함"],
            ["scripts/update_pipeline_doc.js", "Claude Code", "MD 변경 시 구성도 docx 자동 재생성"],
          ],
          [3200, 1800, 4026]
        ),
        spacer(),
        h2("AI에게 지시하는 방법"),
        infoBox([
          "# Claude Code — 전자동 Step 1",
          "instructions/step1_claude_code_전자동.md 파일을 읽고 지시대로 실행해줘.",
          "",
          "# Manus — 전자동 Step 2",
          "instructions/step2_manus_전자동.md 파일을 읽고 지시대로 실행해줘.",
          "",
          "# Claude Code — 검수포함 Step 3",
          "instructions/step3_playwright_검수포함.md 파일을 읽고 지시대로 실행해줘.",
        ]),
        spacer(),
        h2("지시문 변경 시 구성도 업데이트"),
        infoBox([
          "# 1. instructions/ 내 MD 파일 수정",
          "# 2. 구성도 자동 재생성",
          "node scripts/update_pipeline_doc.js",
          "",
          "# 3. 재생성된 구성도 push",
          'git add docs/qa_pipeline_구성도.docx instructions/',
          'git commit -m "docs: 지시문 및 구성도 업데이트"',
          "git push origin main",
        ]),
        spacer(),
        divider(),

        // 4. 운영 방식 비교
        h1("4. 운영 방식 비교"),
        makeTable(
          ["항목", "전자동", "검수포함"],
          [
            ["로컬 폴더", "~/qa-pipeline", "~/qa-pipeline_humanintheloop"],
            ["GitHub 저장소", "qa-pipeline-shared", "qa-pipeline-shared-humanintheloop"],
            ["Step 1 이후", "바로 Step 2 진행", "사람 검수 후 Step 2 진행"],
            ["장점", "빠름, 완전 자동화", "시나리오 품질 보장"],
            ["단점", "오류 전파 가능성", "중간 개입 필요"],
          ],
          [2800, 3113, 3113]
        ),
        spacer(),
        divider(),

        // 5. 파일 흐름도
        h1("5. 파일 흐름도 (GitHub 연동)"),
        p("Manus는 클라우드 기반 AI라 로컬 파일에 직접 접근 불가. GitHub 저장소를 공유 공간으로 사용.", { color: "666666" }),
        spacer(),
        makeTable(
          ["주체", "Git 액션", "대상 경로", "비고"],
          [
            ["사람 (초기)", "push", "input/frontend_code.zip\ninstructions/ (MD 파일)", "1회 설정"],
            ["Step 1 Claude Code", "pull → 작업 → push", "input/figma_frames/\noutput/step1/", "로컬 실행"],
            ["Step 2 Manus", "clone → 작업 → push", "output/step2/", "GitHub PAT 필요"],
            ["Step 3 Claude Code", "pull → 작업 → push", "output/step3/\nscripts/capture.py", "Playwright 로컬 실행"],
            ["Step 4 Claude Code", "pull → 작업 → push", "output/step4/", "로컬 실행"],
            ["사람 (최종)", "pull", "output/step4/ 확인", "Google Sheets 업로드"],
          ],
          [2000, 2000, 2800, 2226]
        ),
        spacer(),
        divider(),

        // 6. 향후 발전 계획
        h1("6. 향후 발전 계획"),
        makeTable(
          ["항목", "현재", "향후", "우선순위"],
          [
            ["Manus 연동", "파일 기반 (GitHub)", "Manus API 자동 트리거", "높음"],
            ["전체 자동화", "단계별 수동 실행", "run_qa_pipeline.py 단일 스크립트", "중간"],
            ["리포트 저장소", "CSV 수동 업로드", "Notion API 연동\n→ 이슈별 페이지·스크린샷 첨부", "중간"],
            ["정기 실행", "수동", "Claude Cowork 스케줄 태스크", "중간"],
            ["Figma MCP", "REST API", "MCP 전환 → 컴포넌트·디자인 토큰 추출\n※ OAuth 인증 확인 후 테스트", "중간"],
            ["서브에이전트", "Step 1 순차 처리", "Figma 추출 + 코드 분석 병렬 처리", "낮음"],
            ["Codex 벤치마킹", "Claude Code 단독", "Claude Code vs Codex 품질 비교", "낮음"],
          ],
          [2200, 2400, 3000, 1426]
        ),
        spacer(),
      ]
    }]
  });

  // docs 폴더 생성
  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`✅ 구성도 재생성 완료: ${OUTPUT_PATH}`);
}

main().catch(console.error);
