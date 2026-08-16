// summarize.mjs — đọc TẤT CẢ reports/json/*.json, sinh reports/summary.md.
//
// Không nhận tham số nào cho phép nhập số bằng tay — mọi con số phải truy được ngược về đúng
// một file JSON kết quả thật. README.md và report/main-report.md phải COPY số từ file này;
// đếm tay là chỗ dễ lệch nhất giữa các tài liệu.
//
//   node tools/summarize.mjs

import fs from 'node:fs';
import path from 'node:path';

const STUDENT_ID = process.env.STUDENT_ID || '23127183';
const REPORTS_ROOT = process.env.REPORTS_ROOT || 'reports';
const JSON_DIR = path.join(REPORTS_ROOT, 'json');
const OUT_FILE = path.join(REPORTS_ROOT, 'summary.md');

const FEATURE_LABEL = {
  a: 'A — FR-02 Đăng nhập & Khóa tài khoản',
  b: 'B — FR-09 Mã giảm giá',
  c: 'C — FR-15 Quản lý Sản phẩm',
};

function readRunStats(file) {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cases = []; // { tcId, title, status, engine }
  const walk = (suites = []) => {
    for (const s of suites) {
      for (const spec of s.specs ?? []) {
        const status = spec.tests?.[0]?.status ?? 'unknown';
        cases.push({ title: spec.title, status });
      }
      walk(s.suites);
    }
  };
  walk(report.suites);

  const stats = { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 };
  for (const c of cases) {
    stats.total++;
    if (c.status === 'expected') stats.passed++;
    else if (c.status === 'unexpected') stats.failed++;
    else if (c.status === 'flaky') stats.flaky++;
    else if (c.status === 'skipped') stats.skipped++;
  }

  return {
    cases,
    stats,
    startedAt: report.stats?.startTime ?? null,
    durationMs: Math.round(report.stats?.duration ?? 0),
    engine: report.config?.projects?.[0]?.name ?? '',
  };
}

if (!fs.existsSync(JSON_DIR)) {
  console.error(`Không thấy thư mục ${JSON_DIR}. Chạy tools/run-all-browsers.mjs trước.`);
  process.exit(1);
}

const files = fs.readdirSync(JSON_DIR).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error(`${JSON_DIR} không có file .json nào. Chạy tools/run-all-browsers.mjs trước.`);
  process.exit(1);
}

const runs = [];
for (const file of files) {
  const label = file.replace(/\.json$/, ''); // vd: a-chromium
  const [feature, engine] = label.split('-');
  const data = readRunStats(path.join(JSON_DIR, file));
  runs.push({ label, feature, engine, ...data });
}

// ── Bảng theo feature ────────────────────────────────────────────────────────────────────
const byFeature = {};
for (const r of runs) {
  byFeature[r.feature] ??= { runs: 0, pass: 0, fail: 0, tc: new Set() };
  byFeature[r.feature].runs++;
  byFeature[r.feature].pass += r.stats.passed;
  byFeature[r.feature].fail += r.stats.failed;
  for (const c of r.cases) byFeature[r.feature].tc.add(c.title);
}

// ── Test case Fail ở ≥1 engine ──────────────────────────────────────────────────────────
const failByTc = {}; // title -> Set(engine)
for (const r of runs) {
  for (const c of r.cases) {
    if (c.status === 'unexpected') {
      failByTc[c.title] ??= new Set();
      failByTc[c.title].add(r.engine);
    }
  }
}

// ── Tổng ─────────────────────────────────────────────────────────────────────────────────
const totalRuns = runs.length;
const totalExec = runs.reduce((s, r) => s + r.stats.total, 0);
const totalPass = runs.reduce((s, r) => s + r.stats.passed, 0);
const totalFail = runs.reduce((s, r) => s + r.stats.failed, 0);
const totalFlaky = runs.reduce((s, r) => s + r.stats.flaky, 0);
const totalSkip = runs.reduce((s, r) => s + r.stats.skipped, 0);
const totalDurationS = runs.reduce((s, r) => s + r.durationMs, 0) / 1000;
const totalTcAllFeatures = Object.values(byFeature).reduce((s, f) => s + f.tc.size, 0);

const now = new Date().toISOString();

let md = '';
md += `# Test Summary Report — HW04 Automation Testing\n\n`;
md += `**Run by:** ${STUDENT_ID} — sinh tự động lúc ${now} bằng \`node tools/summarize.mjs\`. `;
md += `Không sửa tay file này — sửa tay là chỗ dễ lệch nhất giữa các tài liệu.\n\n`;
md += `## Tổng\n\n`;
md += `| Chỉ số | Giá trị |\n|---|---|\n`;
md += `| Số feature automation | ${Object.keys(byFeature).length} |\n`;
md += `| Số test case automation | ${totalTcAllFeatures} |\n`;
md += `| Số lượt chạy browser | ${totalRuns} |\n`;
md += `| Số lần thực thi (TC × engine) | ${totalExec} |\n`;
md += `| Pass | ${totalPass} |\n`;
md += `| Fail | ${totalFail} |\n`;
md += `| Flaky | ${totalFlaky} |\n`;
md += `| Skipped | ${totalSkip} |\n`;
md += `| Test case Fail ở ≥1 engine | ${Object.keys(failByTc).length} |\n`;
md += `| Tổng thời gian chạy | ${totalDurationS.toFixed(1)}s |\n\n`;

md += `## Theo feature\n\n`;
md += `| Feature | TC | Lượt | Pass | Fail |\n|---|---|---|---|---|\n`;
for (const [f, d] of Object.entries(byFeature).sort()) {
  md += `| ${FEATURE_LABEL[f] ?? f} | ${d.tc.size} | ${d.runs} | ${d.pass} | ${d.fail} |\n`;
}
md += '\n';

md += `## ${totalRuns} lượt chạy — mỗi lượt một HTML report\n\n`;
md += `| # | Feature | Engine | Test | Pass | Fail | Flaky | Report |\n|---|---|---|---|---|---|---|---|\n`;
runs.forEach((r, i) => {
  md += `| ${i + 1} | ${r.feature.toUpperCase()} | ${r.engine} | ${r.stats.total} | ${r.stats.passed} | ${r.stats.failed} | ${r.stats.flaky} | [\`${r.label}\`](html/${r.label}/index.html) |\n`;
});
md += '\n';

md += `## Test case Fail ở ≥1 engine (dùng để viết bug report)\n\n`;
md += `| Test case | Engine Fail | Số engine |\n|---|---|---|\n`;
for (const [title, engines] of Object.entries(failByTc).sort()) {
  md += `| ${title} | ${[...engines].sort().join(', ')} | ${engines.size}/3 |\n`;
}
md += '\n';

fs.mkdirSync(REPORTS_ROOT, { recursive: true });
fs.writeFileSync(OUT_FILE, md);

console.log(`Đã sinh ${OUT_FILE}`);
console.log(`  ${totalRuns} lượt · ${totalExec} lần thực thi · ${totalPass} pass · ${totalFail} fail · ${totalFlaky} flaky`);
