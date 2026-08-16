// run-all-browsers.mjs — 9 lượt chạy: 3 feature × 3 browser engine (§6).
//
// §6 đòi: "Each feature must run on all three browsers — at least 9 browser runs in total.
// Each run must produce an HTML report" → mỗi lượt là một lệnh playwright riêng, ghi ra một
// thư mục HTML report riêng, nên đúng 9 report độc lập chứ không phải 1 report gộp.
//
//   node tools/run-all-browsers.mjs                    # đủ 9 lượt
//   node tools/run-all-browsers.mjs a                  # chỉ feature A, cả 3 browser
//   node tools/run-all-browsers.mjs a chromium          # 1 lượt duy nhất
//   SKIP_PREFLIGHT=1 node tools/run-all-browsers.mjs    # bỏ qua kiểm SUT
//
// Kết quả:
//   reports/html/<feature>-<browser>/index.html   ← HTML report, có "Run by: <MSSV>" ở title
//   reports/json/<feature>-<browser>.json         ← số liệu thô cho tools/summarize.mjs
//   reports/summary.md                            ← bảng tổng hợp 9 lượt
//
// Dùng child_process.spawnSync với shell:true để chạy được trên Windows PowerShell (không
// dùng cú pháp bash).

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const STUDENT_ID = process.env.STUDENT_ID || '23127183';
const REPORTS_ROOT = process.env.REPORTS_ROOT || 'reports';

const SPEC_OF = {
  a: 'tests/feature-a-login.spec.js',
  b: 'tests/feature-b-coupon.spec.js',
  c: 'tests/feature-c-product-admin.spec.js',
};
const TITLE_OF = {
  a: 'Feature A — FR-02 Đăng nhập & Khóa tài khoản',
  b: 'Feature B — FR-09 Mã giảm giá',
  c: 'Feature C — FR-15 Quản lý Sản phẩm (admin)',
};

const argFeatures = process.argv[2] ? [process.argv[2]] : ['a', 'b', 'c'];
const argBrowsers = process.argv[3] ? [process.argv[3]] : ['chromium', 'firefox', 'webkit'];

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: true, ...opts });
  return res.status ?? 1;
}

if (process.env.SKIP_PREFLIGHT !== '1') {
  console.log('── Preflight: kiểm SUT ──────────────────────────────────────────────');
  const preflightStatus = run('node', ['tools/preflight.mjs']);
  if (preflightStatus !== 0) {
    console.error('\nPreflight thất bại. Khởi động SUT trước khi chạy 9 lượt.');
    process.exit(1);
  }
}

// Một mã lần chạy dùng chung cho cả 9 lượt → dữ liệu <uniq> nhất quán, dễ truy vết trong DB.
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const defaultRunId = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const PW_RUN_ID = process.env.PW_RUN_ID || defaultRunId;

const totalRuns = argFeatures.length * argBrowsers.length;
console.log(`PW_RUN_ID = ${PW_RUN_ID}   ·   STUDENT_ID = ${STUDENT_ID}   ·   ${totalRuns} lượt\n`);

let runNo = 0;
const failedRuns = [];
const results = [];

for (const f of argFeatures) {
  const spec = SPEC_OF[f];
  const title = TITLE_OF[f] || f;
  if (!spec) {
    console.log(`Lưu ý: Không biết feature '${f}' (dùng a | b | c) — bỏ qua.`);
    continue;
  }

  for (const b of argBrowsers) {
    runNo++;
    const label = `${f}-${b}`;
    console.log('════════════════════════════════════════════════════════════════════');
    console.log(`  Lượt ${runNo}/${totalRuns} — ${title} trên ${b}`);
    console.log('════════════════════════════════════════════════════════════════════');

    const htmlDir = `${REPORTS_ROOT}/html/${label}`;
    const jsonFile = `${REPORTS_ROOT}/json/${label}.json`;
    const artifactsDir = `${REPORTS_ROOT}/artifacts/${label}`;

    // KHÔNG truyền --reporter ở đây: cờ CLI ghi đè cả mảng reporter lẫn options của nó trong
    // playwright.config.js, làm html/json mất đường dẫn theo lượt (đã tự gặp lỗi này ở
    // Feature B — xem ai-audit AI-09b).
    const status = run('npx', ['playwright', 'test', spec, `--project=${b}`], {
      env: {
        ...process.env,
        STUDENT_ID,
        PW_RUN_ID,
        PW_HTML_DIR: htmlDir,
        PW_JSON: jsonFile,
        PW_ARTIFACTS: artifactsDir,
        PW_RUN_LABEL: `${title} · ${b}`,
      },
    });

    // Playwright trả exit code khác 0 khi có test Fail. Ở bài này Fail là bằng chứng bug,
    // KHÔNG phải lỗi hạ tầng → ghi lại rồi chạy tiếp, không dừng cả 9 lượt.
    if (status !== 0) failedRuns.push(`${label}(exit=${status})`);

    // Chèn dải "Run by" vào cuối HTML report — số liệu lấy từ file JSON thật của lượt này.
    run('node', ['tools/stamp-report.mjs', htmlDir, jsonFile, `${title} · ${b}`], {
      env: { ...process.env, STUDENT_ID },
    });

    results.push({ label, status });
    console.log();
  }
}

console.log('── Tổng hợp ─────────────────────────────────────────────────────────');
run('node', ['tools/summarize.mjs'], { env: { ...process.env, STUDENT_ID, REPORTS_ROOT } });

if (failedRuns.length) {
  console.log('\nCác lượt có test Fail (bình thường — Fail là bằng chứng bug, xem reports/summary.md):');
  for (const r of failedRuns) console.log(`  · ${r}`);
}

console.log(`\nXem một report:  npx playwright show-report ${REPORTS_ROOT}/html/${argFeatures[0]}-${argBrowsers[0]}`);
