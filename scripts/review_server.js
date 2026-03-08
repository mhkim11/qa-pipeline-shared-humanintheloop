#!/usr/bin/env node
/**
 * scripts/review_server.js
 * Step 1 검수 웹 UI
 * 사용법: node scripts/review_server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const BASE = path.resolve(process.env.HOME, 'qa-pipeline_humanintheloop');
const STEP1 = path.join(BASE, 'output', 'step1');
const FIGMA_FRAMES = path.join(BASE, 'input', 'figma_frames');
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

// ── CSV ──────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (!lines.length) return { headers: [], rows: [] };
  const parseLine = line => {
    const fields = []; let cur = ''; let q = false;
    for (const c of line) {
      if (c === '"') { q = !q; }
      else if (c === ',' && !q) { fields.push(cur); cur = ''; }
      else cur += c;
    }
    fields.push(cur);
    return fields.map(f => f.trim());
  };
  return { headers: parseLine(lines[0]), rows: lines.slice(1).map(parseLine) };
}

function serializeCSV({ headers, rows }) {
  const esc = v => (String(v).includes(',') || String(v).includes('"') || String(v).includes('\n'))
    ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  return [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
}

// ── 파일 I/O ─────────────────────────────────────────────

function readFile(name) {
  const p = path.join(STEP1, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function writeFile(name, content) {
  fs.mkdirSync(STEP1, { recursive: true });
  fs.writeFileSync(path.join(STEP1, name), content, 'utf8');
}

// ── HTML ──────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Step 1 검수</title>
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
</style>
</head>
<body>

<header>
  <h1>Step 1 검수 <span>/ QA Pipeline</span></h1>
  <span id="status-text"></span>
  <button class="btn btn-save" onclick="saveAll()">저장</button>
  <button class="btn btn-commit" onclick="doCommit()">저장 &amp; 커밋</button>
</header>

<div class="layout">

  <!-- 사이드바: 참고 자료 -->
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

  <!-- 메인: 편집 영역 -->
  <div class="main">
    <div class="tabs">
      <div class="tab active" onclick="showTab(0, this)">시나리오 CSV</div>
      <div class="tab" onclick="showTab(1, this)">정의서</div>
    </div>

    <div class="panel active" id="panel-scenarios">
      <div class="table-container" id="table-container">
        <div class="loading">불러오는 중...</div>
      </div>
    </div>

    <div class="panel" id="panel-def">
      <textarea class="def-editor" id="def-editor" placeholder="qa_definition.md 내용이 여기 표시됩니다."></textarea>
    </div>
  </div>

</div>

<div id="toast"></div>

<div id="lightbox" onclick="closeLightbox()">
  <span id="lightbox-close" onclick="closeLightbox()">✕</span>
  <img id="lightbox-img" src="" alt="">
</div>

<script>
let state = { scenarios: { headers: [], rows: [] }, definition: '', spec: '' };

// ── 초기 로드 ─────────────────────────────────────────
fetch('/api/data')
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

    // figma 프레임 목록 로드 후 mismatch 리포트 보강
    fetch('/api/figma-frames')
      .then(r => r.json())
      .then(frames => enhanceMismatch(frames))
      .catch(() => enhanceMismatch([]));
  })
  .catch(() => toast('데이터 로드 실패. 서버가 실행 중인지 확인하세요.', 'error'));

// ── 상태 표시 ─────────────────────────────────────────
function updateStatus() {
  const rows = state.scenarios.rows.length;
  document.getElementById('status-text').textContent = rows ? \`시나리오 \${rows}건\` : '';
}

// ── 마크다운 렌더 ─────────────────────────────────────
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
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .split('\\n')
    .map(line => {
      if (/^<[hlbp]/.test(line) || line.trim() === '') return line;
      return \`<p>\${line}</p>\`;
    })
    .join('\\n');
  el.innerHTML = html;
}

// ── 테이블 렌더 ───────────────────────────────────────
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

  // 컬럼 인덱스
  const priIdx = headers.findIndex(h => h.includes('우선순위'));
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
      return \`<td contenteditable="true" data-row="\${ri}" data-col="\${ci}" onblur="updateCell(this)" onfocus="this.innerHTML=escHtml(state.scenarios.rows[\${ri}][\${ci}])">\${display}</td>\`;
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

// ── 탭 전환 ───────────────────────────────────────────
function showTab(idx, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.panel')[idx].classList.add('active');
}

function showSTab(idx, el) {
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-pane').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.sidebar-pane')[idx].classList.add('active');
}

// ── Mismatch 리포트 보강 ──────────────────────────────

function enhanceMismatch(frames) {
  const el = document.getElementById('s-mismatch');

  // 1. 동적 경로 ID 섹션에 안내 뱃지 추가
  el.querySelectorAll('h2, h3').forEach(h => {
    if (h.textContent.includes('동적 경로 ID')) {
      h.innerHTML += '<span class="badge-info">Step 2 이후 자동 업데이트</span>';
    }
  });

  // 2. SCR-XX 참조에 시나리오 삭제 버튼 추가
  el.querySelectorAll('li, p').forEach(node => {
    node.innerHTML = node.innerHTML.replace(/\b(SCR-\d+)\b/g, (match) => {
      return \`<strong>\${match}</strong> <button class="btn-sm btn-del" onclick="deleteScenario('\${match}')">시나리오 삭제</button>\`;
    });
  });

  // 3. "피그마에만 있는 화면" 섹션 아래 항목별 이미지 인라인 삽입
  if (!frames.length) return;
  let inFigmaSection = false;
  el.querySelectorAll('h2, h3, li, p').forEach(node => {
    const tag = node.tagName.toLowerCase();
    if ((tag === 'h2' || tag === 'h3') && node.textContent.includes('피그마에만 있는 화면')) {
      inFigmaSection = true; return;
    }
    if ((tag === 'h2' || tag === 'h3') && inFigmaSection) {
      inFigmaSection = false; return;
    }
    if ((tag === 'li' || tag === 'p') && inFigmaSection) {
      // li 텍스트에서 파일명 추출 (백틱 혹은 "프레임:" 이후)
      const text = node.textContent;
      const filenameMatch = text.match(/프레임[:\\s]+([\\w가-힣.\\-_]+\\.(?:png|jpg|jpeg|webp))/i)
        || text.match(/\`([\\w가-힣.\\-_]+\\.(?:png|jpg|jpeg|webp))\`/i);
      let matched = filenameMatch ? frames.find(f => f === filenameMatch[1]) : null;

      // 파일명 명시 없으면 li 텍스트 키워드로 퍼지 매칭
      if (!matched) {
        const keywords = text.toLowerCase().replace(/[^a-z0-9가-힣]/g, ' ').split(/\\s+/).filter(k => k.length > 1);
        matched = frames.find(f => keywords.some(k => f.toLowerCase().includes(k)));
      }

      if (matched) {
        const img = document.createElement('div');
        img.className = 'figma-item';
        img.style.marginTop = '8px';
        img.innerHTML = \`
          <div class="figma-item-name">\${matched}</div>
          <img src="/figma-frame/\${encodeURIComponent(matched)}" loading="lazy" onclick="openLightbox(this.src)">\`;
        node.after(img);
      }
    }
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

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('show');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('show');
}

// ── 기획서 초안 토글 ──────────────────────────────────
function toggleSpecEdit() {
  const view = document.getElementById('s-spec-view');
  const editor = document.getElementById('s-spec-editor');
  const btn = document.getElementById('spec-toggle');
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

// ── 저장 ─────────────────────────────────────────────
async function saveAll() {
  state.definition = document.getElementById('def-editor').value;
  const specEditor = document.getElementById('s-spec-editor');
  if (specEditor.style.display !== 'none') state.spec = specEditor.value;
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios: state.scenarios, definition: state.definition, spec: state.spec })
    });
    const data = await res.json();
    toast(data.ok ? '저장 완료' : '저장 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('저장 실패: ' + e.message, 'error');
  }
}

// ── 커밋 ─────────────────────────────────────────────
async function doCommit() {
  await saveAll();
  if (!confirm('git commit & push 하시겠습니까?\\n\\n메시지: "step1: 검수 후 수정"')) return;
  try {
    const res = await fetch('/api/commit', { method: 'POST' });
    const data = await res.json();
    toast(data.ok ? '커밋 & 푸시 완료' : '커밋 실패: ' + data.error, data.ok ? 'success' : 'error');
  } catch (e) {
    toast('커밋 실패: ' + e.message, 'error');
  }
}

// ── 토스트 ───────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = \`\${type} show\`;
  setTimeout(() => el.classList.remove('show'), 2800);
}

// Ctrl+S 단축키
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveAll(); }
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

  if (req.method === 'GET' && req.url === '/api/figma-frames') {
    try {
      const files = fs.existsSync(FIGMA_FRAMES)
        ? fs.readdirSync(FIGMA_FRAMES).filter(f => IMG_EXTS.has(path.extname(f).toLowerCase())).sort()
        : [];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(files));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('[]');
    }
  }

  if (req.method === 'GET' && req.url.startsWith('/figma-frame/')) {
    const filename = decodeURIComponent(req.url.replace('/figma-frame/', ''));
    const filepath = path.join(FIGMA_FRAMES, path.basename(filename));
    if (!fs.existsSync(filepath)) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filepath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.writeHead(200, { 'Content-Type': mime });
    return fs.createReadStream(filepath).pipe(res);
  }

  if (req.method === 'GET' && req.url === '/api/data') {
    const csvText = readFile('qa_scenarios.csv');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      mismatch:   readFile('mismatch_report.md'),
      spec:       readFile('spec_draft.md'),
      scenarios:  csvText ? parseCSV(csvText) : { headers: [], rows: [] },
      definition: readFile('qa_definition.md'),
    }));
  }

  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { scenarios, definition, spec } = JSON.parse(body);
        if (scenarios) writeFile('qa_scenarios.csv', serializeCSV(scenarios));
        if (definition !== undefined) writeFile('qa_definition.md', definition);
        if (spec !== undefined) writeFile('spec_draft.md', spec);
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
    try {
      execSync(`git -C "${BASE}" add output/step1/`, { stdio: 'pipe' });
      execSync(`git -C "${BASE}" commit -m "step1: 검수 후 수정"`, { stdio: 'pipe' });
      execSync(`git -C "${BASE}" push origin main`, { stdio: 'pipe' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      const msg = e.stderr ? e.stderr.toString() : e.message;
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: msg }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

http.createServer(router).listen(PORT, () => {
  console.log('\n  ┌─────────────────────────────────┐');
  console.log('  │   Step 1 검수 UI 실행 중          │');
  console.log(`  │   http://localhost:${PORT}          │`);
  console.log('  │   종료: Ctrl+C                    │');
  console.log('  └─────────────────────────────────┘\n');
});
