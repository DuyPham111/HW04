// data-loader.js — nạp test data từ .csv / .json NGOÀI script (§6: "The test data must be
// stored in a separate .csv or .json file — hardcoded inline arrays or objects in the script
// are not accepted").
//
// Vì thế các file .spec.js không được chứa mảng dữ liệu nào; chúng chỉ gọi loadCsv()/loadJson().
//
// CSV parser viết tay (không thêm dependency): hỗ trợ ô bọc trong dấu ngoặc kép có chứa dấu
// phẩy, và "" là escape của một dấu ngoặc kép bên trong ô.
//
// Token trong ô dữ liệu — cho phép diễn tả các giá trị mà CSV/JSON không viết thẳng ra được:
//   <empty>            → chuỗi rỗng ''            (test case "để trống")
//   <spaces:3>         → '   '                    (chuỗi chỉ gồm khoảng trắng)
//   <repeat:A:255>     → 'A' × 255                (test case biên độ dài)
//   <uniq>             → hậu tố duy nhất theo lần chạy (email/tên sản phẩm không trùng),
//                        thay được ở BẤT KỲ đâu trong chuỗi, ví dụ "lock-<uniq>@hw04.test"
// Token được giải ở tầng loader để file dữ liệu vẫn đọc được bằng mắt và bằng Excel.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, '..', 'data');

/**
 * Bỏ BOM (Byte Order Mark, U+FEFF) ở đầu file nếu có. File .csv/.json chứa tiếng Việt CẦN
 * ghi kèm BOM để Excel trên Windows mở đúng bảng mã (không có BOM, Excel double-click sẽ
 * đoán nhầm sang codepage hệ thống và hiện dấu tiếng Việt thành ký tự lỗi). Ngược lại, Node
 * đọc 'utf8' lại giữ nguyên BOM như MỘT KÝ TỰ trong chuỗi, làm cột đầu tiên của header CSV
 * dính BOM vào tên cột (`﻿tcId` thay vì `tcId`) và `JSON.parse` báo lỗi cú pháp. Excel
 * cũng tự thêm BOM mỗi khi "Save As → CSV UTF-8", nên hàm này còn cần thiết cho lần sau nếu
 * file được mở/sửa/lưu lại bằng Excel.
 */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Hậu tố duy nhất cho mỗi lần chạy suite. Dùng cho các test case tạo dữ liệu mới (đăng ký
 * user, tạo sản phẩm...): chạy lại với cùng một giá trị cố định sẽ đụng dữ liệu của lần
 * chạy trước và biến một test case hợp lệ thành flaky. Ổn định trong cùng một tiến trình
 * (một project browser = một worker process), và có thể ép cố định qua PW_RUN_ID để 9 lượt
 * (3 feature × 3 engine) dùng chung một mã, dễ truy vết trong DB.
 */
export const RUN_ID = process.env.PW_RUN_ID || Date.now().toString(36);

/** Tách một dòng CSV thành mảng ô, xử lý dấu ngoặc kép và escape "". */
function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

/**
 * Giải các token <...> trong một ô dữ liệu.
 *
 * `trim` — CSV mặc định TRUE, JSON mặc định FALSE. Lý do khác nhau:
 *   · Trong CSV, khoảng trắng quanh ô thường là nhiễu định dạng (`a, b` sau dấu phẩy) chứ
 *     không phải dữ liệu, nên cắt đi là đúng.
 *   · Trong JSON, chuỗi `"  SAVE10  "` là khoảng trắng CỐ Ý do người viết đặt vào. Nếu loader
 *     tự cắt thì test case "SUT có tự trim mã giảm giá không" sẽ nhận chuỗi ĐÃ ĐƯỢC CẮT SẴN
 *     và Pass mà chẳng kiểm gì cả — một Pass giả đúng nghĩa, vì công lao trim là của loader
 *     chứ không phải của SUT.
 * Muốn diễn tả chuỗi toàn khoảng trắng trong CSV thì dùng token `<spaces:N>`.
 */
export function resolveToken(raw, { trim = true } = {}) {
  const v = trim ? String(raw ?? '').trim() : String(raw ?? '');

  if (v === '<empty>') return '';

  const spaces = v.match(/^<spaces:(\d+)>$/);
  if (spaces) return ' '.repeat(Number(spaces[1]));

  const repeat = v.match(/^<repeat:(.+?):(\d+)>$/);
  if (repeat) return repeat[1].repeat(Number(repeat[2]));

  // <uniq> có thể nằm giữa chuỗi: "hw04-<uniq>@domain.com"
  return v.replace(/<uniq>/g, RUN_ID);
}

/**
 * Nạp file CSV → mảng object theo dòng header.
 * Dòng trống và dòng bắt đầu bằng '#' được bỏ qua (cho phép ghi chú ngay trong file dữ liệu).
 *
 * QUAN TRỌNG: việc kiểm '#' phải làm SAU KHI đã tách ô bằng splitCsvLine, không phải trên
 * chuỗi thô. Nếu một dòng comment chứa dấu ngoặc kép (ví dụ giải thích token `"-"`), Excel sẽ
 * tự động bọc CẢ DÒNG trong ngoặc kép khi lưu lại ("Save As → CSV UTF-8") để escape hợp lệ —
 * lúc đó dòng comment không còn bắt đầu bằng ký tự '#' theo đúng nghĩa đen ở byte đầu tiên
 * nữa (nó bắt đầu bằng '"'), dù nội dung bên trong vẫn là comment. Kiểm trên chuỗi thô sẽ bỏ
 * sót dòng này, khiến nó bị nạp nhầm thành dòng header/dữ liệu và làm lệch toàn bộ file.
 */
export function loadCsv(fileName) {
  const file = path.join(DATA_DIR, fileName);
  const text = stripBom(fs.readFileSync(file, 'utf8'));

  const rawLines = text.split(/\r?\n/);
  const lines = [];
  const lineNumbers = []; // số dòng gốc trong file, để báo lỗi đúng vị trí

  rawLines.forEach((l, idx) => {
    if (l.trim() === '') return;
    const firstCell = splitCsvLine(l)[0] ?? '';
    if (firstCell.trimStart().startsWith('#')) return;
    lines.push(l);
    lineNumbers.push(idx + 1);
  });

  if (lines.length < 2) {
    throw new Error(`File dữ liệu ${fileName} không có dòng dữ liệu nào (chỉ có header hoặc rỗng).`);
  }

  const header = splitCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line, i) => {
    const cells = splitCsvLine(line);
    if (cells.length !== header.length) {
      throw new Error(
        `${fileName} dòng ${lineNumbers[i + 1]}: có ${cells.length} ô nhưng header có ${header.length} cột. ` +
        `Ô chứa dấu phẩy phải bọc trong dấu ngoặc kép ("...").`,
      );
    }
    const row = {};
    header.forEach((key, colIdx) => { row[key] = resolveToken(cells[colIdx]); });
    return row;
  });
}

/**
 * Nạp file JSON. Mọi giá trị chuỗi đều được giải token, kể cả trong object/array lồng nhau.
 * KHÔNG trim — xem giải thích trong `resolveToken`: khoảng trắng trong JSON là cố ý.
 */
export function loadJson(fileName) {
  const file = path.join(DATA_DIR, fileName);
  const parsed = JSON.parse(stripBom(fs.readFileSync(file, 'utf8')));
  return deepResolve(parsed);
}

function deepResolve(node) {
  if (typeof node === 'string') return resolveToken(node, { trim: false });
  if (Array.isArray(node)) return node.map(deepResolve);
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, deepResolve(v)]));
  }
  return node;
}
