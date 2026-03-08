#!/usr/bin/env node
/**
 * scripts/review_server.js
 * Step 1 / Step 2 검수 웹 UI
 * 사용법: node scripts/review_server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const BASE = path.resolve(process.env.HOME, 'qa-pipeline_humanintheloop');
const STEP1_BASE = path.join(BASE, 'output', 'step1');
const STEP2_BASE = path.join(BASE, 'output', 'step2');
const FIGMA_BASE = path.join(BASE, 'input', 'figma_frames');
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const RUN_PATTERN = /^(\d{10}|sample)$/;

// ── Step 1 디렉토리 헬퍼 ──────────────────────────────────

function getRunDirs() {
  if (!fs.existsSync(STEP1_BASE)) return [];
  const entries = fs.readdirSync(STEP1_BASE)
    .filter(f => RUN_PATTERN.test(f) && fs.statSync(path.join(STEP1_BASE, f)).isDirectory());
  const numeric = entries.filter(f => /^\d{10}$/.test(f)).sort().reverse();
  const named   = entries.filter(f => !/^\d{10}$/.test(f)).sort();
  return [...numeric, ...named];
}

function getRunDir(runId) {
  if (runId && RUN_PATTERN.test(runId)) return path.join(STEP1_BASE, runId);
  const runs = getRunDirs();
  return runs.length ? path.join(STEP1_BASE, runs[0]) : STEP1_BASE;
}

function getFigmaDir(runId) {
  if (runId && RUN_PATTERN.test(runId)) {
    const p = path.join(FIGMA_BASE, runId);
    if (fs.existsSync(p)) return p;
  }
  return FIGMA_BASE;
}

// ── Step 2 디렉토리 헬퍼 ──────────────────────────────────

function getStep2Dir(runId) {
  if (runId && RUN_PATTERN.test(runId)) return path.join(STEP2_BASE, runId);
  const runs = getRunDirs();
  return runs.length ? path.join(STEP2_BASE, runs[0]) : STEP2_BASE;
}

// ── CSV ──────────────────────────────────────────────────

function parseCSV(text) {
  // RFC 4180 compliant parser — handles quoted multiline fields
  const rows = [];
  let cur = '', fields = [], q = false;
  const push = () => { fields.push(cur); cur = ''; };
  const t = text.trim();
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') { cur += '"'; i++; } // escaped quote
        else q = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') { q = true; }
      else if (c === ',') { push(); }
      else if (c === '\n') { push(); rows.push(fields); fields = []; }
      else if (c === '\r') { /* skip */ }
      else cur += c;
    }
  }
  push();
  if (fields.some(f => f) || cur) rows.push(fields);
  if (!rows.length) return { headers: [], rows: [] };
  return { headers: rows[0].map(f => f.trim()), rows: rows.slice(1).map(r => r.map(f => f.trim())) };
}

function serializeCSV({ headers, rows }) {
  const esc = v => (String(v).includes(',') || String(v).includes('"') || String(v).includes('\n'))
    ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  return [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
}

// ── 파일 I/O ─────────────────────────────────────────────

function readFile(name, runId) {
  const p = path.join(getRunDir(runId), name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function writeFile(name, content, runId) {
  const dir = getRunDir(runId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

function readStep2File(name, runId) {
  const p = path.join(getStep2Dir(runId), name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function writeStep2File(name, content, runId) {
  const dir = getStep2Dir(runId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

// ── HTML ──────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA 검수 UI</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; background: #f0f2f5; color: #222; height: 100vh; overflow: hidden; }

  /* 헤더 */
  header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    background: #1a1a2e; color: #fff;
    padding: 0 20px; height: 48px;
    display: flex; align-items: center; gap: 12px;
  }
  header h1 { font-size: 14px; font-weight: 600; flex: 1; letter-spacing: -0.3px; }
  header h1 span { color: #7eb8f7; }
  #status-text { font-size: 11px; color: #888; }

  /* 스텝 전환 */
  .step-switcher { display: flex; gap: 3px; background: #2a2a40; border-radius: 5px; padding: 3px; }
  .step-btn { padding: 4px 12px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: 500; color: #888; background: transparent; transition: all 0.15s; white-space: nowrap; }
  .step-btn.active { background: #3a7bd5; color: #fff; }
  .step-btn:hover:not(.active) { color: #ccc; }

  .btn { padding: 7px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: 500; transition: background 0.15s; }
  .btn-save { background: #3a7bd5; color: #fff; }
  .btn-save:hover { background: #2d62b0; }
  .btn-commit { background: #27ae60; color: #fff; }
  .btn-commit:hover { background: #1e8449; }
  .btn-sm { padding: 3px 9px; font-size: 11px; border-radius: 3px; cursor: pointer; border: none; font-weight: 500; }
  .btn-add { background: #e8f4fd; color: #2d62b0; border: 1px solid #b3d7f0; }
  .btn-add:hover { background: #d0e9f8; }
  .btn-del { background: #fdecea; color: #c0392b; border: 1px solid #f5b7b1; }
  .btn-del:hover { background: #fad4d1; }

  /* 레이아웃 */
  .layout {
    display: flex;
    margin-top: 48px;
    height: calc(100vh - 48px);
  }

  /* 사이드바 */
  .sidebar {
    width: 320px; min-width: 320px;
    background: #fff;
    border-right: 1px solid #e0e0e0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sidebar-tabs {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    flex-shrink: 0;
  }
  .stab {
    flex: 1; padding: 9px 8px; text-align: center;
    font-size: 11px; font-weight: 500; cursor: pointer;
    border-bottom: 2px solid transparent; color: #999;
    transition: color 0.15s;
  }
  .stab.active { color: #1a1a2e; border-bottom-color: #3a7bd5; background: #fff; }
  .sidebar-pane { flex: 1; overflow-y: auto; padding: 16px; display: none; }
  .sidebar-pane.active { display: block; }

  /* 마크다운 */
  .md h2 { font-size: 12px; font-weight: 700; margin: 16px 0 6px; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.3px; }
  .md h3 { font-size: 12px; font-weight: 600; margin: 10px 0 4px; color: #444; }
  .md p { line-height: 1.65; color: #555; margin-bottom: 6px; font-size: 12px; }
  .md ul, .md ol { padding-left: 18px; margin-bottom: 8px; }
  .md li { line-height: 1.8; color: #555; font-size: 12px; }
  .md code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; font-family: monospace; }
  .md pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 11px; margin: 6px 0; line-height: 1.5; }
  .md hr { border: none; border-top: 1px solid #eee; margin: 12px 0; }
  .md blockquote { border-left: 3px solid #ddd; padding-left: 10px; color: #777; font-size: 12px; margin: 6px 0; }
  .empty-msg { color: #bbb; font-size: 12px; text-align: center; padding: 48px 16px; line-height: 1.8; }

  /* 메인 */
  .main {
    flex: 1; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .tabs {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 20px;
    display: flex;
    flex-shrink: 0;
  }
  .tab {
    padding: 11px 16px; font-size: 12px; font-weight: 500;
    cursor: pointer; border-bottom: 2px solid transparent; color: #999;
    transition: color 0.15s;
  }
  .tab.active { color: #1a1a2e; border-bottom-color: #3a7bd5; }
  .panel { display: none; flex: 1; overflow: hidden; flex-direction: column; padding: 16px 20px; }
  .panel.active { display: flex; }

  /* 시나리오 테이블 */
  .table-container {
    flex: 1; overflow: auto;
    border: 1px solid #e0e0e0; border-radius: 6px;
    background: #fff;
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead { position: sticky; top: 0; z-index: 10; }
  th {
    background: #f0f4f8; padding: 8px 10px; text-align: left;
    font-weight: 600; border-bottom: 2px solid #d8e2ed;
    white-space: nowrap; color: #444;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.2px;
  }
  td { padding: 6px 9px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fbff; }
  td[contenteditable] { outline: none; cursor: text; }
  td[contenteditable]:focus { background: #fffde7; outline: 1px solid #f0c040; border-radius: 2px; }
  .add-row-bar {
    padding: 8px 12px; background: #fff;
    border-top: 1px solid #f0f0f0;
    text-align: left;
  }

  /* 우선순위 뱃지 */
  .p1 { background: #fdecea; color: #c0392b; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .p2 { background: #fef3e2; color: #d68910; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .p3 { background: #eafaf1; color: #1e8449; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }

  /* 정의서 */
  .def-editor {
    flex: 1;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 12px;
    border: 1px solid #e0e0e0; border-radius: 6px;
    padding: 16px; resize: none; outline: none;
    background: #fff; line-height: 1.75; color: #333;
  }
  .def-editor:focus { border-color: #3a7bd5; }

  /* 토스트 */
  #toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 10px 18px; border-radius: 6px;
    font-size: 12px; font-weight: 500;
    opacity: 0; transition: opacity 0.2s; pointer-events: none;
    z-index: 300;
  }
  #toast.success { background: #1e8449; color: #fff; }
  #toast.error { background: #c0392b; color: #fff; }
  #toast.show { opacity: 1; }

  /* 로딩 */
  .loading { display: flex; align-items: center; justify-content: center; height: 100%; color: #aaa; font-size: 12px; }

  /* Figma 프레임 갤러리 */
  .figma-gallery { display: flex; flex-direction: column; gap: 16px; }
  .figma-item { border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; }
  .figma-item-name {
    padding: 6px 10px; font-size: 11px; font-weight: 500;
    background: #f5f5f5; color: #444; border-bottom: 1px solid #e8e8e8;
  }
  .figma-item img { width: 100%; display: block; cursor: zoom-in; }

  /* 이미지 라이트박스 */
  #lightbox {
    display: none; position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.85); align-items: center; justify-content: center;
  }
  #lightbox.show { display: flex; }
  #lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 4px; }
  #lightbox-close {
    position: absolute; top: 16px; right: 20px;
    color: #fff; font-size: 24px; cursor: pointer; line-height: 1;
  }

  /* 동적 경로 ID 안내 뱃지 */
  .badge-info {
    display: inline-block; background: #e8f4fd; color: #2d62b0;
    font-size: 10px; padding: 2px 7px; border-radius: 3px;
    font-weight: 500; margin-left: 6px; vertical-align: middle;
  }

  /* 플레이스홀더 경고 */
  .placeholder-banner {
    margin: 8px 20px 0; padding: 8px 14px;
    background: #fffbe6; border: 1px solid #ffe58f; border-radius: 5px;
    font-size: 12px; color: #875300; display: flex; align-items: center; gap: 8px;
  }
  td.has-placeholder { background: #fffbe6 !important; }
  td.has-placeholder:focus { background: #fff7cc !important; }

  /* ── Step 2 전용 스타일 ─────────────────────────────── */

  /* 실행결과 배지 */
  .badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .badge-success { background: #eafaf1; color: #1e8449; }
  .badge-fail    { background: #fdecea; color: #c0392b; }
  .badge-block   { background: #fef3e2; color: #d68910; }

  /* 심각도 배지 */
  .badge-critical { background: #fdecea; color: #c0392b; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .badge-major    { background: #fef3e2; color: #d68910; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
  .badge-minor    { background: #fff9e6; color: #9a7200; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }

  /* Step4포함 토글 */
  .badge-step4-y { background: #e8f4fd; color: #2d62b0; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; cursor: pointer; }
  .badge-step4-n { background: #f0f0f0; color: #999;    padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; cursor: pointer; }

  /* 심각도 select */
  .severity-select { border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; font-size: 11px; background: #fff; cursor: pointer; }

  /* Step 2 요약 바 */
  .step2-summary { display: flex; gap: 16px; padding: 0 0 8px; font-size: 12px; flex-shrink: 0; }
  .sum-total  { color: #444; font-weight: 600; }
  .sum-pass   { color: #1e8449; font-weight: 600; }
  .sum-fail   { color: #c0392b; font-weight: 600; }
  .sum-block  { color: #d68910; font-weight: 600; }
  .sum-step4  { color: #2d62b0; font-weight: 600; }

  /* Step 2 필터 바 */
  .filter-bar { display: flex; gap: 6px; padding: 8px 0; flex-shrink: 0; }
  .filter-btn { padding: 4px 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 11px; font-weight: 500; }
  .filter-btn.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

  /* Step 2 실패/블로킹 행 */
  tr.row-fail td   { background: #fff5f5; }
  tr.row-block td  { background: #fffbf0; }
  tr.row-fail:hover td  { background: #fdecea; }
  tr.row-block:hover td { background: #fef3e2; }
</style>
</head>
<body>

<header>
  <h1>QA 검수 <span>/ Pipeline</span></h1>
  <div class="step-switcher">
    <button id="step-btn-1" class="step-btn active" onclick="switchStep(1)">Step 1 검수</button>
    <button id="step-btn-2" class="step-btn" onclick="switchStep(2)">Step 2 검수</button>
  </div>
  <select id="run-select" onchange="onRunChange(this.value)" style="padding:5px 8px;border-radius:4px;border:1px solid #444;background:#2a2a40;color:#ccc;font-size:12px;cursor:pointer">
    <option value="">실행 목록 로딩중...</option>
  </select>
  <span id="status-text"></span>
  <button class="btn btn-save" onclick="currentStep===1?saveAll():saveStep2()">저장</button>
  <button class="btn btn-commit" onclick="currentStep===1?doCommit():doCommit2()">저장 &amp; 커밋</button>
</header>

<!-- ── Step 1 검수 ──────────────────────────────────────── -->
<div id="step1-view">
<div class="layout">

  <div class="sidebar">
    <div class="sidebar-tabs">
      <div class="stab active" onclick="showSTab(0, this)">불일치 리포트</div>
      <div class="stab" onclick="showSTab(1, this)">기획서 초안</div>
    </div>
    <div class="sidebar-pane active md" id="s-mismatch">
      <div class="loading">불러오는 중...</div>
    </div>
    <div class="sidebar-pane" id="s-spec">
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <button class="btn-sm btn-add" id="spec-toggle" onclick="toggleSpecEdit()">편집</button>
      </div>
      <div class="md" id="s-spec-view"><div class="loading">불러오는 중...</div></div>
      <textarea id="s-spec-editor" class="def-editor" style="display:none;height:calc(100vh - 160px);width:100%;box-sizing:border-box"></textarea>
    </div>
  </div>

  <div class="main">
    <div class="tabs">
      <div class="tab active" onclick="showTab(0, this)">시나리오 CSV</div>
      <div class="tab" onclick="showTab(1, this)">정의서</div>
    </div>

    <div class="panel active" id="panel-scenarios">
      <div class="placeholder-banner" id="placeholder-banner" style="display:none"></div>
      <div class="table-container" id="table-container" style="margin-top:8px">
        <div class="loading">불러오는 중...</div>
      </div>
    </div>

    <div class="panel" id="panel-def">
      <textarea class="def-editor" id="def-editor" placeholder="qa_definition.md 내용이 여기 표시됩니다."></textarea>
    </div>
  </div>

</div>
</div>

<!-- ── Step 2 검수 ──────────────────────────────────────── -->
<div id="step2-view" style="display:none">
<div class="layout">

  <div class="sidebar">
    <div class="sidebar-tabs">
      <div class="stab active">추가 버그</div>
    </div>
    <div class="sidebar-pane active md" id="s2-extra-bugs">
      <div class="loading">불러오는 중...</div>
    </div>
  </div>

  <div class="main">
    <div class="tabs">
      <div class="tab active">QA 결과</div>
    </div>
    <div class="panel active" id="panel-step2" style="gap:0">
      <div class="step2-summary" id="step2-summary"></div>
      <div class="filter-bar">
        <button class="filter-btn active" onclick="filterStep2('all',this)">전체</button>
        <button class="filter-btn" onclick="filterStep2('성공',this)">성공</button>
        <button class="filter-btn" onclick="filterStep2('실패',this)">실패</button>
        <button class="filter-btn" onclick="filterStep2('블로킹',this)">블로킹</button>
      </div>
      <div class="table-container" id="step2-table-container">
        <div class="loading">불러오는 중...</div>
      </div>
    </div>
  </div>

</div>
</div>

<div id="toast"></div>

<div id="lightbox" onclick="closeLightbox()">
  <span id="lightbox-close" onclick="closeLightbox()">✕</span>
  <img id="lightbox-img" src="" alt="">
</div>

<script>
// ── 상태 ──────────────────────────────────────────────────
let state  = { scenarios: { headers: [], rows: [] }, definition: '', spec: '' };
let state2 = { results: { headers: [], rows: [] }, extraBugs: '' };
let currentRun  = '';
let currentStep = 1;
let step2Loaded = false;

// ── 실행 목록 초기 로드 ───────────────────────────────────
fetch('/api/runs')
  .then(r => r.json())
  .then(runs => {
    const sel = document.getElementById('run-select');
    if (!runs.length) {
      sel.innerHTML = '<option value="">실행 없음 (Step 1 먼저 실행)</option>';
      loadRun('');
      return;
    }
    sel.innerHTML = runs.map((r, i) =>
      \`<option value="\${r}">\${r.replace(/^(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{2})$/, '20$1-$2-$3 $4:$5')}\${i === 0 ? ' (최신)' : ''}</option>\`
    ).join('');
    currentRun = runs[0];
    loadRun(runs[0]);
  });

// ── Run 변경 (스텝 공통) ─────────────────────────────────
function onRunChange(runId) {
  currentRun = runId;
  step2Loaded = false;
  if (currentStep === 1) {
    loadRun(runId);
  } else {
    loadStep2Run(runId);
  }
}

// ── 스텝 전환 ─────────────────────────────────────────────
function switchStep(n) {
  currentStep = n;
  document.getElementById('step1-view').style.display = n === 1 ? '' : 'none';
  document.getElementById('step2-view').style.display = n === 2 ? '' : 'none';
  document.getElementById('step-btn-1').classList.toggle('active', n === 1);
  document.getElementById('step-btn-2').classList.toggle('active', n === 2);
  document.getElementById('status-text').textContent = '';
  if (n === 2 && !step2Loaded) {
    loadStep2Run(currentRun);
  }
  if (n === 1) updateStatus();
}

// ════════════════════════════════════════════════════════════
//  STEP 1
// ════════════════════════════════════════════════════════════

function loadRun(runId) {
  currentRun = runId;
  fetch(\`/api/data?\${runId ? 'run=' + runId : ''}\`)
    .then(r => r.json())
    .then(data => {
      state.scenarios = data.scenarios || { headers: [], rows: [] };
      state.definition = data.definition || '';
      state.spec = data.spec || '';

      renderMd('s-mismatch', data.mismatch,
        'mismatch_report.md 파일이 없습니다.\\nStep 1 실행 후 다시 확인하세요.');
      renderMd('s-spec-view', data.spec,
        'spec_draft.md 파일이 없습니다.\\nStep 1 실행 후 다시 확인하세요.');
      document.getElementById('s-spec-editor').value = state.spec;

      renderTable();
      document.getElementById('def-editor').value = state.definition;
      updateStatus();

      fetch(\`/api/figma-frames?\${runId ? 'run=' + runId : ''}\`)
        .then(r => r.json())
        .then(frames => enhanceMismatch(frames))
        .catch(() => enhanceMismatch([]));
    })
    .catch(() => toast('데이터 로드 실패.', 'error'));
}

function updateStatus() {
  const rows = state.scenarios.rows.length;
  document.getElementById('status-text').textContent = rows ? \`시나리오 \${rows}건\` : '';
}

// ── 마크다운 렌더 ─────────────────────────────────────────
function renderMd(id, md, emptyMsg) {
  const el = document.getElementById(id);
  if (!md || !md.trim()) {
    el.innerHTML = \`<div class="empty-msg">\${emptyMsg}</div>\`;
    return;
  }
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/^\&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\`\`\`[\s\S]*?\`\`\`/g, m => '<pre>' + m.replace(/\`\`\`\\w*/g,'').trim() + '</pre>')
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>');
  // 마크다운 테이블 → HTML 테이블
  html = html.replace(/((?:[ \t]*\|.+(?:\n|$))+)/g, block => {
    const rows = block.trim().split('\\n').map(r => r.trim()).filter(Boolean);
    const dataRows = rows.filter(r => !/^\|[-| :]+\|$/.test(r));
    if (dataRows.length < 1) return block;
    const makeRow = (row, isHead) => {
      const cells = row.split('|').slice(1, -1);
      const tag = isHead ? 'th' : 'td';
      return '<tr>' + cells.map(c => \`<\${tag}>\${c.trim()}</\${tag}>\`).join('') + '</tr>';
    };
    const [head, ...body] = dataRows;
    return \`<table><thead>\${makeRow(head, true)}</thead><tbody>\${body.map(r => makeRow(r, false)).join('')}</tbody></table>\`;
  });
  html = html.split('\\n')
    .map(line => {
      if (/^<[htbp]/.test(line) || line.trim() === '') return line;
      return \`<p>\${line}</p>\`;
    })
    .join('\\n');
  el.innerHTML = html;
}

// ── 시나리오 테이블 렌더 ──────────────────────────────────
function renderTable() {
  const container = document.getElementById('table-container');
  const { headers, rows } = state.scenarios;

  if (!headers.length) {
    container.innerHTML = \`
      <div class="loading" style="flex-direction:column;gap:8px">
        <div>qa_scenarios.csv 파일이 없습니다.</div>
        <div style="font-size:11px;color:#bbb">Step 1 실행 후 다시 확인하세요.</div>
      </div>\`;
    return;
  }

  // 플레이스홀더 감지
  const placeholderRows = rows.filter(r => r.some(c => String(c).includes('SAMPLE_')));
  const bannerEl = document.getElementById('placeholder-banner');
  if (placeholderRows.length > 0) {
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = \`⚠️ <strong>플레이스홀더 \${placeholderRows.length}건</strong> — SAMPLE_로 시작하는 ID를 실제 스테이징 ID로 수정하세요.\`;
  } else {
    bannerEl.style.display = 'none';
  }

  const priIdx      = headers.findIndex(h => h.includes('우선순위'));
  const mismatchIdx = headers.findIndex(h => h.includes('피그마일치여부'));

  const thHtml = headers.map(h => \`<th>\${h}</th>\`).join('') + '<th style="width:50px"></th>';
  const tbodyHtml = rows.map((row, ri) => {
    const needsJudgment = mismatchIdx >= 0 && (row[mismatchIdx] === '코드만' || row[mismatchIdx] === '피그마만');
    const rowStyle = needsJudgment ? ' style="background:#fff0f0"' : '';
    const cells = row.map((cell, ci) => {
      let display = escHtml(cell);
      if (ci === priIdx) {
        const cls = cell === 'P1' ? 'p1' : cell === 'P2' ? 'p2' : cell === 'P3' ? 'p3' : '';
        if (cls) display = \`<span class="\${cls}">\${cell}</span>\`;
      }
      if (ci === mismatchIdx && needsJudgment) {
        display = \`<span style="color:#c0392b;font-weight:600">\${escHtml(cell)}</span>\`;
      }
      const hasPlaceholder = String(cell).includes('SAMPLE_');
      return \`<td contenteditable="true" data-row="\${ri}" data-col="\${ci}" onblur="updateCell(this)" onfocus="this.innerHTML=escHtml(state.scenarios.rows[\${ri}][\${ci}])" \${hasPlaceholder ? 'class="has-placeholder" title="SAMPLE_ 플레이스홀더 — 실제 ID로 수정 필요"' : ''}>\${display}</td>\`;
    }).join('');
    return \`<tr\${rowStyle}>\${cells}<td><button class="btn-sm btn-del" onclick="delRow(\${ri})">삭제</button></td></tr>\`;
  }).join('');

  container.innerHTML = \`
    <table>
      <thead><tr>\${thHtml}</tr></thead>
      <tbody>\${tbodyHtml}</tbody>
    </table>
    <div class="add-row-bar">
      <button class="btn-sm btn-add" onclick="addRow()">+ 행 추가</button>
    </div>\`;

  updateStatus();
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function updateCell(td) {
  const ri = +td.dataset.row, ci = +td.dataset.col;
  state.scenarios.rows[ri][ci] = td.innerText.trim();
}

function addRow() {
  const cols = state.scenarios.headers.length || 8;
  state.scenarios.rows.push(Array(cols).fill(''));
  renderTable();
  const lastRow = document.querySelector('#table-container tbody tr:last-child td');
  if (lastRow) { lastRow.focus(); lastRow.innerHTML = ''; }
}

function delRow(ri) {
  if (!confirm(\`시나리오 \${ri + 1}번 행을 삭제할까요?\`)) return;
  state.scenarios.rows.splice(ri, 1);
  renderTable();
}

// ── 탭 전환 ───────────────────────────────────────────────
function showTab(idx, el) {
  document.querySelectorAll('#step1-view .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#step1-view .panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#step1-view .panel')[idx].classList.add('active');
}

function showSTab(idx, el) {
  document.querySelectorAll('#step1-view .stab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#step1-view .sidebar-pane').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#step1-view .sidebar-pane')[idx].classList.add('active');
}

// ── Mismatch 리포트 보강 ──────────────────────────────────
function enhanceMismatch(frames) {
  const el = document.getElementById('s-mismatch');

  // SCR-XX → 강조 + 시나리오 삭제 버튼
  el.querySelectorAll('li, p').forEach(node => {
    node.innerHTML = node.innerHTML.replace(/\\b(SCR-\\d+)\\b/g, (match) => {
      return \`<strong>\${match}</strong> <button class="btn-sm btn-del" onclick="deleteScenario('\${match}')">시나리오 삭제</button>\`;
    });
  });

  // 피그마에만 있는 화면: <code> 태그 내 파일명과 frames 목록 직접 매칭
  // 테이블/리스트 형식 모두 대응, 동일 파일 중복 삽입 방지
  if (!frames.length) return;
  const frameSet = new Set(frames);
  const inserted = new Set();
  el.querySelectorAll('code').forEach(code => {
    const fname = code.textContent.trim();
    if (!frameSet.has(fname) || inserted.has(fname)) return;
    inserted.add(fname);
    const div = document.createElement('div');
    div.className = 'figma-item';
    div.style.cssText = 'margin:6px 0 6px 8px;display:inline-block;vertical-align:top;';
    div.innerHTML = \`
      <div class="figma-item-name">\${fname}</div>
      <img src="/figma-frame/\${encodeURIComponent(fname)}?run=\${encodeURIComponent(currentRun)}" loading="lazy" onclick="openLightbox(this.src)" style="max-height:120px">\`;
    code.after(div);
  });
}

function deleteScenario(scenarioId) {
  const idx = state.scenarios.rows.findIndex(r => r[0] === scenarioId);
  if (idx === -1) { toast(\`\${scenarioId}를 시나리오에서 찾을 수 없습니다.\`, 'error'); return; }
  if (!confirm(\`\${scenarioId} (\${state.scenarios.rows[idx][1]})를 시나리오에서 삭제할까요?\`)) return;
  state.scenarios.rows.splice(idx, 1);
  renderTable();
  toast(\`\${scenarioId} 삭제됨\`, 'success');
}

// ── 기획서 초안 토글 ──────────────────────────────────────
function toggleSpecEdit() {
  const view   = document.getElementById('s-spec-view');
  const editor = document.getElementById('s-spec-editor');
  const btn    = document.getElementById('spec-toggle');
  const isEditing = editor.style.display !== 'none';
  if (isEditing) {
    state.spec = editor.value;
    renderMd('s-spec-view', state.spec, 'spec_draft.md 파일이 없습니다.');
    view.style.display = 'block';
    editor.style.display = 'none';
    btn.textContent = '편집';
  } else {
    editor.value = state.spec;
    view.style.display = 'none';
    editor.style.display = 'block';
    btn.textContent = '미리보기';
    editor.focus();
  }
}

// ── Step 1 저장 ───────────────────────────────────────────
async function saveAll() {
  state.definition = document.getElementById('def-editor').value;
  const specEditor = document.getElementById('s-spec-editor');
  if (specEditor.style.display !== 'none') state.spec = specEditor.value;
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios: state.scenarios, definition: state.definition, spec: state.spec, run: currentRun })
    });
    const data = await res.json();
    toast(data.ok ? '저장 완료' : '저장 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('저장 실패: ' + e.message, 'error');
  }
}

// ── Step 1 커밋 ───────────────────────────────────────────
async function doCommit() {
  await saveAll();
  if (!confirm('git commit & push 하시겠습니까?\\n\\n메시지: "step1: 검수 후 수정"')) return;
  try {
    const res = await fetch('/api/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run: currentRun })
    });
    const data = await res.json();
    toast(data.ok ? '커밋 & 푸시 완료' : '커밋 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('커밋 실패: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════
//  STEP 2
// ════════════════════════════════════════════════════════════

function loadStep2Run(runId) {
  step2Loaded = true;
  fetch(\`/api/step2/data?\${runId ? 'run=' + runId : ''}\`)
    .then(r => r.json())
    .then(data => {
      state2.results  = data.results  || { headers: [], rows: [] };
      state2.extraBugs = data.extraBugs || '';

      // 심각도, Step4포함 컬럼이 없으면 추가
      ['심각도', 'Step4포함'].forEach(col => {
        if (!state2.results.headers.includes(col)) {
          state2.results.headers.push(col);
          const def = col === 'Step4포함' ? 'Y' : '';
          state2.results.rows.forEach(r => r.push(def));
        }
      });

      renderMd('s2-extra-bugs', state2.extraBugs,
        '시나리오 외 추가 버그 없음\\n(extra_bugs.md 파일이 없거나 비어 있습니다)');
      renderStep2Table();
    })
    .catch(() => toast('Step 2 데이터 로드 실패.', 'error'));
}

function renderStep2Table() {
  const container = document.getElementById('step2-table-container');
  const { headers, rows } = state2.results;

  if (!headers.length) {
    container.innerHTML = \`
      <div class="loading" style="flex-direction:column;gap:8px">
        <div>qa_results.csv 파일이 없습니다.</div>
        <div style="font-size:11px;color:#bbb">Step 2 실행 후 다시 확인하세요.</div>
      </div>\`;
    document.getElementById('step2-summary').innerHTML = '';
    return;
  }

  const resultIdx   = headers.findIndex(h => h === '실행결과');
  const severityIdx = headers.findIndex(h => h === '심각도');
  const step4Idx    = headers.findIndex(h => h === 'Step4포함');
  const shotIdx     = headers.findIndex(h => h === '스크린샷경로');

  // 요약 바
  const total  = rows.length;
  const pass   = rows.filter(r => r[resultIdx] === '성공').length;
  const fail   = rows.filter(r => r[resultIdx] === '실패').length;
  const block  = rows.filter(r => r[resultIdx] === '블로킹').length;
  const step4c = rows.filter(r => step4Idx >= 0 && r[step4Idx] !== 'N').length;
  document.getElementById('step2-summary').innerHTML =
    \`<span class="sum-total">전체 \${total}건</span>
     <span class="sum-pass">✓ 성공 \${pass}</span>
     <span class="sum-fail">✗ 실패 \${fail}</span>
     <span class="sum-block">⚠ 블로킹 \${block}</span>
     <span class="sum-step4">Step4 포함: \${step4c}건</span>\`;

  const thHtml = headers.map(h => \`<th>\${escHtml(h)}</th>\`).join('');
  const tbodyHtml = rows.map((row, ri) => {
    const result = row[resultIdx] || '';
    const rowClass = result === '실패' ? ' class="row-fail"' : result === '블로킹' ? ' class="row-block"' : '';

    const cells = row.map((cell, ci) => {
      // 실행결과
      if (ci === resultIdx) {
        const cls = cell === '성공' ? 'badge-success' : cell === '실패' ? 'badge-fail' : cell === '블로킹' ? 'badge-block' : '';
        return \`<td>\${cls ? \`<span class="badge \${cls}">\${escHtml(cell)}</span>\` : escHtml(cell)}</td>\`;
      }
      // 심각도 select
      if (ci === severityIdx) {
        const opts = ['', 'Critical', 'Major', 'Minor']
          .map(v => \`<option value="\${v}" \${cell === v ? 'selected' : ''}>\${v || '—'}</option>\`)
          .join('');
        return \`<td><select class="severity-select" onchange="updateStep2Cell(this,\${ri},\${ci})">\${opts}</select></td>\`;
      }
      // Step4포함 토글
      if (ci === step4Idx) {
        const isY = cell !== 'N';
        return \`<td style="text-align:center"><span class="badge \${isY ? 'badge-step4-y' : 'badge-step4-n'}" onclick="toggleStep4(\${ri})" title="클릭하여 전환">\${isY ? 'Y' : 'N'}</span></td>\`;
      }
      // 스크린샷 썸네일
      if (ci === shotIdx && cell) {
        const fname = cell.replace(/^screenshots\\//, '');
        const src = \`/step2-shot/\${encodeURIComponent(fname)}?run=\${encodeURIComponent(currentRun)}\`;
        return \`<td><img src="\${src}" style="height:36px;cursor:zoom-in;border-radius:3px" loading="lazy" onclick="openLightbox(this.src)" onerror="this.parentNode.textContent=''"></td>\`;
      }
      // 기본 편집 가능 셀
      return \`<td contenteditable="true" data-row="\${ri}" data-col="\${ci}" onblur="updateStep2Cell(this,\${ri},\${ci})">\${escHtml(cell)}</td>\`;
    }).join('');

    return \`<tr\${rowClass}>\${cells}</tr>\`;
  }).join('');

  container.innerHTML = \`<table><thead><tr>\${thHtml}</tr></thead><tbody>\${tbodyHtml}</tbody></table>\`;
}

function updateStep2Cell(el, ri, ci) {
  state2.results.rows[ri][ci] = el.value !== undefined && el.tagName === 'SELECT'
    ? el.value
    : el.innerText.trim();
}

function toggleStep4(ri) {
  const idx = state2.results.headers.findIndex(h => h === 'Step4포함');
  if (idx === -1) return;
  state2.results.rows[ri][idx] = state2.results.rows[ri][idx] === 'N' ? 'Y' : 'N';
  renderStep2Table();
}

function filterStep2(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const resultIdx = state2.results.headers.findIndex(h => h === '실행결과');
  document.querySelectorAll('#step2-table-container tbody tr').forEach(row => {
    if (filter === 'all') { row.style.display = ''; return; }
    const cell = row.querySelectorAll('td')[resultIdx];
    const result = cell ? cell.textContent.trim() : '';
    row.style.display = result === filter ? '' : 'none';
  });
}

// ── Step 2 저장 ───────────────────────────────────────────
async function saveStep2() {
  try {
    const res = await fetch('/api/step2/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: state2.results, run: currentRun })
    });
    const data = await res.json();
    toast(data.ok ? 'Step 2 저장 완료' : '저장 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('저장 실패: ' + e.message, 'error');
  }
}

// ── Step 2 커밋 ───────────────────────────────────────────
async function doCommit2() {
  await saveStep2();
  if (!confirm('Step 2 결과를 git commit & push 하시겠습니까?')) return;
  try {
    const res = await fetch('/api/step2/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run: currentRun })
    });
    const data = await res.json();
    toast(data.ok ? '커밋 & 푸시 완료' : '커밋 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('커밋 실패: ' + e.message, 'error');
  }
}

// ── 공통 ──────────────────────────────────────────────────
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('show');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('show');
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = \`\${type} show\`;
  setTimeout(() => el.classList.remove('show'), 2800);
}

// Cmd+S
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    if (currentStep === 1) saveAll(); else saveStep2();
  }
});
</script>
</body>
</html>`;

// ── HTTP 서버 ─────────────────────────────────────────────

function router(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML);
  }

  if (req.method === 'GET' && req.url === '/api/runs') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(getRunDirs()));
  }

  // ── Step 1 라우트 ───────────────────────────────────────

  if (req.method === 'GET' && req.url.startsWith('/api/figma-frames')) {
    const runId = new URL(req.url, 'http://x').searchParams.get('run') || '';
    try {
      const dir = getFigmaDir(runId);
      const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(f => IMG_EXTS.has(path.extname(f).toLowerCase())).sort()
        : [];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(files));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('[]');
    }
  }

  if (req.method === 'GET' && req.url.startsWith('/figma-frame/')) {
    const params = new URL(req.url, 'http://x');
    const filename = decodeURIComponent(params.pathname.replace('/figma-frame/', ''));
    const runId = params.searchParams.get('run') || '';
    const filepath = path.join(getFigmaDir(runId), path.basename(filename));
    if (!fs.existsSync(filepath)) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filepath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.writeHead(200, { 'Content-Type': mime });
    return fs.createReadStream(filepath).pipe(res);
  }

  if (req.method === 'GET' && req.url.startsWith('/api/data')) {
    const runId = new URL(req.url, 'http://x').searchParams.get('run') || '';
    const csvText = readFile('qa_scenarios.csv', runId);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      mismatch:   readFile('mismatch_report.md', runId),
      spec:       readFile('spec_draft.md', runId),
      scenarios:  csvText ? parseCSV(csvText) : { headers: [], rows: [] },
      definition: readFile('qa_definition.md', runId),
    }));
  }

  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { scenarios, definition, spec, run } = JSON.parse(body);
        if (scenarios) writeFile('qa_scenarios.csv', serializeCSV(scenarios), run);
        if (definition !== undefined) writeFile('qa_definition.md', definition, run);
        if (spec !== undefined) writeFile('spec_draft.md', spec, run);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/commit') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { run } = body ? JSON.parse(body) : {};
        const runId = (run && RUN_PATTERN.test(run)) ? run : null;
        const step1Path = runId ? `output/step1/${runId}/` : 'output/step1/';
        const figmaPath = runId ? `input/figma_frames/${runId}/` : null;
        const commitMsg = runId ? `step1[${runId}]: 검수 후 수정` : 'step1: 검수 후 수정';

        // latest_run 포인터 파일 갱신
        if (runId) {
          fs.writeFileSync(path.join(BASE, 'output', 'latest_run'), runId, 'utf8');
        }

        const latestRunPath = 'output/latest_run';
        const addTargets = [step1Path, figmaPath, latestRunPath].filter(Boolean).join(' ');
        execSync(`git -C "${BASE}" add ${addTargets}`, { stdio: 'pipe' });
        execSync(`git -C "${BASE}" commit -m "${commitMsg}"`, { stdio: 'pipe' });
        execSync(`git -C "${BASE}" push origin main`, { stdio: 'pipe' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        const msg = e.stderr ? e.stderr.toString() : e.message;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: msg }));
      }
    });
    return;
  }

  // ── Step 2 라우트 ───────────────────────────────────────

  if (req.method === 'GET' && req.url.startsWith('/api/step2/data')) {
    const runId = new URL(req.url, 'http://x').searchParams.get('run') || '';
    const csvText = readStep2File('qa_results.csv', runId);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      results:   csvText ? parseCSV(csvText) : { headers: [], rows: [] },
      extraBugs: readStep2File('extra_bugs.md', runId),
    }));
  }

  if (req.method === 'GET' && req.url.startsWith('/step2-shot/')) {
    const params = new URL(req.url, 'http://x');
    const filename = decodeURIComponent(params.pathname.replace('/step2-shot/', ''));
    const runId = params.searchParams.get('run') || '';
    const filepath = path.join(getStep2Dir(runId), 'screenshots', path.basename(filename));
    if (!fs.existsSync(filepath)) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filepath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.writeHead(200, { 'Content-Type': mime });
    return fs.createReadStream(filepath).pipe(res);
  }

  if (req.method === 'POST' && req.url === '/api/step2/save') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { results, run } = JSON.parse(body);
        if (results) writeStep2File('qa_results.csv', serializeCSV(results), run);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/step2/commit') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { run } = body ? JSON.parse(body) : {};
        const runId = (run && RUN_PATTERN.test(run)) ? run : null;
        const step2Path = runId ? `output/step2/${runId}/` : 'output/step2/';
        const commitMsg = runId ? `step2[${runId}]: 검수 후 수정` : 'step2: 검수 후 수정';
        execSync(`git -C "${BASE}" add ${step2Path}`, { stdio: 'pipe' });
        execSync(`git -C "${BASE}" commit -m "${commitMsg}"`, { stdio: 'pipe' });
        execSync(`git -C "${BASE}" push origin main`, { stdio: 'pipe' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        const msg = e.stderr ? e.stderr.toString() : e.message;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: msg }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

http.createServer(router).listen(PORT, () => {
  console.log('\n  ┌─────────────────────────────────┐');
  console.log('  │   QA 검수 UI 실행 중              │');
  console.log(`  │   http://localhost:${PORT}          │`);
  console.log('  │   종료: Ctrl+C                    │');
  console.log('  └─────────────────────────────────┘\n');
});
