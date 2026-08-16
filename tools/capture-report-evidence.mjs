// capture-report-evidence.mjs — chụp ảnh bằng chứng từ 9 HTML report ĐÃ SINH RA THẬT.
//
// Script này KHÔNG tạo ra kết quả test nào. Nó chỉ mở các file report có sẵn trong
// reports/html/ (do tools/run-all-browsers.mjs sinh ra từ lần chạy thật) rồi chụp lại màn
// hình — tương đương việc người dùng tự mở file và bấm Print Screen, chỉ khác là làm tự động
// cho cả 9 lượt để không sót.
//
// §11 đòi bằng chứng "Run by: <MSSV>" + timestamp ISO phải NHÌN THẤY ĐƯỢC trên report. Ảnh
// chụp ở đây là tài liệu hoá điều đó cho báo cáo; bản thân file report mới là bằng chứng gốc
// và vẫn nằm nguyên trong bài nộp để TA tự mở kiểm.
//
//   node tools/capture-report-evidence.mjs
//
// Kết quả: reports/evidence/*.png

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML_DIR = path.join(ROOT, 'reports', 'html');
const OUT_DIR = path.join(ROOT, 'reports', 'evidence');

const RUNS = [
  'a-chromium', 'a-firefox', 'a-webkit',
  'b-chromium', 'b-firefox', 'b-webkit',
  'c-chromium', 'c-firefox', 'c-webkit',
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

let count = 0;

for (const label of RUNS) {
  const indexFile = path.join(HTML_DIR, label, 'index.html');
  if (!fs.existsSync(indexFile)) {
    console.warn(`  [BO QUA] Không thấy ${indexFile}`);
    continue;
  }

  await page.goto(pathToFileURL(indexFile).href);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(400);

  // 1) Toàn cảnh report: header + danh sách test + dải "Run by" ở chân trang.
  const overview = path.join(OUT_DIR, `report-${label}.png`);
  await page.screenshot({ path: overview });
  console.log(`  Đã chụp ${path.relative(ROOT, overview)}`);
  count++;

  // 2) Cận cảnh dải "Run by" — bằng chứng §11 đọc được rõ chữ.
  const banner = page.locator('#hw04-run-by');
  if (await banner.count()) {
    const bannerShot = path.join(OUT_DIR, `runby-${label}.png`);
    await banner.screenshot({ path: bannerShot });
    console.log(`  Đã chụp ${path.relative(ROOT, bannerShot)}`);
    count++;
  }
}

// 3) Một test case Fail đã mở rộng — cho thấy annotation (Run by / Test case / Technique)
//    và thông báo lỗi thật. Lấy từ lượt c-chromium vì chứa 3 TC bug bảo mật mới.
const detailFile = path.join(HTML_DIR, 'c-chromium', 'index.html');
if (fs.existsSync(detailFile)) {
  await page.goto(pathToFileURL(detailFile).href);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(400);

  const secTest = page.getByText('FR15-SEC-01', { exact: false }).first();
  if (await secTest.count()) {
    await secTest.click();
    await page.waitForTimeout(800);

    // Dải "Run by" dùng `position: fixed` nên trong ảnh fullPage nó nằm lơ lửng giữa trang và
    // che mất vài dòng nội dung. Đổi tạm sang `position: static` để nó trôi xuống cuối tài
    // liệu — CHỈ đổi cách xếp chỗ, không giấu và không sửa bất kỳ nội dung nào. Trang này còn
    // hiện "Run by" ở khối Annotations phía trên nên bằng chứng vẫn nguyên vẹn hai chỗ.
    await page.evaluate(() => {
      const el = document.querySelector('#hw04-run-by');
      if (el) el.style.position = 'static';
    });

    const detailShot = path.join(OUT_DIR, 'test-detail-FR15-SEC-01.png');
    await page.screenshot({ path: detailShot, fullPage: true });
    console.log(`  Đã chụp ${path.relative(ROOT, detailShot)}`);
    count++;
  }
}

await browser.close();
console.log(`\nXong: ${count} ảnh trong reports/evidence/`);
