// stamp-report.mjs — chèn dải "Run by: <MSSV>" vào cuối HTML report của MỘT lượt chạy.
//
// Vì sao cần, khi playwright.config.js đã đặt MSSV vào title và metadata?
//   · §11 nói bằng chứng này TA sẽ kiểm bằng mắt trên report. Title nằm ở tab trình duyệt,
//     metadata nằm trong khối có thể phải bấm mở → thêm một dải luôn hiển thị ở chân trang
//     cho chắc — đây là chỗ thứ BA mang MSSV, cùng với annotation `runMeta` ở từng test case.
//
// KHÔNG bịa số: mọi con số trong dải này đọc từ file JSON kết quả THẬT của lượt chạy đó.
// Script chỉ trình bày lại, không tạo ra kết quả nào.
//
//   node tools/stamp-report.mjs <htmlDir> <jsonFile> [runLabel]

import fs from 'node:fs';
import path from 'node:path';

const [htmlDir, jsonFile, runLabel = ''] = process.argv.slice(2);
const STUDENT_ID = process.env.STUDENT_ID || '23127183';
const STUDENT_NAME = process.env.STUDENT_NAME || 'Phạm Vũ Ngọc Duy';

if (!htmlDir) {
  console.error('Cách dùng: node tools/stamp-report.mjs <htmlDir> <jsonFile> [runLabel]');
  process.exit(1);
}

const indexFile = path.join(htmlDir, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.warn(`Lưu ý: Không thấy ${indexFile} — bỏ qua bước chèn dải Run by.`);
  process.exit(0);
}

/**
 * Đếm kết quả từ JSON reporter của Playwright (đệ quy qua suites lồng nhau).
 *
 * QUAN TRỌNG: `report.config.projects` liệt kê CẢ 3 project khai báo trong
 * playwright.config.js (chromium/firefox/webkit), bất kể `--project=<x>` nào thực sự chạy —
 * đây là danh sách CẤU HÌNH, không phải danh sách ĐÃ CHẠY. Đọc `projects[0].name` sẽ LUÔN ra
 * "chromium" dù đang xử lý report của firefox/webkit (đã tự phát hiện lỗi này trên report
 * thật của lượt a-firefox — dải "Run by" ghi nhầm "engine: chromium"). Tên engine THẬT SỰ đã
 * chạy nằm ở `spec.tests[0].projectName` của TỪNG test case.
 */
function readStats(file) {
  if (!file || !fs.existsSync(file)) return null;
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const stats = { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 };
  let project = '';
  const walk = (suites = []) => {
    for (const s of suites) {
      for (const spec of s.specs ?? []) {
        stats.total++;
        const status = spec.tests?.[0]?.status ?? 'unknown';
        if (status === 'expected') stats.passed++;
        else if (status === 'unexpected') stats.failed++;
        else if (status === 'flaky') stats.flaky++;
        else if (status === 'skipped') stats.skipped++;
        if (!project && spec.tests?.[0]?.projectName) project = spec.tests[0].projectName;
      }
      walk(s.suites);
    }
  };
  walk(report.suites);
  return {
    ...stats,
    startedAt: report.stats?.startTime ?? null,
    durationMs: Math.round(report.stats?.duration ?? 0),
    project,
  };
}

const stats = readStats(jsonFile);
const runAt = stats?.startedAt ?? new Date().toISOString();

const numbers = stats
  ? `${stats.total} test · ${stats.passed} pass · ${stats.failed} fail`
    + `${stats.flaky ? ` · ${stats.flaky} flaky` : ''}`
    + `${stats.skipped ? ` · ${stats.skipped} skipped` : ''}`
    + ` · ${(stats.durationMs / 1000).toFixed(1)}s`
  : 'không đọc được file JSON kết quả';

const banner = `
<div id="hw04-run-by" style="position:fixed;left:0;right:0;bottom:0;z-index:2147483647;
  font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;background:#0f172a;color:#e2e8f0;
  padding:6px 12px;display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between;
  border-top:2px solid #38bdf8">
  <span><strong>Run by: ${STUDENT_ID}</strong> — ${STUDENT_NAME}</span>
  <span>Run at (ISO 8601): <strong>${runAt}</strong></span>
  ${runLabel ? `<span>${runLabel}</span>` : ''}
  ${stats?.project ? `<span>engine: ${stats.project}</span>` : ''}
  <span>${numbers}</span>
</div>
<style>body{padding-bottom:44px}</style>
`;

let html = fs.readFileSync(indexFile, 'utf8');
if (html.includes('id="hw04-run-by"')) {
  // Đã chèn ở lần trước (ví dụ chạy lại stamp) → thay thế, không nhân bản.
  html = html.replace(/\n?<div id="hw04-run-by"[\s\S]*?<\/style>\n?/, '\n');
}
html = html.replace('</body>', `${banner}</body>`);

// Đặt luôn thẻ <title> để tab trình duyệt cũng hiện MSSV. Playwright 1.62 để mặc định
// "Playwright Test Report" và html reporter không có option đổi.
const pageTitle = `HW04 — Run by: ${STUDENT_ID}${runLabel ? ` — ${runLabel}` : ''} — ${runAt}`;
html = html.replace(/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`);

fs.writeFileSync(indexFile, html);

console.log(`  Đã chèn dải Run by vào ${indexFile}  (${numbers})`);
