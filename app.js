window.__LEDGER_BUILD__ = { mode: 'web', view: 'owner', built: '2026-10-26T11:53:08.769Z' };

(function (root, factory) {
var api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root && typeof root === 'object') { root.Ledger = root.Ledger || {}; root.Ledger.Snapshot = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
var SCHEMA = 1;
var STORES = ['2ho', 'eungam', 'all'];
var WON_MONTHLY = ['revenue', 'rev_card', 'rev_delivery', 'rev_easypay', 'other_income', 'income_total', 'food', 'labor',
'rent_fixed', 'utilities', 'delivery_fees', 'taxes', 'opex', 'review', 'op_cost', 'op_profit', 'finance_out',
'owner_transfer', 'family_transfer', 'internal_net', 'food_accrual', 'op_profit_accrual'];
var DEBT_COLUMNS = ['nain', 'taejo', 'hyunjin', 'bethel', 'other_ap', 'tax_2ho', 'tax_eungam', 'utility_unpaid',
'loan_corp', 'loan_other', 'ap_total', 'tax_total', 'loan_total', 'all_total'];
var DEBT_LEAF = ['nain', 'taejo', 'hyunjin', 'bethel', 'other_ap', 'tax_2ho', 'tax_eungam', 'utility_unpaid', 'loan_corp', 'loan_other'];
var HALF_WON_OK = { monthly: true, itemsYearly: true };
function cols(spec) {
return spec.trim().split(/\s+/).map(function (p) { var i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1)]; });
}
function monthlyCols() {
var out = cols('month:month store:text store_label:text has_data:flag');
WON_MONTHLY.forEach(function (c) {
out.push([c, 'won']);
if (c === 'op_profit') out.push(['op_margin', 'ratio']);
});
out.push(['accrual_complete', 'flag']);
return out;
}
var TABLES = [
{ name: 'web_index', snap: null, id: ['name'], cols: cols('name:text range:text rows:int cols:int description:text') },
{ name: 'web_meta', snap: 'meta', id: ['key'], cols: cols('key:text value:auto') },
{ name: 'web_years', snap: 'years', id: ['year'], cols: cols('year:int months_with_data:int first_month:month last_month:month') },
{ name: 'web_monthly', snap: 'monthly', id: ['month', 'store'], cols: monthlyCols() },
{ name: 'web_items_yearly', snap: 'itemsYearly', id: ['year', 'store', 'major', 'item'], cols: cols('year:int store:text major:text item:text kind:text amount:won pct_of_revenue:ratio') },
{ name: 'web_debts', snap: 'debts', id: ['debt_id'], cols: cols('debt_id:text kind:text name:text store:text method:text start_date:date start_balance:won current_date:date current_balance:won confirmed_date:date confirmed_balance:won confirmed_source:text diff_vs_confirmed:won reduced:won progress_pct:ratio change_3m:won avg_net_paydown_3m:num payoff_months:num payoff_month:month status:text') },
{ name: 'web_debt_monthly', snap: 'debtMonthly', id: ['month'], cols: [['month', 'month']].concat(DEBT_COLUMNS.map(function (c) { return [c, 'won']; })) },
{ name: 'web_supplier_recent', snap: 'supplierRecent', id: ['supplier', 'date'], cols: cols('supplier:text date:date buy_2ho:won buy_eungam:won buy_common:won buy_total:won paid:won balance:won statement_balance:won') },
{ name: 'web_tax', snap: 'tax', id: ['tax_id'], cols: cols('tax_id:text store:text tax_kind:text period_label:text due_date:date amount_due:won paid:won remaining:won status:text basis:text') },
{ name: 'web_utilities', snap: 'utilities', id: ['month', 'place', 'item'], cols: cols('month:month place:text item:text billed:won paid_bank:won owner_record:won status:text') },
{ name: 'web_checks', snap: 'checks', id: ['check_id'], cols: cols('check_id:text label:text status:text value:auto expected:auto') },
{ name: 'web_review', snap: 'review', id: ['type'], cols: cols('type:text label:text count:int amount:won') },
{ name: 'web_review_items', snap: 'reviewItems', id: ['rank'], cols: cols('rank:int type:text title_masked:text amount:won location:text note:text') },
{ name: 'web_fields', snap: 'fields', id: ['table', 'field'], cols: cols('table:text field:text label_ko:text unit:text description:text') }
];
var BY_NAME = {}, BY_SNAP = {};
TABLES.forEach(function (t) { BY_NAME[t.name] = t; if (t.snap) BY_SNAP[t.snap] = t; });
var SNAP_KEYS = ['meta', 'years', 'monthly', 'itemsYearly', 'debts', 'debtMonthly', 'supplierRecent', 'tax', 'utilities', 'checks', 'review', 'reviewItems', 'fields'];
var EXT_TABLES = [
{ name: 'ext_util_bills', snap: 'utilBills', id: ['place', 'item', 'month'], cols: cols('place:text item:text month:month n:int amount:won billed:won arrears:won n_bank:int n_auto:int n_check:int n_unpaid:int n_hold:int due:date issued:date autopay:text paid_n:int hl_n:int hl_billed:won hl_due:date hl_autopay:text') },
{ name: 'ext_notes', snap: 'notes', id: ['id'], cols: cols('id:text scope:text period:text store:text kind:text text:text') },
{ name: 'ext_tax_monthly', snap: 'taxMonthly', id: ['month', 'store'], cols: cols('month:month store:text remaining:won n:int') },
{ name: 'ext_tax_liab', snap: 'taxLiab', id: ['id'], cols: cols('id:text store:text kind:text period:text start:month final:won paid:won last_paid:date n_pay:int assumed:int') },
{ name: 'ext_bank_monthly', snap: 'bankMonthly', id: ['month', 'store'], cols: cols('month:month store:text open:won close:won n:int other:half xfer:half loan_p:half kw_o:half kw_f:half tax_x:half ptax:half bc:won bc_n:int') },
{ name: 'ext_pnl_adj', snap: 'pnlAdj', id: ['month', 'store'], cols: cols('month:month store:text food:half labor:half rent_fixed:half opex:half taxes:half op_cost:half op_profit:half d_food:half d_labor:half d_rent:half d_family:half') },
{ name: 'ext_food_basis', snap: 'foodBasis', id: ['month', 'supplier'], cols: cols('month:month supplier:text basis:text buy:half paid:half') },
{ name: 'ext_tax_paid', snap: 'taxPaid', id: ['month', 'store', 'kind'], cols: cols('month:month store:text kind:text amount:half') },
{ name: 'ext_tax_pays', snap: 'taxPays', id: ['date', 'store', 'seq'], cols: cols('date:date store:text seq:int kind:text amount:won') },
{ name: 'ext_sup_daily', snap: 'supDaily', id: ['supplier', 'date'], cols: cols('supplier:text date:date buy:won b2:won be:won bc:won adj:won fix:won paid:won bal:won stmt:won src:text flag:text') },
{ name: 'ext_sup_open', snap: 'supOpen', id: ['supplier'], cols: cols('supplier:text date:date bal:won first_date:date last_date:date last_bal:won') },
{ name: 'ext_sup_gaps', snap: 'supGaps', id: ['supplier', 'from'], cols: cols('supplier:text from:date to:date amount:won') },
{ name: 'ext_review_text', snap: 'reviewText', id: ['id'], cols: cols('id:text text:text answer:text') },
{ name: 'ext_item_summary', snap: 'itemSummary', id: ['supplier', 'item'], cols: cols('supplier:text item:text unit:text n:int qty:num amount:won first_date:date first_price:won last_date:date last_price:won min_price:won max_price:won sure:text') },
{ name: 'ext_item_monthly', snap: 'itemMonthly', id: ['supplier', 'item', 'month'], cols: cols('supplier:text item:text month:month n:int qty:num amount:won avg:won min:won max:won') }
];
EXT_TABLES.forEach(function (t) { BY_NAME[t.name] = t; BY_SNAP[t.snap] = t; });
var TAX_KEYS = ['taxMeta', 'taxMonthly', 'taxLiab'];
var CASH_KEYS = ['bankMeta', 'bankMonthly'];
var ADJ_KEYS = ['adjMeta', 'pnlAdj', 'foodBasis', 'taxPaid'];
var OWNER_EXT_KEYS = TAX_KEYS.concat(CASH_KEYS, ADJ_KEYS, ['supMeta', 'supDaily', 'supOpen', 'supGaps']);
var LAZY_KEYS = ['txm', 'txo'];
var SUP_KEYS = ['supMeta', 'supDaily', 'supOpen', 'supGaps'];
var ITEM_KEYS = ['itemMeta', 'itemSummary', 'itemMonthly'];
var EXT_KEYS = ['extMeta', 'utilBills', 'notes'].concat(TAX_KEYS, CASH_KEYS, ADJ_KEYS, ['taxPays', 'reviewText'], SUP_KEYS, ITEM_KEYS);
var SUP_META_TYPES = { schema: 'int', from: 'date', to: 'date', bank_last: 'date', rows: 'int', breaks: 'int' };
var ITEM_META_TYPES = { schema: 'int', from: 'date', to: 'date', nain_docs: 'int', nain_lines: 'int', taejo_docs: 'int', taejo_lines: 'int', taejo_lines_all: 'int', taejo_outliers: 'int', hyunjin_docs: 'int', hyunjin_lines: 'int', bethel_docs: 'int' };
var EXT_META_TYPES = { schema: 'int', util_cutoff: 'date', bank_asof: 'date', bills_source: 'text', bills_rows: 'int', bills_last: 'date', notes_source: 'text', notes_count: 'int', notes_updated: 'datetime',
bills_held: 'int', bills_matched: 'int', bills_skipped: 'int' };
var TAX_META_TYPES = { schema: 'int', snap_date: 'date', first_month: 'month', check_ok: 'flag', got_all: 'won', want_all: 'won', got_2ho: 'won', want_2ho: 'won', got_eungam: 'won', want_eungam: 'won',
assumed_n: 'int', assumed_amount: 'won', payments: 'int', liabilities: 'int', skipped_local: 'int', skipped_other: 'int' };
var BANK_META_TYPES = { schema: 'int', first_month: 'month', last_month: 'month', rows: 'int', breaks_2ho: 'int', breaks_eungam: 'int', ok: 'flag' };
var ADJ_META_TYPES = { schema: 'int', first_month: 'month', last_month: 'month', moves_labor: 'int', moves_rent: 'int', refunds: 'int', family_quarters: 'int', food_stmt_months: 'int', food_bank_months: 'int', fills_used: 'int',
half_rows: 'int', half_rows_h: 'int', half_excel: 'flag', ok: 'flag' };
function hasExt(snap) { return !!snap && EXT_KEYS.some(function (k) { return snap[k] != null; }); }
var META_TYPES = {
schema_version: 'text', data_as_of: 'date', bank_last_2ho: 'date', bank_last_eungam: 'date', stmt_last_nain: 'date',
stmt_last_taejo: 'date', stmt_last_hyunjin: 'date', bills_last: 'date', tax_snapshot_date: 'date', built_at: 'datetime',
refreshed_at: 'datetime', review_count: 'int', unclassified_count: 'int', blank_count: 'int', mismatch_count: 'int',
open_question_count: 'int', checks_failed: 'int', photos_processed: 'int', photos_pending: 'int'
};
var META_REQUIRED = ['schema_version', 'data_as_of'];
var ENUMS = {
'monthly.store': STORES, 'itemsYearly.store': STORES, 'debts.store': STORES,
'itemsYearly.kind': ['income', 'expense', 'outside'],
'debts.kind': ['supplier', 'tax', 'loan', 'utility', 'other'],
'debts.method': ['ledger', 'snapshot', 'manual'],
'debts.status': ['줄어드는 중', '늘어나는 중', '줄지 않는 중', '확인 필요'],
'tax.store': STORES,
'tax.status': ['미납', '기한전', '일부', '납부완료', '확인필요'],
'utilities.status': ['일치', '차이', '기록 없음', '은행 없음', '다른 계좌', '빠짐?'],
'checks.status': ['ok', 'warn', 'fail'],
'review.type': ['분류', '가게 나누기', '글씨', '계산 안 맞음', '빈칸', '빠진 자료', '재촬영'],
'reviewItems.type': ['분류', '가게 나누기', '글씨', '계산 안 맞음', '빈칸', '빠진 자료', '재촬영', '확인']
};
var MAJOR_TO_COLUMN = {
'매출': 'revenue', '기타수입': 'other_income', '기타 수입': 'other_income',
'식재료비': 'food', '식재료': 'food', '인건비': 'labor', '임대료·고정비': 'rent_fixed', '임대·고정비': 'rent_fixed',
'공과금': 'utilities', '배달·수수료': 'delivery_fees', '배달 수수료': 'delivery_fees', '세금': 'taxes',
'운영비': 'opex', '기타 운영비': 'opex', '확인 필요': 'review', '미분류': 'review', '확인 중': 'review',
'금융·비정기': 'finance_out'
};
var ITEM_TO_COLUMN = {
'대표자 이체': 'owner_transfer', '가족 이체': 'family_transfer', '지점간 이체': 'internal_net', '가게 간 이동': 'internal_net', '대출 상환': 'finance_out'
};
function columnOfItem(major, item) { return ITEM_TO_COLUMN[item] || MAJOR_TO_COLUMN[major] || null; }
function isBlank(v) { return v === null || v === undefined || (typeof v === 'string' && v.trim() === ''); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function excelSerialToIso(n) {
var ms = Math.round((n - 25569) * 86400000), d = new Date(ms);
return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}
function toNumberLoose(v) {
if (typeof v === 'number') return v;
if (typeof v === 'boolean') return v ? 1 : 0;
var s = String(v).trim().replace(/[,\s]/g, '').replace(/원$/, '').replace(/−/g, '-');
if (/^\((.*)\)$/.test(s)) s = '-' + s.slice(1, -1);
if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return NaN;
return Number(s);
}
function snapInt(n) { var r = Math.round(n); return Math.abs(n - r) < 1e-6 ? r : n; }
function round6(n) { return Math.round(n * 1e6) / 1e6; }
function normalize(v, type) {
if (isBlank(v)) return type === 'flag' ? false : null;
switch (type) {
case 'text': return String(v).trim();
case 'month':
if (typeof v === 'number' && v > 20000) return excelSerialToIso(v).slice(0, 7);
return String(v).trim();
case 'date':
if (typeof v === 'number' && v > 20000) return excelSerialToIso(v);
return String(v).trim();
case 'datetime': return String(v).trim();
case 'won': case 'int': {
var n = toNumberLoose(v);
return Number.isFinite(n) ? snapInt(n) : String(v).trim();
}
case 'num': { var m = toNumberLoose(v); return Number.isFinite(m) ? round6(m) : String(v).trim(); }
case 'ratio': {
if (typeof v === 'string' && /%\s*$/.test(v)) { var p = toNumberLoose(v.replace(/%\s*$/, '')); return Number.isFinite(p) ? round6(p / 100) : String(v).trim(); }
var q = toNumberLoose(v); return Number.isFinite(q) ? round6(q) : String(v).trim();
}
case 'flag': {
if (typeof v === 'boolean') return v;
var f = String(v).trim().toLowerCase();
if (['true', '1', 'y', 'yes', '예', 'o'].indexOf(f) >= 0) return true;
if (['false', '0', 'n', 'no', '아니오', 'x'].indexOf(f) >= 0) return false;
return String(v).trim();
}
case 'auto': default: {
if (typeof v === 'number' || typeof v === 'boolean') return typeof v === 'number' ? snapInt(v) : v;
var s = String(v).trim();
if (/^[-+−]?\d{1,3}(,\d{3})+(\.\d+)?$|^[-+−]?\d+(\.\d+)?$/.test(s)) { var a = toNumberLoose(s); if (Number.isFinite(a)) return snapInt(a); }
return s;
}
}
}
function unwrap(obj) {
obj = obj || {};
var info = { format: 'tables', workbook: '', modified: '', exportedAt: '', tablesSha256: '', rowCounts: null, exporterValidation: null, synthetic: false };
var tables = {};
if (obj.tables && typeof obj.tables === 'object' && !Array.isArray(obj.tables)) {
tables = obj.tables; info.format = 'export';
info.workbook = obj.source_file || ''; info.modified = obj.source_modified || ''; info.exportedAt = obj.exported_at || '';
info.tablesSha256 = obj.tables_sha256 || ''; info.rowCounts = obj.row_counts || null; info.exporterValidation = obj.validation || null;
info.schemaVersion = obj.schema_version == null ? null : String(obj.schema_version);
} else {
Object.keys(obj).forEach(function (k) { if (k.charAt(0) !== '_') tables[k] = obj[k]; });
info.workbook = obj._workbook || ''; info.synthetic = obj._fixture === 'synthetic';
}
return { tables: tables, info: info };
}
function isSnapshot(obj) { return !!(obj && obj.schema === SCHEMA && obj.source && typeof obj.source === 'object' && 'monthly' in obj && 'debts' in obj); }
function fromExport(obj, opts) {
var u = unwrap(obj), i = u.info;
var o = Object.assign({ workbook: i.workbook, modified: i.modified, synthetic: i.synthetic, exportInfo: i }, opts || {});
if (!o.workbook) o.workbook = i.workbook;
return fromRows(u.tables, o);
}
function fromRows(tables, opts) {
opts = opts || {};
tables = tables || {};
var imp = { missingTables: [], missingColumns: [], extraColumns: [], blankRowsDropped: 0, metaDuplicates: [], index: null, masked: { address: 0, name: 0 }, namesSkipped: 0, rowCounts: [], exporter: null };
var suppliers = (Array.isArray(tables.web_debts) ? tables.web_debts : []).filter(function (d) { return d && String(d.kind).trim() === 'supplier'; }).map(function (d) { return d.name; });
var un = usableNames(opts.maskNames, suppliers), names = un.names;
imp.namesSkipped = un.skipped.length;
var snap = {
schema: SCHEMA,
generatedAt: opts.generatedAt || new Date().toISOString(),
source: { mode: opts.mode || 'file', workbook: opts.workbook || '', modified: opts.modified || '', fingerprint: '' }
};
if (opts.synthetic) snap.source.synthetic = true;
var ex = opts.exportInfo;
if (ex && ex.format === 'export') {
if (ex.exportedAt) snap.source.exported = ex.exportedAt;
if (ex.tablesSha256) snap.source.tablesSha256 = String(ex.tablesSha256).slice(0, 16);
imp.exporter = { validation: ex.exporterValidation, schemaVersion: ex.schemaVersion };
if (ex.rowCounts) Object.keys(ex.rowCounts).forEach(function (k) {
var n = Array.isArray(tables[k]) ? tables[k].length : null;
if (n !== ex.rowCounts[k]) imp.rowCounts.push(k + ' ' + n + '≠' + ex.rowCounts[k]);
});
}
TABLES.forEach(function (def) {
var rows = tables[def.name];
if (!Array.isArray(rows)) { if (def.snap) { imp.missingTables.push(def.name); } return; }
var seenCols = {}, missing = {};
var out = [];
rows.forEach(function (raw) {
raw = raw || {};
var keys = Object.keys(raw);
keys.forEach(function (k) { seenCols[k] = true; });
var allBlank = def.cols.every(function (c) { return isBlank(raw[c[0]]); });
if (allBlank) { imp.blankRowsDropped++; return; }
var row = {};
def.cols.forEach(function (c) {
if (!(c[0] in raw)) missing[c[0]] = true;
var x = normalize(raw[c[0]], c[1]);
row[c[0]] = typeof x === 'string' ? maskText(x, names, imp.masked) : x;
});
out.push(row);
});
Object.keys(missing).forEach(function (c) { imp.missingColumns.push(def.name + '.' + c); });
var known = {}; def.cols.forEach(function (c) { known[c[0]] = true; });
Object.keys(seenCols).forEach(function (k) { if (!known[k]) imp.extraColumns.push(def.name + '.' + k); });
if (def.name === 'web_index') { imp.index = out; return; }
if (def.name === 'web_meta') {
var meta = {};
out.forEach(function (r) {
if (r.key == null) return;
if (Object.prototype.hasOwnProperty.call(meta, r.key)) imp.metaDuplicates.push(r.key);
var t = META_TYPES[r.key] || 'auto';
var rawVal = rows.filter(function (x) { return x && String(x.key).trim() === r.key; }).pop();
var mv = normalize(rawVal ? rawVal.value : r.value, t);
meta[r.key] = typeof mv === 'string' ? maskText(mv, names, imp.masked) : mv;
});
snap.meta = meta;
return;
}
snap[def.snap] = out;
});
imp.missingTables.forEach(function (n) { snap[BY_NAME[n].snap] = null; });
if (!snap.meta) snap.meta = null;
var ordered = { schema: snap.schema, generatedAt: snap.generatedAt, source: snap.source };
SNAP_KEYS.forEach(function (k) { ordered[k] = snap[k] === undefined ? null : snap[k]; });
Object.defineProperty(ordered, '__import', { value: imp, enumerable: false });
return ordered;
}
var RE_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
var RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
var RE_DATETIME = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
function validDate(s) {
if (!RE_DATE.test(s)) return false;
var p = s.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
return d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2];
}
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function stripSpace(s) { return String(s).replace(/\s+/g, ''); }
var ADDR_TAIL = '(?![-0-9])(?!\\s?(?:월|일|년|건|개|장|번|차|회|%|원|만|억|명|시|분))';
var NOT_YM = '(?!(?:19|20)\\d{2}-(?:0[1-9]|1[0-2])(?!\\d))';
var ADDRESS_SRC = [
'[가-힣]{1,8}\\d?동\\s?' + NOT_YM + '\\d{1,4}-\\d{1,4}' + ADDR_TAIL,
'[가-힣]{1,8}\\d?동\\s?\\d{1,4}번지',
'[가-힣]{1,10}\\d{0,3}(?:대로|로)\\s?\\d{1,4}번?길\\s?\\d{1,4}(?:-\\d{1,4})?' + ADDR_TAIL,
'[가-힣]{1,10}(?:대로|로|길)\\s' + NOT_YM + '\\d{1,4}-\\d{1,4}' + ADDR_TAIL
];
var ADDRESS_RE = new RegExp('(' + ADDRESS_SRC.join('|') + ')', 'g');
var PRIVACY = [
{ id: 'resident', label: '주민등록번호 같은 숫자', re: /(^|[^0-9A-Za-z])(\d{6}-?[1-4]\d{6})(?![0-9A-Za-z])/g },
{ id: 'phone', label: '휴대폰 번호 같은 숫자', re: /(^|[^0-9A-Za-z])(01\d-?\d{3,4}-?\d{4})(?![0-9A-Za-z])/g },
{ id: 'account', label: '계좌번호 같은 숫자', re: /(^|[^0-9A-Za-z-])(\d{3,6}-\d{2,6}-\d{2,8})(?![0-9A-Za-z-])/g, skip: function (m) { return validDate(m); } },
{ id: 'email', label: '이메일 주소', re: /(^|[^A-Za-z0-9._%+-])([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})/g },
{ id: 'address', label: '주소(번지) 같은 글자', re: new RegExp('(^|[^가-힣0-9])(' + ADDRESS_SRC.join('|') + ')', 'g') }
];
function maskName(name) {
var s = String(name || '');
if (s.length <= 1) return s;
if (s.length === 2) return s.charAt(0) + '○';
return s.charAt(0) + new Array(s.length - 1).join('○') + s.charAt(s.length - 1);
}
function usableNames(names, protectedTexts) {
var keep = [], skipped = [];
(names || []).forEach(function (n) {
n = String(n || '').trim();
if (!n) return;
if (n.length < 3 || (protectedTexts || []).some(function (t) { return String(t || '').indexOf(n) >= 0; })) skipped.push(n); else keep.push(n);
});
return { names: keep.sort(function (a, b) { return b.length - a.length; }), skipped: skipped };
}
function maskText(text, names, counts) {
if (typeof text !== 'string' || !text) return text;
var out = text.replace(ADDRESS_RE, function (m) { if (counts) counts.address++; return m.replace(/\d/g, '○'); });
(names || []).forEach(function (n) {
if (!n || out.indexOf(n) < 0) return;
var parts = out.split(n);
if (counts) counts.name += parts.length - 1;
out = parts.join(maskName(n));
});
return out;
}
function maskHit(s) {
return String(s).slice(0, 2) + String(s).slice(2).replace(/[0-9A-Za-z가-힣]/g, '*');
}
function scanPrivacy(text, extraNames) {
var hits = [];
if (text == null) return hits;
text = String(text);
PRIVACY.forEach(function (p) {
p.re.lastIndex = 0;
var m;
while ((m = p.re.exec(text))) {
var hit = m[2], at = m.index + m[1].length;
if (!(p.skip && p.skip(hit))) hits.push({ rule: p.id, label: p.label, index: at, masked: maskHit(hit) });
if (m[0].length === 0) p.re.lastIndex++;
}
});
(extraNames || []).forEach(function (name) {
if (!name) return;
var i = text.indexOf(name);
while (i >= 0) { hits.push({ rule: 'name', label: '거부목록 이름', index: i, masked: '(이름 ' + name.length + '자)' }); i = text.indexOf(name, i + name.length); }
});
return hits;
}
function keyOf(snapKey, row) {
var def = BY_SNAP[snapKey];
if (!def || !row) return null;
return def.id.map(function (c) { return row[c] == null ? '' : String(row[c]); }).join('/');
}
function validate(snap) {
var errors = [], warnings = [], notes = [];
function err(code, msg, where) { errors.push({ code: code, message: msg, where: where || '' }); }
function warn(code, msg, where) { warnings.push({ code: code, message: msg, where: where || '' }); }
function note(code, msg, where) { notes.push({ code: code, message: msg, where: where || '' }); }
if (!snap || typeof snap !== 'object') { err('shape', 'Snapshot 이 비어 있어요.'); return { ok: false, errors: errors, warnings: warnings, notes: notes }; }
if (snap.schema !== SCHEMA) err('schema', 'schema 가 1이 아니에요 (' + snap.schema + ').');
var imp = snap.__import;
if (imp) {
imp.missingColumns.forEach(function (c) { err('column', '열이 없어요: ' + c, c); });
imp.extraColumns.forEach(function (c) { warn('extra-column', '계약에 없는 열이라 뺐어요: ' + c, c); });
imp.metaDuplicates.forEach(function (k) { warn('meta-dup', 'web_meta 키가 두 번 있어요: ' + k, 'web_meta.' + k); });
if (imp.index) {
var listed = {}; imp.index.forEach(function (r) { listed[r.name] = true; });
TABLES.forEach(function (t) { if (t.snap && !listed[t.name]) warn('index', 'web_index 에 ' + t.name + ' 위치가 없어요.', 'web_index'); });
}
if (imp.exporter && imp.exporter.validation && imp.exporter.validation.ok === false) err('exporter', '엑셀 내보내기 검증이 실패한 파일이에요.', 'validation');
if (imp.exporter && imp.exporter.schemaVersion != null && imp.exporter.schemaVersion !== '1') err('schema', '내보내기 schema_version 이 "1" 이 아니에요.', 'schema_version');
imp.rowCounts.forEach(function (x) { err('row-count', '내보내기 파일의 줄 수가 표와 달라요: ' + x, 'row_counts'); });
if (imp.masked && (imp.masked.address || imp.masked.name)) note('masked', '개인정보로 보이는 글자를 가렸어요: 주소 ' + imp.masked.address + '곳 · 이름 ' + imp.masked.name + '곳.', '');
if (imp.namesSkipped) note('names-skipped', '거부목록 이름 ' + imp.namesSkipped + '개는 2글자이거나 거래처 이름과 겹쳐서 가리지 않았어요.', '');
}
var halfWon = 0;
var meta = snap.meta;
if (!meta || typeof meta !== 'object') err('table', '표가 없어요: web_meta', 'web_meta');
else {
META_REQUIRED.forEach(function (k) { if (meta[k] == null) err('meta', 'web_meta 에 ' + k + ' 가 없어요.', 'meta.' + k); });
Object.keys(META_TYPES).forEach(function (k) {
if (META_REQUIRED.indexOf(k) >= 0 || meta[k] != null) return;
warn('meta', 'web_meta 에 ' + k + ' 가 비어 있어요.', 'meta.' + k);
});
if (meta.schema_version != null && String(meta.schema_version) !== '1') err('schema', 'schema_version 이 "1" 이 아니에요.', 'meta.schema_version');
Object.keys(meta).forEach(function (k) {
var t = META_TYPES[k], v = meta[k];
if (v == null || !t) return;
if (t === 'date' && !validDate(String(v))) err('format', 'web_meta ' + k + ' 날짜 형식이 아니에요 (yyyy-mm-dd).', 'meta.' + k);
if (t === 'datetime' && !RE_DATETIME.test(String(v))) err('format', 'web_meta ' + k + ' 시각 형식이 아니에요.', 'meta.' + k);
if (t === 'int' && !isNum(v)) err('number', 'web_meta ' + k + ' 가 숫자가 아니에요.', 'meta.' + k);
if (typeof v === 'string' && scanPrivacy(v).length) err('privacy', 'web_meta ' + k + ' 에 개인정보 같은 글자가 있어요.', 'meta.' + k);
});
}
SNAP_KEYS.forEach(function (sk) {
if (sk === 'meta') return;
var def = BY_SNAP[sk], rows = snap[sk];
if (!Array.isArray(rows)) { err('table', '표가 없어요: ' + def.name, def.name); return; }
var seen = {}, reportedCol = {};
rows.forEach(function (row, i) {
def.cols.forEach(function (c) {
var name = c[0], type = c[1], v = row[name], where = sk + '[' + (keyOf(sk, row) || i) + '].' + name;
if (!(name in row)) { if (!reportedCol[name]) { err('column', '열이 없어요: ' + def.name + '.' + name, def.name + '.' + name); reportedCol[name] = true; } return; }
if (v == null) return;
if (type === 'won' && HALF_WON_OK[sk] && isNum(v) && Math.round(v) !== v && Math.round(v * 2) === v * 2) halfWon++;
else if ((type === 'won' || type === 'int') && !(isNum(v) && Math.round(v) === v)) err('number', def.name + ' ' + name + ' 가 원 단위 정수가 아니에요.', where);
else if ((type === 'num' || type === 'ratio') && !isNum(v)) err('number', def.name + ' ' + name + ' 가 숫자가 아니에요.', where);
else if (type === 'month' && !RE_MONTH.test(String(v))) err('format', def.name + ' ' + name + ' 월 형식이 아니에요 (yyyy-mm).', where);
else if (type === 'date' && !validDate(String(v))) err('format', def.name + ' ' + name + ' 날짜 형식이 아니에요 (yyyy-mm-dd).', where);
else if (type === 'flag' && typeof v !== 'boolean') err('format', def.name + ' ' + name + ' 가 참/거짓이 아니에요.', where);
if (typeof v === 'string' && scanPrivacy(v).length) err('privacy', def.name + ' ' + name + ' 에 개인정보 같은 글자가 있어요.', where);
var en = ENUMS[sk + '.' + name];
if (en && typeof v === 'string' && en.map(stripSpace).indexOf(stripSpace(v)) < 0) warn('enum', def.name + ' ' + name + ' 값 "' + v + '" 은 계약 목록에 없어요.', where);
});
var k = keyOf(sk, row);
if (seen[k]) err('duplicate', def.name + ' 같은 줄이 두 번 있어요: ' + k, sk + '[' + k + ']');
seen[k] = true;
});
});
if (Array.isArray(snap.monthly)) {
var by = {};
snap.monthly.forEach(function (r) { (by[r.month] = by[r.month] || {})[r.store] = r; });
Object.keys(by).sort().forEach(function (m) {
var g = by[m];
if (!g.all) return;
if (!g['2ho'] || !g.eungam) { err('sum', m + ' 두 가게 합계 줄은 있는데 가게 줄이 빠졌어요.', 'monthly[' + m + ']'); return; }
WON_MONTHLY.forEach(function (c) {
var a = g.all[c], x = g['2ho'][c], y = g.eungam[c];
if (a == null && x == null && y == null) return;
if (!isNum(a) || !isNum(x) || !isNum(y)) {
if (a != null || x != null || y != null) {
if (isNum(a) && (x == null || y == null)) err('sum', m + ' ' + c + ': 두 가게 합은 있는데 가게 값이 비었어요.', 'monthly[' + m + '/all].' + c);
}
return;
}
if (Math.abs(a - (x + y)) > 1) err('sum', m + ' ' + c + ': 두 가게 합 ' + a + ' ≠ 가게별 합 ' + (x + y), 'monthly[' + m + '/all].' + c);
});
});
}
if (Array.isArray(snap.debts)) {
snap.debts.forEach(function (d) {
var st = stripSpace(d.status || '');
if (d.current_balance == null && st !== '확인필요') err('debt', d.debt_id + ' 남은 돈이 비었는데 상태가 확인 필요가 아니에요.', 'debts[' + d.debt_id + ']');
if (isNum(d.current_balance) && d.current_balance < 0 && st !== '확인필요') err('debt', d.debt_id + ' 남은 돈이 0보다 작아요.', 'debts[' + d.debt_id + ']');
});
}
if (halfWon) note('half-won', '가게를 반반 나눈 금액에 0.5원이 ' + halfWon + '칸 있어요. 화면에는 엑셀처럼 1원 단위로 반올림해 보여요(두 가게 합은 정확해요).', 'monthly · itemsYearly');
crossCheck(snap).forEach(function (w) { warnings.push(w); });
if (hasExt(snap)) validateExt(snap, err, warn);
return { ok: errors.length === 0, errors: errors, warnings: warnings, notes: notes };
}
var SUPPLIER_IDS = ['nain', 'taejo', 'hyunjin', 'bethel'];
var EXT_ENUMS = {
'utilBills.hl_autopay': ['Y', 'N', 'mixed'], 'utilBills.autopay': ['Y', 'N', 'mixed'],
'notes.scope': ['pnl', 'debts', 'util', 'overview', 'all'], 'notes.store': ['all', '2ho', 'eungam'], 'notes.kind': ['good', 'bad', 'warn', 'info'],
'taxMonthly.store': ['2ho', 'eungam'], 'taxLiab.store': ['2ho', 'eungam'], 'bankMonthly.store': ['2ho', 'eungam'],
'pnlAdj.store': ['2ho', 'eungam', 'all'], 'foodBasis.basis': ['S', 'B'], 'taxPaid.store': ['2ho', 'eungam'],
'taxPays.store': ['2ho', 'eungam'], 'taxPays.kind': ['국세', '지방세', '세금'],
'supDaily.supplier': SUPPLIER_IDS, 'supOpen.supplier': SUPPLIER_IDS, 'supGaps.supplier': SUPPLIER_IDS, 'itemSummary.supplier': SUPPLIER_IDS, 'itemMonthly.supplier': SUPPLIER_IDS,
'supDaily.src': ['L', 'S', 'D'], 'supDaily.flag': ['G', 'U', 'GU'], 'itemSummary.sure': ['Y', 'D', 'U'], 'itemSummary.unit': ['kg', '개', '번']
};
function validTxPart(c, names) {
var out = [], key = c && c.txo ? 'txo' : 'txm', t = c && c[key];
if (!t || typeof t !== 'object' || !RE_MONTH.test(String(t.m)) || !Array.isArray(t.k) || !Array.isArray(t.r)) return [key + ' 모양이 달라요'];
if (names && names.length) { var hits = scanPrivacy(JSON.stringify(t), names).filter(function (h) { return h.rule === 'name'; }); if (hits.length) out.push('거부목록 이름 ' + hits.length + '개'); }
t.k.forEach(function (k, i) {
if (!Array.isArray(k) || (k.length !== 5 && k.length !== 6) || k.some(function (x) { return typeof x !== 'string'; })) out.push('분류 ' + i + ' 모양');
else k.forEach(function (x) { if (scanPrivacy(x).length) out.push('분류 ' + i + ' 개인정보 같은 숫자'); });
});
t.r.forEach(function (r, i) {
if (!Array.isArray(r) || r.length !== 5 || !(isNum(r[0]) && r[0] >= 1 && r[0] <= 31) || typeof r[1] !== 'string' || !isNum(r[2]) || !(isNum(r[3]) && r[3] >= 0 && r[3] < t.k.length) || ['a', 'b', 'h'].indexOf(r[4]) < 0) out.push('거래 ' + i + ' 모양');
else if (scanPrivacy(r[1]).length) out.push('거래 ' + i + ' 이름에 개인정보 같은 숫자');
});
return out;
}
function validateExt(snap, err, warn) {
var m = snap.extMeta;
if (m != null) {
if (typeof m !== 'object' || Array.isArray(m)) err('ext', 'extMeta 모양이 달라요.', 'extMeta');
else Object.keys(m).forEach(function (k) {
var t = EXT_META_TYPES[k], v = m[k];
if (v == null) return;
if (!t) { warn('ext', 'extMeta 에 모르는 키가 있어요: ' + k, 'extMeta.' + k); return; }
if (t === 'date' && !validDate(String(v))) err('format', 'extMeta ' + k + ' 날짜 형식이 아니에요.', 'extMeta.' + k);
if (t === 'datetime' && !RE_DATETIME.test(String(v))) err('format', 'extMeta ' + k + ' 시각 형식이 아니에요.', 'extMeta.' + k);
if (t === 'int' && !(isNum(v) && Math.round(v) === v)) err('number', 'extMeta ' + k + ' 가 정수가 아니에요.', 'extMeta.' + k);
if (typeof v === 'string' && scanPrivacy(v).length) err('privacy', 'extMeta ' + k + ' 에 개인정보 같은 글자가 있어요.', 'extMeta.' + k);
});
}
var tm = snap.taxMeta;
if (tm != null) {
if (typeof tm !== 'object' || Array.isArray(tm)) err('ext', 'taxMeta 모양이 달라요.', 'taxMeta');
else Object.keys(tm).forEach(function (k) {
var t = TAX_META_TYPES[k], v = tm[k];
if (v == null) return;
if (!t) { warn('ext', 'taxMeta 에 모르는 키가 있어요: ' + k, 'taxMeta.' + k); return; }
if ((t === 'int' || t === 'won') && !(isNum(v) && Math.round(v) === v)) err('number', 'taxMeta ' + k + ' 가 정수가 아니에요.', 'taxMeta.' + k);
if (t === 'date' && !validDate(String(v))) err('format', 'taxMeta ' + k + ' 날짜 형식이 아니에요.', 'taxMeta.' + k);
if (t === 'month' && !RE_MONTH.test(String(v))) err('format', 'taxMeta ' + k + ' 월 형식이 아니에요.', 'taxMeta.' + k);
if (t === 'flag' && typeof v !== 'boolean') err('format', 'taxMeta ' + k + ' 가 참/거짓이 아니에요.', 'taxMeta.' + k);
});
}
[['bankMeta', BANK_META_TYPES], ['adjMeta', ADJ_META_TYPES], ['supMeta', SUP_META_TYPES], ['itemMeta', ITEM_META_TYPES]].forEach(function (mt) {
var key = mt[0], types = mt[1], bmeta = snap[key];
if (bmeta == null) return;
if (typeof bmeta !== 'object' || Array.isArray(bmeta)) { err('ext', key + ' 모양이 달라요.', key); return; }
Object.keys(bmeta).forEach(function (k) {
var t = types[k], v = bmeta[k];
if (v == null) return;
if (!t) { warn('ext', key + ' 에 모르는 키가 있어요: ' + k, key + '.' + k); return; }
if (t === 'int' && !(isNum(v) && Math.round(v) === v)) err('number', key + ' ' + k + ' 가 정수가 아니에요.', key + '.' + k);
if (t === 'month' && !RE_MONTH.test(String(v))) err('format', key + ' ' + k + ' 월 형식이 아니에요.', key + '.' + k);
if (t === 'date' && !validDate(String(v))) err('format', key + ' ' + k + ' 날짜 형식이 아니에요.', key + '.' + k);
if (t === 'flag' && typeof v !== 'boolean') err('format', key + ' ' + k + ' 가 참/거짓이 아니에요.', key + '.' + k);
});
});
['utilBills', 'notes', 'taxMonthly', 'taxLiab', 'bankMonthly', 'pnlAdj', 'foodBasis', 'taxPaid', 'taxPays', 'supDaily', 'supOpen', 'supGaps', 'itemSummary', 'itemMonthly', 'reviewText'].forEach(function (sk) {
var def = BY_SNAP[sk], rows = snap[sk];
if (rows == null) return;
if (!Array.isArray(rows)) { err('ext', sk + ' 가 표(배열)가 아니에요.', sk); return; }
var seen = {};
rows.forEach(function (row, i) {
def.cols.forEach(function (c) {
var name = c[0], type = c[1], v = row ? row[name] : undefined, where = sk + '[' + (keyOf(sk, row) || i) + '].' + name;
if (v == null || v === '') return;
if ((type === 'won' || type === 'int') && !(isNum(v) && Math.round(v) === v)) err('number', def.name + ' ' + name + ' 가 원 단위 정수가 아니에요.', where);
else if (type === 'half' && !(isNum(v) && Math.round(v * 2) === v * 2)) err('number', def.name + ' ' + name + ' 가 0.5원 단위가 아니에요.', where);
else if (type === 'month' && !RE_MONTH.test(String(v))) err('format', def.name + ' ' + name + ' 월 형식이 아니에요 (yyyy-mm).', where);
else if (type === 'date' && !validDate(String(v))) err('format', def.name + ' ' + name + ' 날짜 형식이 아니에요 (yyyy-mm-dd).', where);
if (typeof v === 'string' && scanPrivacy(v).length) err('privacy', def.name + ' ' + name + ' 에 개인정보 같은 글자가 있어요.', where);
var en = EXT_ENUMS[sk + '.' + name];
if (en && typeof v === 'string' && en.indexOf(v) < 0) err('enum', def.name + ' ' + name + ' 값 "' + v + '" 은 쓸 수 없어요.', where);
});
if (sk === 'notes' && row && row.period && !/^\d{4}(-(0[1-9]|1[0-2]))?$/.test(String(row.period))) err('format', 'ext_notes period 는 yyyy 또는 yyyy-mm 이에요.', 'notes[' + row.id + '].period');
if (sk === 'notes' && row && !(typeof row.text === 'string' && row.text.trim())) err('ext', 'ext_notes 글이 비었어요.', 'notes[' + i + ']');
var k = keyOf(sk, row);
if (seen[k]) err('duplicate', def.name + ' 같은 줄이 두 번 있어요: ' + k, sk + '[' + k + ']');
seen[k] = true;
});
});
}
function sum(arr) { var s = 0, any = false; arr.forEach(function (v) { if (isNum(v)) { s += v; any = true; } }); return any ? s : null; }
function debtMonthOf(snap) {
var DM = Array.isArray(snap && snap.debtMonthly) ? snap.debtMonthly : [];
var D = Array.isArray(snap && snap.debts) ? snap.debts : [];
var leaf = D.filter(function (d) { return DEBT_LEAF.indexOf(d.debt_id) >= 0 && isNum(d.current_balance); });
var best = null, bestScore = 0;
DM.forEach(function (r) {
if (!isNum(r.all_total)) return;
var score = leaf.filter(function (d) { return isNum(r[d.debt_id]) && r[d.debt_id] === d.current_balance; }).length;
if (score > bestScore || (score > 0 && score === bestScore && String(r.month) > String(best))) { best = r.month; bestScore = score; }
});
if (best) return best;
return snap && snap.meta && snap.meta.data_as_of ? String(snap.meta.data_as_of).slice(0, 7) : null;
}
function debtAsOfDate(snap) {
var m = debtMonthOf(snap), DM = Array.isArray(snap && snap.debtMonthly) ? snap.debtMonthly : [];
var row = DM.filter(function (r) { return r.month === m; })[0], count = {};
(Array.isArray(snap && snap.debts) ? snap.debts : []).forEach(function (d) {
if (!d.current_date || DEBT_LEAF.indexOf(d.debt_id) < 0 || !isNum(d.current_balance)) return;
if (row && isNum(row[d.debt_id]) && row[d.debt_id] !== d.current_balance) return;
count[d.current_date] = (count[d.current_date] || 0) + 1;
});
var best = null;
Object.keys(count).forEach(function (k) { if (!best || count[k] > count[best] || (count[k] === count[best] && k > best)) best = k; });
return best || (snap && snap.meta ? snap.meta.data_as_of || null : null);
}
function isHometax(t) { return /^홈택스/.test(String(t && t.basis || '')); }
function crossCheck(snap) {
var out = [];
function w(code, msg, where) { out.push({ code: code, message: msg, where: where || '' }); }
var M = Array.isArray(snap.monthly) ? snap.monthly : [];
M.forEach(function (r) {
if (!r.has_data) return;
var at = 'monthly[' + r.month + '/' + r.store + ']';
var rev = sum([r.rev_card, r.rev_delivery, r.rev_easypay]);
if (isNum(r.revenue) && rev !== null && r.revenue !== rev) w('pnl', r.month + ' ' + r.store + ' 매출 ≠ 카드+배달앱+간편결제', at + '.revenue');
if (isNum(r.income_total) && r.income_total !== (r.revenue || 0) + (r.other_income || 0)) w('pnl', r.month + ' ' + r.store + ' 수입 합계 ≠ 매출+기타 수입', at + '.income_total');
var cost = sum([r.food, r.labor, r.rent_fixed, r.utilities, r.delivery_fees, r.taxes, r.opex, r.review]);
if (isNum(r.op_cost) && cost !== null && r.op_cost !== cost) w('pnl', r.month + ' ' + r.store + ' 영업비용 ≠ 비용 항목 합', at + '.op_cost');
if (isNum(r.op_profit) && isNum(r.income_total) && isNum(r.op_cost) && r.op_profit !== r.income_total - r.op_cost) w('pnl', r.month + ' ' + r.store + ' 영업이익 ≠ 수입 합계 − 영업비용', at + '.op_profit');
if (isNum(r.op_margin) && isNum(r.op_profit) && isNum(r.revenue) && r.revenue !== 0 && Math.abs(r.op_margin - r.op_profit / r.revenue) > 0.0006) w('pnl', r.month + ' ' + r.store + ' 이익률 ≠ 영업이익 ÷ 매출', at + '.op_margin');
if (r.accrual_complete && isNum(r.op_profit_accrual) && isNum(r.food_accrual) && isNum(r.op_profit) && isNum(r.food)
&& r.op_profit_accrual !== r.op_profit + r.food - r.food_accrual) w('pnl', r.month + ' ' + r.store + ' 명세표 기준 영업이익 계산이 안 맞아요', at + '.op_profit_accrual');
});
var DM = Array.isArray(snap.debtMonthly) ? snap.debtMonthly : [];
DM.forEach(function (r) {
var at = 'debtMonthly[' + r.month + ']';
var ap = sum([r.nain, r.taejo, r.hyunjin, r.bethel, r.other_ap]);
if (isNum(r.ap_total) && ap !== null && r.ap_total !== ap) w('debt', r.month + ' 외상 합계가 거래처 합과 달라요', at + '.ap_total');
var tx = sum([r.tax_2ho, r.tax_eungam]);
if (isNum(r.tax_total) && tx !== null && r.tax_total !== tx) w('debt', r.month + ' 세금 합계가 가게 합과 달라요', at + '.tax_total');
var ln = sum([r.loan_corp, r.loan_other]);
if (isNum(r.loan_total) && ln !== null && r.loan_total !== ln) w('debt', r.month + ' 대출 합계가 맞지 않아요', at + '.loan_total');
var all = sum([r.ap_total, r.tax_total, r.loan_total, r.utility_unpaid]);
if (isNum(r.all_total) && all !== null && r.all_total !== all) w('debt', r.month + ' 갚을 돈 합계가 맞지 않아요', at + '.all_total');
});
var asOf = debtMonthOf(snap);
var dmNow = DM.filter(function (r) { return r.month === asOf; })[0];
var D = Array.isArray(snap.debts) ? snap.debts : [];
var topSum = 0, anyTop = false;
D.forEach(function (d) {
var at = 'debts[' + d.debt_id + ']';
if (isNum(d.start_balance) && isNum(d.current_balance) && isNum(d.reduced) && d.reduced !== d.start_balance - d.current_balance) w('debt', d.name + ' 줄어든 돈 = 시작 − 지금 이 안 맞아요', at + '.reduced');
if (isNum(d.progress_pct) && isNum(d.reduced) && isNum(d.start_balance) && d.start_balance !== 0 && Math.abs(d.progress_pct - d.reduced / d.start_balance) > 0.0006) w('debt', d.name + ' 진행률이 안 맞아요', at + '.progress_pct');
if (String(d.debt_id).indexOf('.') < 0) {
if (isNum(d.current_balance)) { topSum += d.current_balance; anyTop = true; }
if (dmNow && DEBT_COLUMNS.indexOf(d.debt_id) >= 0 && isNum(d.current_balance) && isNum(dmNow[d.debt_id]) && dmNow[d.debt_id] !== d.current_balance)
w('debt', d.name + ' 남은 돈이 월별 부채표(' + asOf + ')와 달라요', at + '.current_balance');
} else {
var parent = D.filter(function (p) { return p.debt_id === String(d.debt_id).split('.')[0]; })[0];
if (!parent) w('debt', d.debt_id + ' 의 위 항목이 없어요', at);
}
});
D.filter(function (d) { return String(d.debt_id).indexOf('.') < 0; }).forEach(function (p) {
var kids = D.filter(function (k) { return String(k.debt_id).indexOf(p.debt_id + '.') === 0; });
if (!kids.length) return;
var s = sum(kids.map(function (k) { return k.current_balance; }));
if (isNum(p.current_balance) && s !== null && s !== p.current_balance) w('debt', p.name + ' 가게별 줄 합이 전체와 달라요', 'debts[' + p.debt_id + '].current_balance');
});
if (dmNow && anyTop && isNum(dmNow.all_total) && topSum !== dmNow.all_total) w('debt', '부채 항목 합(' + topSum + ')이 월별 부채표 합계(' + dmNow.all_total + ')와 달라요', 'debtMonthly[' + asOf + '].all_total');
var TX = Array.isArray(snap.tax) ? snap.tax : [];
var taxBy = {};
var anyHometax = TX.some(isHometax);
TX.forEach(function (t) {
if (isNum(t.amount_due) && isNum(t.remaining) && t.remaining !== t.amount_due - (t.paid || 0)) w('tax', t.tax_id + ' 남은 세금 = 고지 − 낸 돈 이 안 맞아요', 'tax[' + t.tax_id + '].remaining');
if (isNum(t.remaining) && (!anyHometax || isHometax(t))) taxBy[t.store] = (taxBy[t.store] || 0) + t.remaining;
});
['2ho', 'eungam'].forEach(function (s) {
var d = D.filter(function (x) { return x.debt_id === 'tax_' + s; })[0];
if (d && isNum(d.current_balance) && taxBy[s] != null && taxBy[s] !== d.current_balance) w('tax', s + ' 세금 고지 남은 돈 합이 부채표 세금과 달라요', 'debts[tax_' + s + '].current_balance');
});
if (snap.meta && Array.isArray(snap.review) && isNum(snap.meta.review_count)) {
var rc = sum(snap.review.map(function (r) { return r.count; })) || 0;
if (rc !== snap.meta.review_count) w('review', '확인할 것 개수(' + rc + ')가 web_meta review_count(' + snap.meta.review_count + ')와 달라요', 'meta.review_count');
}
if (snap.meta && Array.isArray(snap.checks) && isNum(snap.meta.checks_failed)) {
var fc = snap.checks.filter(function (c) { return c.status === 'fail'; }).length;
if (fc !== snap.meta.checks_failed) w('checks', '실패한 점검 개수가 web_meta 와 달라요', 'meta.checks_failed');
}
var IY = Array.isArray(snap.itemsYearly) ? snap.itemsYearly : [];
var agg = {};
IY.forEach(function (r) {
var col = columnOfItem(r.major, r.item);
if (!col || !isNum(r.amount)) return;
var k = r.year + '/' + r.store + '/' + col;
agg[k] = (agg[k] || 0) + r.amount;
});
Object.keys(agg).forEach(function (k) {
var p = k.split('/'), y = p[0], s = p[1], col = p[2];
var tot = sum(M.filter(function (r) { return r.has_data && r.store === s && String(r.month).slice(0, 4) === y; }).map(function (r) { return r[col]; }));
if (tot !== null && tot !== agg[k]) w('items', y + ' ' + s + ' ' + col + ' 항목 합이 월별 합과 달라요', 'itemsYearly[' + y + '/' + s + ']');
});
(Array.isArray(snap.years) ? snap.years : []).forEach(function (y) {
var n = M.filter(function (r) { return r.store === 'all' && r.has_data && String(r.month).slice(0, 4) === String(y.year); }).length;
if (isNum(y.months_with_data) && M.length && n !== y.months_with_data) w('years', y.year + '년 자료 있는 달 수가 월별 표와 달라요', 'years[' + y.year + ']');
});
return out;
}
function canonical(v) {
if (v === undefined) return 'null';
if (v === null || typeof v !== 'object') return JSON.stringify(v);
if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
var keys = Object.keys(v).filter(function (k) { return v[k] !== undefined; }).sort();
return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + canonical(v[k]); }).join(',') + '}';
}
function fingerprintBody(snap) {
var body = {};
Object.keys(snap).forEach(function (k) { if (k !== 'generatedAt' && k !== 'source' && k.charAt(0) !== '_' && EXT_KEYS.indexOf(k) < 0 && LAZY_KEYS.indexOf(k) < 0) body[k] = snap[k]; });
return canonical(body);
}
function extBody(snap, keys) { var body = {}; (keys || EXT_KEYS).forEach(function (k) { body[k] = snap && snap[k] != null ? snap[k] : null; }); return canonical(body); }
function extFingerprint(snap, keys, impl) {
if (typeof keys === 'string') { impl = keys; keys = null; }
return sha256Hex(extBody(snap, keys), impl).then(function (hex) { return hex.slice(0, 8).toUpperCase(); });
}
function utf8(text) {
if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
var s = unescape(encodeURIComponent(text)), out = new Uint8Array(s.length);
for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
return out;
}
var K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
function sha256Js(bytes) {
var l = bytes.length, total = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(total);
m.set(bytes); m[l] = 0x80;
var dv = new DataView(m.buffer), bits = l * 8;
dv.setUint32(total - 4, bits >>> 0); dv.setUint32(total - 8, Math.floor(bits / 4294967296));
var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], w = new Array(64);
for (var i = 0; i < total; i += 64) {
for (var t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
for (t = 16; t < 64; t++) {
var x = w[t - 15], y = w[t - 2];
var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
}
var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
for (t = 0; t < 64; t++) {
var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
var t1 = (h + S1 + ((e & f) ^ (~e & g)) + K256[t] + w[t]) | 0;
var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
var t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
}
H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
}
return H.map(function (v) { return (v >>> 0).toString(16).padStart(8, '0'); }).join('');
}
function bufHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(''); }
function nodeCrypto() {
try {
if (typeof process !== 'undefined' && process.versions && process.versions.node && typeof require === 'function') return require('node:crypto');
} catch (e) { }
return null;
}
function sha256Hex(text, impl) {
impl = impl || 'auto';
if (impl === 'auto' || impl === 'node') {
var nc = nodeCrypto();
if (nc) return Promise.resolve(nc.createHash('sha256').update(text, 'utf8').digest('hex'));
if (impl === 'node') return Promise.reject(new Error('node:crypto 가 없어요'));
}
var subtle = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) || null;
if ((impl === 'auto' || impl === 'webcrypto') && subtle) return subtle.digest('SHA-256', utf8(text)).then(bufHex);
if (impl === 'webcrypto') return Promise.reject(new Error('Web Crypto 를 쓸 수 없어요'));
return Promise.resolve(sha256Js(utf8(text)));
}
function fingerprint(snap, impl) {
return sha256Hex(fingerprintBody(snap), impl).then(function (hex) { return hex.slice(0, 8).toUpperCase(); });
}
function colName(i) { var s = ''; i++; while (i > 0) { var r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; }
function colIndex(name) { var n = 0; for (var i = 0; i < name.length; i++) n = n * 26 + (name.charCodeAt(i) - 64); return n - 1; }
function parseRange(a1) {
var s = String(a1 || '').trim().replace(/^.*!/, '');
var m = /^\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)$/.exec(s.toUpperCase());
if (!m) return null;
return { c0: colIndex(m[1]), r0: Number(m[2]) - 1, c1: colIndex(m[3]), r1: Number(m[4]) - 1 };
}
var INDEX_DESC = {
web_index: '표 위치', web_meta: '고정 키', web_years: '연도', web_monthly: '월 × 가게 손익', web_items_yearly: '연도 × 가게 × 항목',
web_debts: '부채 항목', web_debt_monthly: '월별 부채', web_supplier_recent: '최근 120일 명세표', web_tax: '세금 고지',
web_utilities: '공과금', web_checks: '점검', web_review: '확인할 것 유형', web_review_items: '확인할 것 상위 50건', web_fields: '필드 설명'
};
function tablesToSheet(tables) {
var order = TABLES.map(function (t) { return t.name; });
var layout = [], c = 0;
order.forEach(function (name) {
var def = BY_NAME[name];
var rows = name === 'web_index' ? new Array(order.length) : (tables[name] || []);
layout.push({ name: name, c0: c, ncols: def.cols.length, nrows: rows.length });
c += def.cols.length + 1;
});
var index = layout.map(function (L) {
return { name: L.name, range: colName(L.c0) + '2:' + colName(L.c0 + L.ncols - 1) + (2 + L.nrows), rows: L.nrows, cols: L.ncols, description: INDEX_DESC[L.name] || '' };
});
var height = 2 + Math.max.apply(null, layout.map(function (L) { return L.nrows; })), width = c - 1;
var aoa = [];
for (var r = 0; r < height; r++) { var line = new Array(width); for (var k = 0; k < width; k++) line[k] = ''; aoa.push(line); }
layout.forEach(function (L) {
var def = BY_NAME[L.name], rows = L.name === 'web_index' ? index : (tables[L.name] || []);
aoa[0][L.c0] = L.name;
def.cols.forEach(function (col, j) { aoa[1][L.c0 + j] = col[0]; });
rows.forEach(function (row, i) {
def.cols.forEach(function (col, j) {
var v = row[col[0]];
aoa[2 + i][L.c0 + j] = v == null ? '' : (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v);
});
});
});
return aoa;
}
function tablesFromSheet(aoa) {
var cell = function (r, c) { var row = aoa[r]; if (!row) return ''; var v = row[c]; return v == null ? '' : v; };
if (String(cell(0, 0)).trim() !== 'web_index') throw new Error("웹데이터 시트 A1 이 'web_index' 가 아니에요.");
var head = [];
for (var c = 0; String(cell(1, c)).trim() !== ''; c++) head.push(String(cell(1, c)).trim());
var index = [];
for (var r = 2; String(cell(r, 0)).trim() !== ''; r++) {
var o = {}; head.forEach(function (h, j) { o[h] = cell(r, j); }); index.push(o);
}
var tables = { web_index: index };
index.forEach(function (ent) {
var name = String(ent.name).trim();
if (name === 'web_index' || !BY_NAME[name]) return;
var g = parseRange(ent.range);
if (!g) throw new Error(name + ' 범위를 읽을 수 없어요: ' + ent.range);
var hdr = [];
for (var cc = g.c0; cc <= g.c1; cc++) hdr.push(String(cell(g.r0, cc)).trim());
var rows = [];
for (var rr = g.r0 + 1; rr <= g.r1; rr++) {
var obj = {};
hdr.forEach(function (h, j) { if (h) obj[h] = cell(rr, g.c0 + j); });
rows.push(obj);
}
tables[name] = rows;
});
return tables;
}
function findRow(snap, table, key) {
var rows = snap[table];
if (!Array.isArray(rows)) return undefined;
for (var i = 0; i < rows.length; i++) if (keyOf(table, rows[i]) === key) return rows[i];
return undefined;
}
function get(snap, path) {
var m = /^([A-Za-z]+)(?:\[([^\]]*)\])?(?:\.([A-Za-z0-9_]+))?$/.exec(String(path).trim());
if (!m) return undefined;
var table = m[1], key = m[2], field = m[3];
if (table === 'meta') return snap.meta ? (field ? snap.meta[field] : snap.meta) : undefined;
if (key === undefined) return field ? undefined : snap[table];
var row = findRow(snap, table, key);
if (!row) return undefined;
return field ? row[field] : row;
}
function getAll(snap, path) {
var m = /^([A-Za-z]+)\[([^\]]*)\]\.([A-Za-z0-9_]+)$/.exec(String(path || '').trim());
if (!m || !Array.isArray(snap[m[1]])) return [];
var re = new RegExp('^' + m[2].split('*').map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('.*') + '$');
return snap[m[1]].filter(function (r) { return re.test(keyOf(m[1], r)); }).map(function (r) { return r[m[3]]; });
}
function tokenize(expr) {
var out = [], i = 0, s = String(expr);
while (i < s.length) {
var ch = s.charAt(i);
if (/\s/.test(ch)) { i++; continue; }
if ('+-*/()'.indexOf(ch) >= 0 || ch === '−') { out.push({ op: ch === '−' ? '-' : ch }); i++; continue; }
if (/[0-9.]/.test(ch)) { var j = i; while (j < s.length && /[0-9.]/.test(s.charAt(j))) j++; out.push({ num: Number(s.slice(i, j)) }); i = j; continue; }
if (/[A-Za-z]/.test(ch)) {
var k = i;
while (k < s.length) {
var c2 = s.charAt(k);
if (c2 === '[') { var close = s.indexOf(']', k); if (close < 0) throw new Error('] 가 없어요: ' + expr); k = close + 1; continue; }
if (/[A-Za-z0-9_.]/.test(c2)) { k++; continue; }
break;
}
out.push({ path: s.slice(i, k) }); i = k; continue;
}
throw new Error('읽을 수 없는 글자: ' + ch);
}
return out;
}
function evaluate(snap, expr) {
var tk = tokenize(expr), p = 0;
function peek() { return tk[p]; }
function factor() {
var t = tk[p++];
if (!t) throw new Error('식이 끝났어요: ' + expr);
if (t.op === '-') { var v = factor(); return v == null ? null : -v; }
if (t.op === '(') { var e = sum2(); p++; return e; }
if ('num' in t) return t.num;
if (t.path === 'round' && peek() && peek().op === '(') {
p++; var r0 = sum2(); p++;
return isNum(r0) ? Math.round(r0) : null;
}
if (t.path === 'sum' && peek() && peek().op === '(') {
p++; var inner = tk[p++]; p++;
var nums = getAll(snap, inner && inner.path).filter(isNum);
if (!nums.length) return null;
return nums.reduce(function (s, x) { return s + x; }, 0);
}
if (t.path) { var g = get(snap, t.path); return isNum(g) ? g : (g == null ? null : (typeof g === 'string' ? g : null)); }
throw new Error('식 오류: ' + expr);
}
function term() {
var v = factor();
while (peek() && (peek().op === '*' || peek().op === '/')) {
var op = tk[p++].op, r = factor();
if (v == null || r == null || typeof v !== 'number' || typeof r !== 'number') { v = null; continue; }
v = op === '*' ? v * r : (r === 0 ? null : v / r);
}
return v;
}
function sum2() {
var v = term();
while (peek() && (peek().op === '+' || peek().op === '-')) {
var op = tk[p++].op, r = term();
if (v == null || r == null || typeof v !== 'number' || typeof r !== 'number') { v = null; continue; }
v = op === '+' ? v + r : v - r;
}
return v;
}
var out = sum2();
if (p < tk.length) throw new Error('식 뒤에 남은 글자가 있어요: ' + expr);
return out;
}
return {
SCHEMA: SCHEMA, TABLES: TABLES, SNAP_KEYS: SNAP_KEYS, META_TYPES: META_TYPES, ENUMS: ENUMS, STORES: STORES,
EXT_TABLES: EXT_TABLES, EXT_KEYS: EXT_KEYS, SUP_KEYS: SUP_KEYS, ITEM_KEYS: ITEM_KEYS, SUP_META_TYPES: SUP_META_TYPES, ITEM_META_TYPES: ITEM_META_TYPES, TAX_KEYS: TAX_KEYS, CASH_KEYS: CASH_KEYS, ADJ_KEYS: ADJ_KEYS, OWNER_EXT_KEYS: OWNER_EXT_KEYS, BANK_META_TYPES: BANK_META_TYPES, ADJ_META_TYPES: ADJ_META_TYPES, LAZY_KEYS: LAZY_KEYS, validTxPart: validTxPart, EXT_META_TYPES: EXT_META_TYPES, TAX_META_TYPES: TAX_META_TYPES,
hasExt: hasExt, validateExt: validateExt, extBody: extBody, extFingerprint: extFingerprint,
WON_MONTHLY: WON_MONTHLY, DEBT_COLUMNS: DEBT_COLUMNS, DEBT_LEAF: DEBT_LEAF, MAJOR_TO_COLUMN: MAJOR_TO_COLUMN, ITEM_TO_COLUMN: ITEM_TO_COLUMN, PRIVACY: PRIVACY,
tableBySnap: function (k) { return BY_SNAP[k]; }, tableByName: function (n) { return BY_NAME[n]; },
unwrap: unwrap, isSnapshot: isSnapshot, fromExport: fromExport, maskText: maskText, maskName: maskName, usableNames: usableNames, columnOfItem: columnOfItem,
debtMonthOf: debtMonthOf, debtAsOfDate: debtAsOfDate, isHometax: isHometax,
fromRows: fromRows, validate: validate, crossCheck: crossCheck,
canonical: canonical, fingerprintBody: fingerprintBody, sha256Hex: sha256Hex, sha256Js: sha256Js, fingerprint: fingerprint,
tablesToSheet: tablesToSheet, tablesFromSheet: tablesFromSheet, parseRange: parseRange, colName: colName,
keyOf: keyOf, get: get, getAll: getAll, evaluate: evaluate, scanPrivacy: scanPrivacy, maskHit: maskHit, validDate: validDate,
normalize: normalize
};
});
(function (root, factory) {
var api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root && typeof root === 'object') { root.Ledger = root.Ledger || {}; root.Ledger.viewConfig = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
return {
UTIL_UNPAID_SINCE: '2026-10-06',
UTIL_REF_PLACES: ['개인'],
REVIEW_ITEM_LABELS: { '유흥·심야 카드사용': '개인', '미분류': '미분류' },
PERSONAL_REVIEW_ITEMS: ['유흥·심야 카드사용'],
VIEWS: {
owner: { label: '사장님용', nav: ['pnl', 'debts', 'sup'], home: 'pnl', shared: true, staleNote: false, quietNotes: true, supPlain: true, supHide: ['bethel'], reasons: false, notes: false, multiPeriod: false, details: false, drill: false,
terms: { debts: '부채', debtsTotal: '부채 합계', debtsAll: '부채 전체', payPerMonth: '한 달에 갚을 금액' },
debtTable: { kids: false, source: false, unknownNote: false, hideEmpty: ['loan', 'etc'], payoff: false },
subShare: true, debtChart: { cols: ['nain', 'taejo', 'hyunjin'] }, plain: true, flowPop: false, plainFlow: true, kpis: ['revenue', 'op_profit', 'op_margin'], kpiLabels: { revenue: '입금' }, flowBarsOnly: true,
supChart: true, supSwipe: true, stamp: 'stmt', outside: { supRows: ['nain', 'taejo', 'hyunjin', 'bethel'] },
pnlTable: { revShare: false, slimLabel: true, labels: { rent_fixed: '고정비', delivery_fees: '배달', op_cost: '비용 합계' } } },
admin: { label: '관리용', nav: ['overview', 'debts', 'sup', 'price', 'pnl', 'util', 'review', 'data'], home: 'overview', reasons: true, notes: true, multiPeriod: true, details: true, drill: true, bankToggle: true,
terms: {}, debtTable: { kids: true, source: true, unknownNote: true, hideEmpty: [] }, debtChart: { cols: ['nain', 'taejo', 'hyunjin'] }, inbox: true, taxPays: true,
reviewTodo: true,
outside: { supRows: ['nain', 'taejo', 'hyunjin', 'bethel'] } }
},
DEBT_EXCLUDE: [{ id: 'bethel', why: '작은 외상' }],
DEBT_MARKS: { months: ['2023-02'], bands: true },
FLOW_DEBT_COLS: ['nain', 'taejo', 'hyunjin'],
DETAIL_LINES: ['food', 'revenue', 'other_income', 'labor', 'rent_fixed', 'utilities', 'delivery_fees', 'taxes', 'opex', 'finance_out', 'owner_transfer', 'family_transfer', 'internal_net'],
DETAIL_TOP: { vendors: 12, deals: 8 },
PLACE_CODES: { '@2ho': '2ho', '@eungam': 'eungam', '사무실': 'office', '개인': 'personal', '8호': '8ho', '10호': '10ho' },
PLACE_ORDER: ['@2ho', '@eungam', '사무실', '개인', '8호', '10호'],
NOTE_SCOPES: ['pnl', 'debts', 'util', 'overview', 'all'],
NOTE_KINDS: ['good', 'bad', 'warn', 'info'],
NOTE_MAX_CHARS: 300
};
});
(function (root, factory) {
var api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root && typeof root === 'object') { root.Ledger = root.Ledger || {}; root.Ledger.fmt = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
var MINUS = '−', DASH = '—';
var nf = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function sign(v, always) { return v < 0 ? MINUS : (always && v > 0 ? '+' : ''); }
function int(v) { return nf.format(Math.round(Math.abs(v))); }
function digits(v, opts) {
if (!isNum(v)) return DASH;
return sign(v, opts && opts.sign) + int(v);
}
function won(v, opts) {
if (!isNum(v)) return DASH;
if (v === 0) return '0원';
return digits(v, opts) + '원';
}
function manParts(v) {
var a = Math.abs(v), m = Math.round(a / 10000);
return { eok: Math.floor(m / 10000), man: m % 10000, rounded: m * 10000 };
}
function man(v, opts) {
opts = opts || {};
if (!isNum(v)) return DASH;
if (v === 0) return '0원';
if (Math.abs(v) < 10000) return won(v, opts);
var p = manParts(v), s = sign(v, opts.sign), unit = opts.unit === false ? '' : '원';
if (p.eok && p.man) return s + nf.format(p.eok) + '억 ' + nf.format(p.man) + '만' + unit;
if (p.eok) return s + nf.format(p.eok) + '억' + unit;
return s + nf.format(p.man) + '만' + unit;
}
function tick(v) {
if (!isNum(v)) return '';
if (v === 0) return '0';
if (Math.abs(v) < 10000) return sign(v) + int(v);
return man(v, { unit: false });
}
function ko(v) {
if (!isNum(v)) return '없음';
if (v === 0) return '0원';
var a = Math.round(Math.abs(v)), eok = Math.floor(a / 1e8), man10 = Math.floor((a % 1e8) / 1e4), rest = a % 1e4, out = [];
if (eok) out.push(nf.format(eok) + '억');
if (man10) out.push(nf.format(man10) + '만');
if (rest) out.push(nf.format(rest));
return (v < 0 ? '마이너스 ' : '') + out.join(' ') + '원';
}
function exactNote(v) {
if (!isNum(v) || Math.abs(v) < 10000) return '';
var p = manParts(v);
return p.rounded === Math.abs(v) ? '' : '정확히 ' + ko(v);
}
function pct(r, d, opts) {
if (!isNum(r)) return DASH;
d = d == null ? 1 : d;
var x = Math.abs(r * 100), f = x.toFixed(d);
if (Number(f) === 0) return (0).toFixed(d) + '%';
return sign(r, opts && opts.sign) + f + '%';
}
function share(r) {
if (!isNum(r)) return DASH;
if (r === 0) return '0%';
var x = Math.abs(r * 100);
return (r < 0 ? MINUS : '') + (x < 1 ? '1% 미만' : Math.round(x) + '%');
}
function short(v) {
if (!isNum(v)) return DASH;
if (v === 0) return '0';
var a = Math.abs(v), s = v < 0 ? MINUS : '';
if (a < 10000) return s + int(a);
var m = Math.round(a / 10000);
if (m >= 10000) { var e = Math.round(a / 1e7) / 10; return s + (e % 1 === 0 ? nf.format(e) : e.toFixed(1)) + '억'; }
return s + nf.format(m) + '만';
}
function pct0(r) {
if (!isNum(r)) return DASH;
var x = Math.round(Math.abs(r) * 100);
return (x && r < 0 ? MINUS : '') + x + '%';
}
function pp(r, d) {
if (!isNum(r)) return DASH;
var f = Math.abs(r * 100).toFixed(d == null ? 1 : d);
if (Number(f) === 0) return '0.0%p';
return sign(r, true) + f + '%p';
}
function count(n, unit) { return isNum(n) ? nf.format(n) + (unit == null ? '건' : unit) : DASH; }
function parts(s) { var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(s || '')); return m ? { y: +m[1], m: +m[2], d: m[3] ? +m[3] : null } : null; }
function date(s, opts) {
var p = parts(s); if (!p || p.d == null) return DASH;
var withYear = opts && (opts.year === true || (opts.year !== false && opts.refYear && opts.refYear !== p.y));
return (withYear ? p.y + '년 ' : '') + p.m + '월 ' + p.d + '일';
}
function month(s, opts) {
var p = parts(s); if (!p) return DASH;
var withYear = !opts || opts.year !== false && (opts.year === true || !opts.refYear || opts.refYear !== p.y);
return (withYear ? p.y + '년 ' : '') + p.m + '월';
}
function monthShort(s) { var p = parts(s); return p ? p.m + '월' : DASH; }
function dateShort(s) { var p = parts(s); return p && p.d ? p.m + '/' + p.d : DASH; }
function time(s) { var m = /(\d{2}):(\d{2})/.exec(String(s || '')); return m ? m[1] + ':' + m[2] : ''; }
function days(n) {
if (!isNum(n)) return DASH;
if (n === 0) return '오늘까지';
return n > 0 ? n + '일 남음' : -n + '일 지남';
}
function prettyDates(text, refYear) { return String(text == null ? '' : text).replace(/\b\d{4}-\d{2}-\d{2}\b/g, function (m) { return date(m, { refYear: refYear }); }); }
function fingerprint(hex) { return hex ? String(hex).slice(0, 4) + '·' + String(hex).slice(4, 8) : DASH; }
function money(v, units, opts) { return units === 'won' ? won(v, opts) : man(v, opts); }
function parse(text, unit) {
var s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
if (!s || s === DASH || s === '-' || s === '–') return null;
var neg = /^[−-]/.test(s); s = s.replace(/^[+−-]/, '');
if (unit === 'pct') { var p = parseFloat(s.replace(/[^0-9.]/g, '')); return Number.isFinite(p) ? (neg ? -p : p) / 100 : null; }
if (unit === 'pp') { var q = parseFloat(s.replace(/[^0-9.]/g, '')); return Number.isFinite(q) ? (neg ? -q : q) / 100 : null; }
if (unit === 'month') { var mm = /(\d{4})년\s*(\d{1,2})월/.exec(s); return mm ? mm[1] + '-' + (mm[2].length < 2 ? '0' : '') + mm[2] : null; }
if (unit === 'days') { if (/오늘/.test(s)) return 0; var dd = /(\d+)일\s*(남음|지남)/.exec(s); return dd ? (dd[2] === '지남' ? -1 : 1) * +dd[1] : null; }
var total = 0, found = false, mE = /([\d,]+)억/.exec(s), mM = /([\d,]+)만/.exec(s);
if (mE) { total += +mE[1].replace(/,/g, '') * 1e8; found = true; }
if (mM) { total += +mM[1].replace(/,/g, '') * 1e4; found = true; }
var rest = s.replace(/[\d,]+억/, '').replace(/[\d,]+만/, '');
var mR = /([\d,]+)/.exec(rest);
if (mR && (!found || /\d/.test(rest))) { total += +mR[1].replace(/,/g, ''); found = true; }
if (!found) return null;
return neg ? -total : total;
}
return {
MINUS: MINUS, DASH: DASH, isNum: isNum, digits: digits, won: won, man: man, tick: tick, ko: ko, exactNote: exactNote,
pct: pct, share: share, short: short, pct0: pct0, pp: pp, count: count, date: date, month: month, monthShort: monthShort, dateShort: dateShort, time: time,
days: days, prettyDates: prettyDates, fingerprint: fingerprint, money: money, parse: parse, parts: parts
};
});
(function (root) {
var L = root.Ledger = root.Ledger || {};
L.copy = {
appFallback: '가게 장부',
skip: '본문으로 건너뛰기',
nav: [
{ id: 'overview', path: '/', label: '한눈에' },
{ id: 'debts', path: '/debts', label: '부채' },
{ id: 'pnl', path: '/pnl', label: '손익' },
{ id: 'review', path: '/review', label: '확인할 것', tab: '확인' },
{ id: 'data', path: '/data', label: '자료' },
{ id: 'util', path: '/util', label: '공과금' },
{ id: 'sup', path: '/sup', label: '외상', title: '거래처 외상' },
{ id: 'price', path: '/price', label: '단가', title: '품목 단가' }
],
viewBadge: { owner: '', admin: '관리용' },
terms: { debts: '부채', debtsTotal: '부채 합계', debtsAll: '부채 전체', payPerMonth: '한 달에 갚을 금액' },
reasons: { pnlGood: '왜 이익이 났나', pnlBad: '왜 비용이 더 많았나', debtsUp: '왜 늘었나', debtsDown: '왜 줄었나', debtsFlat: '흐름', notes: '살펴본 점', none: '이 기간에는 설명할 자료가 모자라요.' },
opexNote: '운영비에는 확인 필요(개인 · 미분류)를 넣어 보여 줘요. 영업비용 합계와 영업이익은 그대로예요.',
util: {
sub: '청구된 달 기준',
noBills: '고지서 자료가 아직 없어요. 고지서 사진을 올리면 다음 갱신 때 여기에 보여요.'
},
storeFallback: { all: '두 가게', '2ho': '가게 1', eungam: '가게 2' },
basisCash: '통장 기준(낸 돈)',
basisAccrual: '명세표 기준(산 것)',
pnlBasisNote: '손익은 통장에 찍힌 돈 기준이에요.',
halfWonNote: '가게별 금액은 반반 나눈 거래의 0.5원을 반올림해서 두 가게 합과 1원 다를 수 있어요(엑셀도 같아요).',
columns: {
revenue: '매출', rev_card: '카드 매출', rev_delivery: '배달앱 매출', rev_easypay: '간편결제 매출', other_income: '기타 수입',
income_total: '수입 합계', food: '식재료', labor: '인건비', rent_fixed: '임대·고정비', utilities: '공과금',
delivery_fees: '배달 수수료', taxes: '세금', opex: '기타 운영비', review: '확인 중', op_cost: '영업비용',
op_profit: '영업이익', op_margin: '이익률', finance_out: '대출·금융', owner_transfer: '대표자 이체',
family_transfer: '가족 이체', internal_net: '가게 간 이동', food_accrual: '식재료(명세표 기준)',
op_profit_accrual: '영업이익(명세표 기준)', food_ratio: '식재료 원가율', labor_ratio: '인건비율'
},
flowLines: {
taxes: { name: '세금(평소 부가세)', sub: '그때그때 내는 부가세·지방세 등 — 손익(영업비용)에서는 뺐어요', bar: ['세금'] },
tax_arrears: { name: '밀린 세금 정리', sub: '평소보다 더 낸 세금(밀린 부가세 등을 한꺼번에) — 남은 세금이 그만큼 줄었어요', bar: ['밀린', '세금'] },
loan: { name: '대출금', sub: '대출 원금·이자 등', bar: ['대출금'] },
loan_personal: { name: '대출금 (개인)', sub: '대표자 명의로 갚은 대출', bar: ['대출금', '(개인)'] },
personal_tax: { name: '개인 세금', sub: '대표자 이름으로 낸 개인 세금(국고·금고·대표자 계좌로) — 가게 비용 아니에요', bar: ['개인', '세금'] },
kiwoom: { name: '증권', sub: '증권 계좌로 보낸 돈', bar: ['증권'] },
owner_transfer: { name: '대표자 인출', sub: '손익 밖 지출(식대·차량·생활 등)과 대표자 개인 계좌(증권 빼고)', bar: ['대표자'] },
family_transfer: { name: '가족 이체', sub: '가족 명의 계좌로 보내거나 받은 돈(증권 빼고)', bar: ['가족'] },
personal_out: { name: '그 외 인출', sub: '', bar: ['그 외', '인출'] },
supplier: { name: '거래처 외상 갚음', sub: '이 달 명세표로 산 것보다 더 보낸 돈 — 지난 외상을 갚았어요', bar: ['외상', '갚음'] },
supplier_less: { name: '거래처 외상 남음', sub: '이 달 명세표로 산 것 중 아직 안 보낸 돈 — 그만큼 통장에 남아 있어요', bar: ['외상', '남음'] },
other_out: { name: '기타', sub: '가게 사이 이체 · 분류 안 된 돈 등', bar: ['기타'] }
},
kpis: [
{ id: 'revenue', label: '매출', kind: 'money', good: 'up' },
{ id: 'op_cost', label: '영업비용', kind: 'money', good: 'down' },
{ id: 'op_profit', label: '영업이익', kind: 'money', good: 'up' },
{ id: 'op_margin', label: '이익률', kind: 'ratio', good: 'up' },
{ id: 'food_ratio', label: '식재료 원가율', kind: 'ratio', good: 'down' },
{ id: 'labor_ratio', label: '인건비율', kind: 'ratio', good: 'down' }
],
reviewTypes: ['분류', '가게 나누기', '글씨', '계산 안 맞음', '빈칸', '빠진 자료', '재촬영'],
debtStatus: { '줄어드는 중': '줄어드는 중', '늘어나는 중': '늘어나는 중', '줄지 않는 중': '줄지 않는 중', '확인 필요': '확인 필요' },
taxStatus: { '미납': '기한 지남', '기한전': '기한 전', '일부': '일부 냄', '납부완료': '다 냄', '확인필요': '확인 필요' },
checkStatus: { ok: '맞아요', warn: '확인 필요', fail: '안 맞아요' },
groups: { tax: '세금', etc: '기타', loan: '대출' },
states: {
loading: '자료를 불러오고 있어요',
outside: { title: 'Claude에서 열어 주세요', body: '이 화면은 Claude 앱이나 claude.ai에서 열어야 자료가 보여요.' },
notOwner: { title: '사장님 계정에서만 보여요', body: '이 장부는 만든 사람 계정으로 열었을 때만 자료를 보여 드려요.' },
emptyArtifact: { title: '아직 자료가 없어요', body: "Claude에게 '대시보드 갱신'이라고 말해 주세요. 엑셀을 확인한 뒤 자료를 올려 드려요." },
emptyFile: { title: '예시 자료를 찾지 못했어요', body: '개발용 화면이에요. tools/fake-fixture.mjs 를 먼저 실행해 주세요.' },
signedOut: { title: 'Microsoft 계정으로 로그인해 주세요', body: '사장님이 OneDrive에서 공유한 장부를 읽기만 해요. 고치거나 지우지 않아요.', action: '마이크로소프트 계정으로 로그인' },
unavailableGraph: { title: '아직 연결 준비가 안 됐어요', body: '앱 등록 번호와 로그인 도구 파일이 들어오면 연결할 수 있어요.' },
error: { title: '자료를 못 읽었어요', retry: '다시 시도' },
errorCached: '{source}에서 자료를 못 읽었어요. {time} 자료를 보여 드려요.',
errorCachedMsg: '{msg} 이 기기에 남은 {time} 자료를 보여 드려요.',
stale: "자료가 {days}일 전({date}) 것이에요. Claude에게 '대시보드 갱신'이라고 말해 주세요.",
staleGraph: '장부 자료가 {days}일 동안 바뀌지 않았어요 ({date} 갱신).',
fresh: '자료를 새로 받았어요.',
synthetic: '예시 자료예요. 숫자는 모두 가짜예요.',
invalid: '자료 점검에서 오류 {n}개가 나왔어요. 숫자를 보기 전에 자료 화면을 봐 주세요.',
blockEmpty: '이 기간에는 자료가 없어요.'
},
sources: { artifact: 'Claude 갱신', graph: 'OneDrive 장부 자료', file: '파일(시험)' },
sourceNames: { artifact: 'Claude 자료함', graph: 'OneDrive', file: '파일' },
graph: {
settings: '연결 설정',
settingsSub: '이 기기에서 장부를 어디서 받아 오는지예요.',
account: '로그인한 계정', source: '장부 자료', sourceOwn: '내 OneDrive › 가게장부', sourceShare: '공유받은 가게장부 폴더', saved: '자료 저장', fingerprint: '데이터 지문',
connTitle: '연결', connDesc: '이 앱은 OneDrive의 장부 자료 파일 하나만 읽어요. 고치거나 지우지 않아요.',
firstTitle: '공유 링크를 넣어 주세요',
firstBody: '사장님께 받은 OneDrive 공유 링크를 아래 칸에 붙여 넣어 주세요. 처음 한 번만 하면 이 기기에서 기억해요.',
ownerHint: '사장님 계정이면 링크가 없어도 돼요. OneDrive 가게장부 폴더에 장부 자료가 저장된 뒤 [다시 찾기]를 눌러 주세요.',
retryFind: '다시 찾기',
otherAccount: '다른 계정으로 로그인',
loggedInAs: '로그인: {account}',
linkLabel: '공유 링크', linkPlaceholder: 'https://1drv.ms/…',
linkHelp: '카카오톡으로 받은 글을 통째로 붙여 넣어도 돼요. 링크만 골라 읽어요.',
linkSubmit: '연결하기', linkChecking: '확인하고 있어요…', linkSaved: '공유 링크를 저장했어요. 장부를 불러와요.', cancel: '그만두기',
linkAgainTitle: '공유 링크를 다시 넣어 주세요',
linkTitle: '공유 링크', linkStored: '이 기기에 공유 링크가 저장돼 있어요. 사장님이 새 링크를 보내 주시면 바꿔 넣어요.', linkNone: '공유 링크 없이 내 OneDrive에서 바로 읽고 있어요.',
linkChange: '공유 링크 바꾸기', linkAdd: '공유 링크 넣기', linkClear: '공유 링크 지우기',
linkClearQ: '이 기기에 저장된 공유 링크와 장부 자료를 지울까요? OneDrive의 파일은 그대로예요.', linkClearYes: '지우기', linkCleared: '공유 링크를 지웠어요.',
signoutTitle: '로그아웃', signoutDesc: '이 기기에서 로그아웃하고, 이 기기에 남은 장부 자료와 공유 링크를 지워요.', signout: '로그아웃',
back: '장부로 돌아가기',
err: {
offline: '인터넷에 연결되지 않았어요.',
auth: '로그인이 끝났어요. 다시 로그인해 주세요.',
login: '로그인하지 못했어요({code}). 다시 로그인해 주세요.',
cancelled: '로그인을 마치지 않았어요. 다시 로그인해 주세요.',
loop: '로그인을 이어 가지 못했어요. 잠시 뒤 다시 로그인해 주세요.',
forbidden: '이 계정으로는 장부 자료를 읽을 수 없어요.',
throttled: 'OneDrive가 잠시 쉬어 가래요. 조금 뒤 다시 시도해 주세요.',
server: 'OneDrive에서 자료를 못 읽었어요({status}).',
missing: 'OneDrive 가게장부 폴더에 장부 자료가 없어요.',
noFile: '공유 폴더에 장부 자료 파일이 아직 없어요. 사장님께 알려 주세요.',
linkEmpty: '공유 링크를 붙여 넣어 주세요.',
linkBad: 'OneDrive 공유 링크가 아니에요. 사장님께 받은 링크(https://1drv.ms/… 같은 주소)를 그대로 붙여 넣어 주세요.',
linkDenied: '이 링크를 열 수 없어요. 사장님이 공유한 계정으로 로그인했는지 확인해 주세요. 그래도 안 되면 사장님께 링크를 다시 받아 주세요.',
linkNotLedger: '이 링크는 장부 자료가 아니에요. 사장님께 가게장부 폴더 링크를 받아 주세요.',
revoked: '공유가 끝났거나 이 계정으로는 더 볼 수 없어요. 사장님께 다시 공유를 부탁해 주세요.',
corrupt: '장부 자료 파일이 손상돼서 읽지 않았어요. 다음 갱신 때 다시 받아요.',
mismatch: '장부 자료 파일의 확인 값이 맞지 않아 읽지 않았어요. 다음 갱신 때 다시 받아요.',
kind: '장부 자료 파일이 아니에요.',
schema: '이 앱이 모르는 새 장부 자료예요. 앱을 닫았다가 다시 열어 주세요.',
invalid: '장부 자료 점검에서 오류 {n}개가 나와 읽지 않았어요. 다음 갱신 때 다시 받아요.',
tooBig: '장부 자료 파일이 너무 커요.'
}
},
lock: {
rpName: '가게 장부', userName: '장부 잠금',
title: '지문 잠금', desc: '이 기기에서 앱을 열 때 지문(또는 얼굴)으로 열어요. 1분 넘게 다른 앱에 있다가 돌아와도 다시 잠가요.',
name: '지문 잠금', onDesc: '켜져 있어요. 앱을 열 때마다 지문(또는 얼굴)으로 열어요.', offDesc: '꺼져 있어요. 켜면 이 기기의 지문(또는 얼굴)을 한 번 등록해요.',
checking: '이 기기에서 쓸 수 있는지 확인하고 있어요…',
na: '이 기기(브라우저)에서는 지문 잠금을 쓸 수 없어요.', naOn: '이 기기에서 지문을 더는 쓸 수 없어요. 잠금을 꺼 주세요.', turnOff: '잠금 끄기',
registering: '지문을 등록하고 있어요…', onDone: '지문 잠금을 켰어요.', offDone: '지문 잠금을 껐어요.',
enableErr: { cancelled: '지문 등록을 마치지 않았어요. 다시 켜 주세요.', failed: '지문을 등록하지 못했어요. 잠시 뒤 다시 해 주세요.', unsupported: '이 기기에서는 지문 잠금을 쓸 수 없어요.' },
lockedTitle: '장부가 잠겨 있어요', lockedBody: '지문(또는 얼굴)으로 열어 주세요.',
unlock: '지문으로 열기', unlocking: '확인하고 있어요…', retry: '다시 해 보기',
unlockErr: '잠금을 풀지 못했어요. 다시 해 보시고, 그래도 안 되면 다시 로그인해 주세요.',
unsupported: '이 기기에서 지문을 쓸 수 없게 됐어요. 다시 로그인하면 잠금이 꺼져요.',
relogin: '다시 로그인', reloginNote: '다시 로그인하면 지문 잠금이 꺼지고, 이 기기에 남은 장부 자료와 공유 링크도 지워요. OneDrive 파일은 그대로예요.'
}
};
L.josa = function (word, pair) {
var w = String(word || ''), ch = w.charCodeAt(w.length - 1), has;
if (ch >= 0xac00 && ch <= 0xd7a3) has = (ch - 0xac00) % 28 !== 0;
else has = /[013678LMNlmn]$/.test(w);
var p = pair.split('/');
if (pair === '으로/로' && ch >= 0xac00 && ch <= 0xd7a3 && (ch - 0xac00) % 28 === 8) return w + '로';
return w + (has ? p[0] : p[1]);
};
L.tpl = function (s, vars) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : ''; }); };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root, factory) {
if (typeof module === 'object' && module.exports) module.exports = factory(require('./contract/snapshot.js'), require('./view-config.js'));
else { root.Ledger = root.Ledger || {}; root.Ledger.model = factory(root.Ledger.Snapshot, root.Ledger.viewConfig); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (S, VC) {
'use strict';
VC = VC || {};
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function ym(y, m) { return y + '-' + pad2(m); }
function addMonths(s, k) {
var p = String(s).split('-').map(Number), y = p[0], m = p[1] + k;
while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; }
return ym(y, m);
}
function utc(s) { var p = String(s).slice(0, 10).split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
function daysBetween(a, b) { return Math.round((utc(b) - utc(a)) / 86400000); }
function todayLocal() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function weekStart(s) { var t = new Date(utc(s)), wd = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - wd); return t.toISOString().slice(0, 10); }
function val(value, v) { return { value: isNum(value) ? value : (value == null ? null : value), v: v }; }
function plus(list) { return list.filter(Boolean).join(' + '); }
function sumVals(list) { var s = 0, any = false; list.forEach(function (x) { if (isNum(x)) { s += x; any = true; } }); return any ? s : null; }
var COST_ROWS = [
{ id: 'food', majors: ['식재료비', '식재료'] }, { id: 'labor', majors: ['인건비'] }, { id: 'rent_fixed', majors: ['임대료·고정비', '임대·고정비'] },
{ id: 'utilities', majors: ['공과금'] }, { id: 'delivery_fees', majors: ['배달·수수료', '배달 수수료'] }, { id: 'taxes', majors: ['세금'] },
{ id: 'opex', majors: ['운영비', '기타 운영비'] }, { id: 'review', majors: ['확인 필요', '미분류', '확인 중'], into: 'opex' }
];
COST_ROWS.forEach(function (c) { c.major = c.majors[0]; });
var SHOWN_COSTS = COST_ROWS.filter(function (c) { return !c.into; }).map(function (c) {
var inner = COST_ROWS.filter(function (x) { return x.into === c.id; });
return { id: c.id, major: c.major, majors: c.majors, cols: [c.id].concat(inner.map(function (x) { return x.id; })), extra: inner.reduce(function (a, x) { return a.concat(x.majors); }, []) };
});
var REVIEW_LABELS = VC.REVIEW_ITEM_LABELS || {};
var DRIVERS = [{ id: 'revenue', sign: 1, cols: ['revenue'] }, { id: 'other_income', sign: 1, cols: ['other_income'] }]
.concat(SHOWN_COSTS.map(function (c) { return { id: c.id, sign: -1, cols: c.cols }; }));
var KPI_IDS = ['revenue', 'op_cost', 'op_profit', 'op_margin', 'food_ratio', 'labor_ratio', 'other_income', 'income_total'];
var REV_PARTS = ['rev_card', 'rev_delivery', 'rev_easypay'];
var OUTSIDE = [{ id: 'finance_out', personal: false }, { id: 'owner_transfer', personal: true },
{ id: 'family_transfer', personal: true }, { id: 'internal_net', personal: false }];
function create(snap, opts) {
opts = opts || {};
var labels = Object.assign({ tax: '세금', etc: '기타', loan: '대출', all: '두 가게', '2ho': '가게 1', eungam: '가게 2' }, opts.labels || {});
var colLabels = opts.columns || {};
var today = opts.today || todayLocal();
var meta = snap.meta || {};
var asOf = meta.data_as_of || null, asOfMonth = asOf ? String(asOf).slice(0, 7) : null;
var monthly = snap.monthly || [], byMS = {}, storeLabels = {};
monthly.forEach(function (r) { (byMS[r.month] = byMS[r.month] || {})[r.store] = r; if (r.store_label && !storeLabels[r.store]) storeLabels[r.store] = r.store_label; });
var ADJ_COLS = ['food', 'labor', 'rent_fixed', 'opex', 'op_cost', 'op_profit'];
var adjBy = {}; (snap.pnlAdj || []).forEach(function (r) { adjBy[r.month + '/' + r.store] = r; });
var adjOn = !!(snap.pnlAdj && snap.pnlAdj.length) && opts.basis !== 'bank';
if (adjOn) Object.keys(byMS).forEach(function (m) {
Object.keys(byMS[m]).forEach(function (st) {
var a = adjBy[m + '/' + st], r = byMS[m][st];
if (!a || !r || !r.has_data) return;
var o = Object.assign({}, r); ADJ_COLS.forEach(function (c) { o[c] = a[c]; }); o._adj = true;
byMS[m][st] = o;
});
});
var COSTS = adjOn ? SHOWN_COSTS.filter(function (c) { return c.id !== 'taxes'; }) : SHOWN_COSTS;
var DRIVERS_I = adjOn ? DRIVERS.filter(function (d) { return d.id !== 'taxes'; }) : DRIVERS;
function adjCol(month, store, col) { return adjOn && ADJ_COLS.indexOf(col) >= 0 && !!adjBy[month + '/' + store]; }
var allMonths = Object.keys(byMS).sort();
var dm = {}; (snap.debtMonthly || []).forEach(function (r) { dm[r.month] = r; });
var dmMonths = Object.keys(dm).sort();
var debts = (snap.debts || []).slice(), byId = {};
debts.forEach(function (d) { byId[d.debt_id] = d; });
if (!asOfMonth) asOfMonth = allMonths.filter(function (m) { return byMS[m].all && byMS[m].all.has_data; }).pop() || null;
var fieldLabel = {};
(snap.fields || []).forEach(function (f) { if (f.table === 'web_monthly' && f.label_ko) fieldLabel[f.field] = f.label_ko; });
function storeLabel(code) { return storeLabels[code] || labels[code] || code; }
function placeKey(p) { return storeLabels['2ho'] && p === storeLabels['2ho'] ? '@2ho' : storeLabels.eungam && p === storeLabels.eungam ? '@eungam' : p; }
function placeRank(p) { return (VC.PLACE_ORDER || []).indexOf(placeKey(p)); }
function placeCode(p) { return (VC.PLACE_CODES || {})[placeKey(p)] || null; }
function row(month, store) { return byMS[month] ? byMS[month][store || 'all'] || null : null; }
function hasData(month, store) { var r = row(month, store); return !!(r && r.has_data); }
function months(store) { return allMonths.filter(function (m) { return hasData(m, store); }); }
function latestMonth(store) { var a = months(store || 'all'); return a.length ? a[a.length - 1] : null; }
function years() {
var withData = Array.from(new Set(months('all').map(function (m) { return Number(m.slice(0, 4)); })));
var ys = (snap.years || []).filter(function (y) { return isNum(y.year) && (!isNum(y.months_with_data) || y.months_with_data > 0); }).map(function (y) { return y.year; })
.filter(function (y) { return withData.indexOf(y) >= 0; });
if (!ys.length) ys = withData;
return ys.sort(function (a, b) { return a - b; });
}
function mv(month, store, col) { return (adjCol(month, store, col) ? 'pnlAdj[' : 'monthly[') + month + '/' + store + '].' + col; }
function label(col) { return fieldLabel[col] || colLabels[col] || col; }
function metric(month, store, id) {
var r = row(month, store);
if (!r || !r.has_data) return val(null, null);
if (id === 'op_margin') return val(r.revenue ? r.op_profit / r.revenue : null, mv(month, store, 'op_profit') + ' / ' + mv(month, store, 'revenue'));
if (id === 'food_ratio') return val(r.revenue ? r.food / r.revenue : null, mv(month, store, 'food') + ' / ' + mv(month, store, 'revenue'));
if (id === 'labor_ratio') return val(r.revenue ? r.labor / r.revenue : null, mv(month, store, 'labor') + ' / ' + mv(month, store, 'revenue'));
return val(r[id], mv(month, store, id));
}
function withDelta(month, store, id) {
var cur = metric(month, store, id), prev = metric(addMonths(month, -1), store, id);
var d = isNum(cur.value) && isNum(prev.value) ? cur.value - prev.value : null;
return { value: cur.value, v: cur.v, prev: prev, delta: val(d, d == null ? null : '(' + cur.v + ') - (' + prev.v + ')') };
}
function kpis(store, month) {
var out = {};
KPI_IDS.forEach(function (id) { out[id] = withDelta(month, store, id); });
var r = row(month, store);
out.accrual = r && r.has_data && r.accrual_complete && isNum(r.op_profit_accrual) ? val(r.op_profit_accrual, mv(month, store, 'op_profit_accrual')) : val(null, null);
return out;
}
function series(store, id, endMonth, n) {
n = n || 12;
var out = [];
for (var k = n - 1; k >= 0; k--) { var m = addMonths(endMonth, -k), x = metric(m, store, id); out.push({ month: m, value: x.value, v: x.v, hasData: hasData(m, store) }); }
return out;
}
function sumOver(store, list, cols) {
var vals = [], paths = [];
(list || []).forEach(function (m) {
var r = row(m, store);
if (!r || !r.has_data) return;
cols.forEach(function (c) { if (isNum(r[c])) { vals.push(r[c]); paths.push(mv(m, store, c)); } });
});
return val(vals.length ? sumVals(vals) : null, paths.length ? plus(paths) : null);
}
function sumOverBank(store, list, cols) {
var vals = [], paths = [];
(list || []).forEach(function (m) {
var r = (monthly.filter(function (x) { return x.month === m && x.store === store; })[0]) || null;
if (!r || !r.has_data) return;
cols.forEach(function (c) { if (isNum(r[c])) { vals.push(r[c]); paths.push('monthly[' + m + '/' + store + '].' + c); } });
});
return val(vals.length ? sumVals(vals) : null, paths.length ? plus(paths) : null);
}
function yearMonths(store, year) { return months(store).filter(function (m) { return m.slice(0, 4) === String(year); }); }
function sameMonthsLastYear(store, list) { return (list || []).map(function (m) { return addMonths(m, -12); }).filter(function (m) { return hasData(m, store); }); }
function ratioOver(store, list, numCol, denCol) {
var a = sumOver(store, list, [numCol]), b = sumOver(store, list, [denCol]);
return val(isNum(a.value) && b.value ? a.value / b.value : null, a.v && b.v ? '(' + a.v + ') / (' + b.v + ')' : null);
}
function metricOver(store, list, id) {
if (id === 'op_margin') return ratioOver(store, list, 'op_profit', 'revenue');
if (id === 'food_ratio') return ratioOver(store, list, 'food', 'revenue');
if (id === 'labor_ratio') return ratioOver(store, list, 'labor', 'revenue');
return sumOver(store, list, [id]);
}
function kpisYear(store, year) { return kpisOver(store, yearMonths(store, year)); }
function kpisOver(store, list) {
var ms = (list || []).filter(function (m) { return hasData(m, store); });
var same = ms.filter(function (m) { return hasData(addMonths(m, -12), store); });
var prevList = same.map(function (m) { return addMonths(m, -12); });
var out = { months: ms, sameMonths: same, partial: same.length > 0 && same.length < ms.length };
KPI_IDS.forEach(function (id) {
var cur = metricOver(store, ms, id), a = same.length === ms.length ? cur : metricOver(store, same, id), b = metricOver(store, prevList, id);
var d = same.length && isNum(a.value) && isNum(b.value) ? a.value - b.value : null;
out[id] = { value: cur.value, v: cur.v, prev: b, delta: val(d, d == null ? null : '(' + a.v + ') - (' + b.v + ')') };
});
out.accrual = val(null, null);
return out;
}
function revenueMixOver(store, list) {
if (!list.length) return [];
var rev = sumOver(store, list, ['revenue']);
return REV_PARTS.map(function (c) {
var x = sumOver(store, list, [c]);
return { id: c, value: x.value, v: x.v, share: isNum(x.value) && rev.value ? x.value / rev.value : null, shareV: x.v && rev.v ? '(' + x.v + ') / (' + rev.v + ')' : null };
});
}
var debtMonth = (S.debtMonthOf && S.debtMonthOf(snap)) || asOfMonth;
var prevDebtMonth = debtMonth ? addMonths(debtMonth, -1) : null;
var debtAsOf = (S.debtAsOfDate && S.debtAsOfDate(snap)) || asOf;
var EXCL = (opts.excludeDebts || VC.DEBT_EXCLUDE || []).map(function (x) { return typeof x === 'string' ? { id: x, why: '' } : x; });
var EXCL_IDS = EXCL.map(function (x) { return x.id; });
function excludedId(id) { var top = String(id).split('.')[0]; return EXCL_IDS.indexOf(top) >= 0; }
var LEAF = (S.DEBT_LEAF || ['nain', 'taejo', 'hyunjin', 'bethel', 'other_ap', 'tax_2ho', 'tax_eungam', 'utility_unpaid', 'loan_corp', 'loan_other']).filter(function (c) { return EXCL_IDS.indexOf(c) < 0; });
var TAX_COLS = { tax_2ho: '2ho', tax_eungam: 'eungam' };
var taxM = {}; (snap.taxMonthly || []).forEach(function (r) { taxM[r.month + '/' + r.store] = r; });
function taxFill(month, col) {
var st = TAX_COLS[col], r = dm[month];
if (!st || !debtMonth || !(month < debtMonth) || !r || !isNum(r.all_total) || isNum(r[col])) return null;
var t = taxM[month + '/' + st]; return t && isNum(t.remaining) ? t : null;
}
function dmv(month, col) { var r = dm[month]; if (r && isNum(r[col])) return r[col]; var t = taxFill(month, col); return t ? t.remaining : null; }
function dmPath(month, col) { return taxFill(month, col) ? 'taxMonthly[' + month + '/' + TAX_COLS[col] + '].remaining' : 'debtMonthly[' + month + '].' + col; }
function taxPeriods() {
var meta = snap.taxMeta, rows = snap.taxMonthly || [];
if (!meta || !rows.length) return null;
var months = Array.from(new Set(rows.map(function (r) { return r.month; }))).sort();
var filled = months.filter(function (m) { return taxFill(m, 'tax_2ho') || taxFill(m, 'tax_eungam'); });
var diffs = [];
months.forEach(function (m) {
var r = dm[m]; if (!r) return;
Object.keys(TAX_COLS).forEach(function (c) {
var t = taxM[m + '/' + TAX_COLS[c]];
if (isNum(r[c]) && t && isNum(t.remaining) && r[c] !== t.remaining) diffs.push({ month: m, col: c, store: TAX_COLS[c], excel: val(r[c], 'debtMonthly[' + m + '].' + c), calc: val(t.remaining, 'taxMonthly[' + m + '/' + TAX_COLS[c] + '].remaining') });
});
});
var sm = meta.snap_date ? String(meta.snap_date).slice(0, 7) : null;
var got = sm ? { value: rows.filter(function (r) { return r.month === sm; }).reduce(function (a, r) { return a + (r.remaining || 0); }, 0), v: 'sum(taxMonthly[' + sm + '/*].remaining)' } : val(null, null);
return { first: meta.first_month || months[0], months: months, filled: filled, snapDate: meta.snap_date || null, snapMonth: sm, ok: meta.check_ok === true && !diffs.length,
checkOk: meta.check_ok === true, got: got, want: isNum(meta.want_all) ? { value: meta.want_all, v: 'ui:taxWant' } : val(null, null), diffs: diffs,
assumed: { n: meta.assumed_n || 0, amount: meta.assumed_amount || 0 }, liab: (snap.taxLiab || []).slice() };
}
function debtCell(month, col) { var x = dmv(month, col); return val(x, x == null ? null : dmPath(month, col)); }
function colName(col) {
if (/^tax_/.test(col)) return labels.tax;
if (/^loan_/.test(col)) return labels.loan;
return byId[col] ? byId[col].name : col;
}
function compareCols(cols, m1, m0) {
var both = cols.filter(function (c) { return isNum(dmv(m1, c)) && isNum(dmv(m0, c)); });
var onlyNow = cols.filter(function (c) { return isNum(dmv(m1, c)) && !isNum(dmv(m0, c)) && dmv(m1, c) !== 0; });
var onlyBefore = cols.filter(function (c) { return !isNum(dmv(m1, c)) && isNum(dmv(m0, c)) && dmv(m0, c) !== 0; });
var excluded = Array.from(new Set(onlyNow.concat(onlyBefore).map(colName)));
if (!both.length) return { both: both, excluded: excluded, now: val(null, null), before: val(null, null), change: val(null, null) };
var vNow = plus(both.map(function (c) { return dmPath(m1, c); })), vBefore = plus(both.map(function (c) { return dmPath(m0, c); }));
var a = sumVals(both.map(function (c) { return dmv(m1, c); })), b = sumVals(both.map(function (c) { return dmv(m0, c); }));
return { both: both, excluded: excluded, now: val(a, vNow), before: val(b, vBefore), change: val(a - b, '(' + vNow + ') - (' + vBefore + ')') };
}
function debtTotal(month) {
var r = dm[month];
if (!r || !isNum(r.all_total)) return val(null, null);
var have = LEAF.filter(function (c) { return isNum(dmv(month, c)); });
return val(have.length ? sumVals(have.map(function (c) { return dmv(month, c); })) : null, have.length ? plus(have.map(function (c) { return dmPath(month, c); })) : null);
}
function excludedDebts() { return EXCL.map(function (x) { var d = byId[x.id]; return d ? { id: x.id, name: d.name, why: x.why || '', value: val(d.current_balance, 'debts[' + x.id + '].current_balance') } : null; }).filter(Boolean); }
function debtNow() {
var cmp = compareCols(LEAF, debtMonth, prevDebtMonth);
return { month: debtMonth, prevMonth: prevDebtMonth, asOf: debtAsOf, total: debtTotal(debtMonth), prevTotal: debtTotal(prevDebtMonth), change: cmp.change, excluded: cmp.excluded, compared: cmp.both };
}
function debtSeries() { return dmMonths.map(function (m) { return { month: m, value: debtTotal(m).value, actual: debtMonth ? m <= debtMonth : true }; }); }
function debtMonths() { return dmMonths.slice(); }
function lateColumns() {
var actual = dmMonths.filter(function (m) { return !debtMonth || m <= debtMonth; });
if (actual.length < 2) return [];
var out = [];
LEAF.forEach(function (c) {
var first = actual.filter(function (m) { return isNum(dmv(m, c)) && dmv(m, c) !== 0; })[0];
if (first && first !== actual[0] && !isNum(dmv(actual[0], c))) out.push({ col: c, month: first, name: colName(c) });
});
return out;
}
function kidsOf(id) { return debts.filter(function (d) { return String(d.debt_id).indexOf(id + '.') === 0; }); }
function noHistory(d) { return !!(d && d.start_date && d.current_date && d.start_date >= d.current_date); }
function single(d) {
var id = d.debt_id, cur = d.current_balance, hasCol = S.DEBT_COLUMNS.indexOf(id) >= 0;
var prev = hasCol ? dmv(prevDebtMonth, id) : null;
var change = isNum(cur) && isNum(prev) ? cur - prev : null;
return {
id: id, label: d.name, kind: d.kind, unknown: !isNum(cur), debts: [d], unknownMembers: [],
current: val(cur, 'debts[' + id + '].current_balance'),
prev: val(prev, hasCol && isNum(prev) ? dmPath(prevDebtMonth, id) : null),
change: val(change, change == null ? null : 'debts[' + id + '].current_balance - ' + dmPath(prevDebtMonth, id)),
start: val(d.start_balance, 'debts[' + id + '].start_balance'), startDate: d.start_date, noHistory: noHistory(d),
avg3: val(d.avg_net_paydown_3m, 'debts[' + id + '].avg_net_paydown_3m'),
payoff: val(d.payoff_month || null, 'debts[' + id + '].payoff_month'),
status: d.status, source: d.confirmed_source, confirmedDate: d.confirmed_date, currentDate: d.current_date,
children: kidsOf(id).map(function (k) { return { id: k.debt_id, label: storeLabel(k.store), value: val(k.current_balance, 'debts[' + k.debt_id + '].current_balance') }; })
};
}
function group(id, label, list, childLabel) {
var known = list.filter(function (d) { return isNum(d.current_balance); });
var cur = sumVals(known.map(function (d) { return d.current_balance; }));
var paired = known.filter(function (d) { return S.DEBT_COLUMNS.indexOf(d.debt_id) >= 0 && isNum(dmv(prevDebtMonth, d.debt_id)); });
var pairedCur = sumVals(paired.map(function (d) { return d.current_balance; })), prev = sumVals(paired.map(function (d) { return dmv(prevDebtMonth, d.debt_id); }));
var curV = plus(known.map(function (d) { return 'debts[' + d.debt_id + '].current_balance'; }));
var pairedV = plus(paired.map(function (d) { return 'debts[' + d.debt_id + '].current_balance'; }));
var prevV = plus(paired.map(function (d) { return dmPath(prevDebtMonth, d.debt_id); }));
var change = paired.length && isNum(pairedCur) && isNum(prev) ? pairedCur - prev : null;
var avgList = list.filter(function (d) { return isNum(d.avg_net_paydown_3m); });
var avg = sumVals(avgList.map(function (d) { return d.avg_net_paydown_3m; }));
var payoff = isNum(cur) && isNum(avg) && avg > 0 && cur > 0 ? addMonths(debtMonth, Math.ceil(cur / avg)) : null;
var unknownMembers = list.filter(function (d) { return !isNum(d.current_balance); });
var startList = list.filter(function (d) { return isNum(d.start_balance); });
return {
id: id, label: label, kind: list[0].kind, unknown: !isNum(cur), debts: list, isGroup: true, unknownMembers: unknownMembers,
current: val(cur, curV || null), prev: val(prev, prevV || null), change: val(change, change == null ? null : '(' + pairedV + ') - (' + prevV + ')'),
start: val(sumVals(startList.map(function (d) { return d.start_balance; })), plus(startList.map(function (d) { return 'debts[' + d.debt_id + '].start_balance'; })) || null),
startDate: list.map(function (d) { return d.start_date; }).filter(Boolean).sort()[0] || null,
noHistory: (function () { var live = list.filter(function (d) { return isNum(d.current_balance) && d.current_balance !== 0; }); return live.length > 0 && live.every(noHistory); })(),
avg3: val(avg, avgList.length ? plus(avgList.map(function (d) { return 'debts[' + d.debt_id + '].avg_net_paydown_3m'; })) : null),
payoff: val(payoff, payoff ? 'calc:groupPayoff:' + id : null),
status: unknownMembers.length ? '확인 필요' : change == null ? null : change < 0 ? '줄어드는 중' : change > 0 ? '늘어나는 중' : '줄지 않는 중',
source: Array.from(new Set(list.map(function (d) { return d.confirmed_source; }).filter(Boolean))).join(' · '),
confirmedDate: list.map(function (d) { return d.confirmed_date; }).filter(Boolean).sort().pop() || null,
currentDate: list.map(function (d) { return d.current_date; }).filter(Boolean).sort().pop() || null,
children: list.map(function (d) { return { id: d.debt_id, label: childLabel ? childLabel(d) : d.name, unknown: !isNum(d.current_balance), value: val(d.current_balance, 'debts[' + d.debt_id + '].current_balance') }; })
};
}
function debtGroups() {
var top = debts.filter(function (d) { return String(d.debt_id).indexOf('.') < 0 && !excludedId(d.debt_id); });
var bal = function (x) { return isNum(x.current_balance) ? x.current_balance : -1; };
var out = [];
top.filter(function (d) { return d.kind === 'supplier'; }).sort(function (a, b) { return bal(b) - bal(a); }).forEach(function (d) { out.push(single(d)); });
var tx = top.filter(function (d) { return d.kind === 'tax'; });
if (tx.length) out.push(group('tax', labels.tax, tx, function (d) { return d.name || storeLabel(d.store); }));
top.filter(function (d) { return d.kind === 'loan'; }).forEach(function (d) { out.push(single(d)); });
var et = top.filter(function (d) { return d.kind === 'utility' || d.kind === 'other'; }).sort(function (a, b) { return bal(b) - bal(a); });
if (et.length) out.push(group('etc', labels.etc, et));
return out;
}
function findGroup(id) {
var g = debtGroups().filter(function (x) { return x.id === id; })[0];
if (g) return g;
if (excludedId(id)) return null;
var d = byId[id]; return d ? single(d) : null;
}
function composition() {
var gs = debtGroups().filter(function (g) { return !g.unknown && isNum(g.current.value) && g.current.value > 0; });
var main = gs.filter(function (g) { return g.id !== 'etc'; }).sort(function (a, b) { return b.current.value - a.current.value; });
var rest = main.slice(4).concat(gs.filter(function (g) { return g.id === 'etc'; }));
var parts = main.slice(0, 4).map(function (g) { return { id: g.id, label: g.label, value: g.current.value, v: g.current.v }; });
var members = [];
rest.forEach(function (g) {
if (g.isGroup) g.children.forEach(function (c) { if (isNum(c.value.value) && c.value.value > 0) members.push(c.label); });
else members.push(g.label);
});
if (rest.length) parts.push({ id: 'etc', label: labels.etc, value: sumVals(rest.map(function (g) { return g.current.value; })), v: plus(rest.map(function (g) { return g.current.v; })), members: members });
return parts;
}
function unknownDebts() { return debts.filter(function (d) { return String(d.debt_id).indexOf('.') < 0 && !excludedId(d.debt_id) && !isNum(d.current_balance); }); }
function pace(n) {
n = n || 6;
if (!debtMonth) return null;
var m0 = addMonths(debtMonth, -n), cmp = compareCols(LEAF, debtMonth, m0), total = debtTotal(debtMonth);
if (!cmp.both.length || !isNum(total.value)) return null;
var avg = Math.round((cmp.before.value - cmp.now.value) / n);
var payoff = avg > 0 && total.value > 0 ? addMonths(debtMonth, Math.ceil(total.value / avg)) : null;
return {
n: n, from: m0, excluded: cmp.excluded,
avg: val(avg, 'round(((' + cmp.before.v + ') - (' + cmp.now.v + ')) / ' + n + ')'),
total: total, payoff: val(payoff, payoff ? 'calc:payoff:' + n : null), months: avg > 0 ? Math.ceil(total.value / avg) : null
};
}
function payoffWith(amount, total) {
if (!isNum(amount) || amount <= 0 || !isNum(total)) return null;
if (total <= 0) return { months: 0, month: debtMonth };
var k = Math.ceil(total / amount);
return { months: k, month: addMonths(debtMonth, k) };
}
function tax(day) {
day = day || today;
var rows = (snap.tax || []).filter(function (t) { return isNum(t.remaining) && t.remaining > 0; }).map(function (t) {
return { row: t, id: t.tax_id, hometax: S.isHometax ? S.isHometax(t) : true, days: t.due_date ? daysBetween(day, t.due_date) : null, remaining: val(t.remaining, 'tax[' + t.tax_id + '].remaining') };
}).sort(function (a, b) { return String(a.row.due_date).localeCompare(String(b.row.due_date)) || b.remaining.value - a.remaining.value || String(a.id).localeCompare(String(b.id)); });
var overdue = rows.filter(function (x) { return x.days != null && x.days < 0; });
var upcoming = rows.filter(function (x) { return x.days == null || x.days >= 0; });
var total = (function (list) { return val(sumVals(list.map(function (x) { return x.remaining.value; })), plus(list.map(function (x) { return x.remaining.v; })) || null); });
return { all: rows, overdue: overdue, upcoming: upcoming, total: total(rows), overdueTotal: total(overdue), upcomingTotal: total(upcoming), soon: upcoming.filter(function (x) { return x.days != null && x.days <= 14; }), totalOf: total };
}
function reviewTypes() { return (snap.review || []).slice(); }
function reviewItems(type) {
return (snap.reviewItems || []).filter(function (r) { return !type || type === '전체' || r.type === type; })
.sort(function (a, b) { return (isNum(b.amount) ? b.amount : -1) - (isNum(a.amount) ? a.amount : -1) || a.rank - b.rank; });
}
function reviewCount() { return isNum(meta.review_count) ? val(meta.review_count, 'meta.review_count') : val(sumVals(reviewTypes().map(function (r) { return r.count; })), null); }
function checks() {
var list = snap.checks || [];
var by = { ok: [], warn: [], fail: [], none: [] };
list.forEach(function (c) { (by[c.status === 'ok' || c.status === 'warn' || c.status === 'fail' ? c.status : 'none']).push(c); });
return { all: list, ok: by.ok, warn: by.warn, fail: by.fail, none: by.none, counted: by.ok.length + by.warn.length + by.fail.length, bad: by.fail.concat(by.warn) };
}
function finding(store, month, validation) {
store = store || 'all'; month = month || latestMonth(store);
var fails = checks().fail.length + (validation && validation.errors ? validation.errors.length : 0);
if (fails > 0) return { kind: 'bad', key: 'checksFailed', n: fails };
var now = debtNow();
if (isNum(now.change.value) && now.change.value > 0)
return { kind: 'bad', key: 'debtUp', amount: now.change, prevMonth: now.prevMonth, excluded: now.excluded };
var lossStores = (store === 'all' ? ['2ho', 'eungam'] : [store]).filter(function (s) { var r = row(month, s); return r && r.has_data && isNum(r.op_profit) && r.op_profit < 0; });
if (lossStores.length) { var ls = lossStores[0]; return { kind: 'bad', key: 'loss', store: ls, storeLabel: storeLabel(ls), month: month, amount: val(row(month, ls).op_profit, mv(month, ls, 'op_profit')) }; }
var t = tax(today);
if (t.soon.length) {
var first = t.soon[0].row.due_date, same = t.soon.filter(function (x) { return x.row.due_date === first; });
return { kind: 'warn', key: 'taxSoon', date: first, days: t.soon[0].days, count: same.length, amount: t.totalOf(same) };
}
var streak = 0, m = month;
var both = store === 'all' ? ['2ho', 'eungam'] : [store];
while (both.every(function (s) { var r = row(m, s); return r && r.has_data && r.op_profit > 0; })) { streak++; m = addMonths(m, -1); }
if (streak >= 3) return { kind: 'good', key: 'streak', n: streak, store: store, storeLabel: storeLabel(store) };
if (isNum(now.change.value)) return { kind: now.change.value < 0 ? 'good' : 'neutral', key: 'debtDown', amount: val(-now.change.value, '-(' + now.change.v + ')'), prevMonth: now.prevMonth, excluded: now.excluded };
return { kind: 'neutral', key: 'none' };
}
function freshness(day) {
day = day || today;
var banks = [meta.bank_last_2ho, meta.bank_last_eungam].filter(Boolean).sort();
var stmts = [meta.stmt_last_nain, meta.stmt_last_taejo, meta.stmt_last_hyunjin].filter(Boolean).sort();
var refreshed = meta.refreshed_at || meta.built_at || null;
var age = refreshed ? daysBetween(String(refreshed).slice(0, 10), day) : null;
return {
bank: banks.length ? val(banks[0], banks[0] === meta.bank_last_2ho ? 'meta.bank_last_2ho' : 'meta.bank_last_eungam') : val(asOf, 'meta.data_as_of'),
stmt: stmts.length ? val(stmts[stmts.length - 1], null) : val(null, null),
debt: debtAsOf,
refreshed: refreshed, ageDays: age, stale: age != null && age > 3
};
}
function supplier(id) {
var d = byId[id]; if (!d) return null;
var rows = (snap.supplierRecent || []).filter(function (r) { return r.supplier === id || r.supplier === d.name; })
.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
var weeks = [], wmap = {};
rows.forEach(function (r) {
var w = weekStart(r.date), x = wmap[w];
if (!x) { x = wmap[w] = { start: w, rows: [], buy: 0, paid: 0, end: null }; weeks.push(x); }
x.rows.push(r); x.buy += r.buy_total || 0; x.paid += r.paid || 0; x.end = r.balance;
});
var path = function (r, c) { return 'supplierRecent[' + r.supplier + '/' + r.date + '].' + c; };
weeks.forEach(function (x) {
x.buyV = plus(x.rows.map(function (r) { return path(r, 'buy_total'); }));
x.paidV = plus(x.rows.map(function (r) { return path(r, 'paid'); }));
x.endV = path(x.rows[x.rows.length - 1], 'balance');
});
var stmts = rows.filter(function (r) { return (r.buy_total || 0) > 0; });
var sheets = rows.filter(function (r) { return r.buy_2ho > 0; }).length + rows.filter(function (r) { return r.buy_eungam > 0; }).length + rows.filter(function (r) { return r.buy_common > 0; }).length;
var tot = function (c) { return val(sumVals(rows.map(function (r) { return r[c]; })), rows.length ? plus(rows.map(function (r) { return path(r, c); })) : null); };
var beforePay = function (r) { return isNum(r.statement_balance) && isNum(r.paid) && r.paid > 0 && r.statement_balance - r.balance === r.paid; };
return {
debt: d, rows: rows, weeks: weeks, statements: stmts.slice().reverse(), sheets: sheets,
first: rows.length ? rows[0].date : null, last: stmts.length ? stmts[stmts.length - 1].date : null,
buy2ho: tot('buy_2ho'), buyEungam: tot('buy_eungam'), buyCommon: tot('buy_common'), buyTotal: tot('buy_total'), paid: tot('paid'),
latest: rows.length ? val(rows[rows.length - 1].balance, path(rows[rows.length - 1], 'balance')) : val(null, null),
mismatches: stmts.filter(function (r) { return isNum(r.statement_balance) && r.statement_balance !== r.balance && !beforePay(r); }),
beforePay: beforePay, pathOf: path
};
}
function itemsOver(store, yearList, majors, extra) {
var out = [], byLabel = {}, all = majors.concat(extra || []), ys = yearList.map(String);
(snap.itemsYearly || []).filter(function (r) { return ys.indexOf(String(r.year)) >= 0 && r.store === store && all.indexOf(r.major) >= 0; }).forEach(function (r) {
var key = 'itemsYearly[' + r.year + '/' + store + '/' + r.major + '/' + r.item + ']';
var moved = (extra || []).indexOf(r.major) >= 0, lab = moved ? (REVIEW_LABELS[r.item] || r.item) : r.item;
var it = byLabel[lab];
if (!it) { it = byLabel[lab] = { label: lab, major: r.major, moved: moved, from: [], amounts: [], pcts: [], av: [], pv: [] }; out.push(it); }
if (moved && it.from.indexOf(r.item) < 0) it.from.push(r.item);
it.amounts.push(r.amount); it.pcts.push(r.pct_of_revenue);
if (isNum(r.amount)) it.av.push(key + '.amount');
if (isNum(r.pct_of_revenue)) it.pv.push(key + '.pct_of_revenue');
});
out.sort(function (a, b) { return (a.moved ? 1 : 0) - (b.moved ? 1 : 0); });
return out.map(function (it) {
var a = sumVals(it.amounts), p = sumVals(it.pcts);
return { label: it.label, major: it.major, moved: it.moved, from: it.moved ? it.from : [], personal: it.moved && it.from.some(function (f) { return (VC.PERSONAL_REVIEW_ITEMS || []).indexOf(f) >= 0; }),
amount: val(a, it.av.length ? plus(it.av) : null), pct: val(p, it.pv.length ? plus(it.pv) : null) };
});
}
function pnlTable(store, year) {
var ms = []; for (var k = 1; k <= 12; k++) ms.push(ym(year, k));
var adjFull = ms.every(function (m) { return !hasData(m, store) || !!adjBy[m + '/' + store]; });
var yr = function (col) {
if (!(adjOn && ADJ_COLS.indexOf(col) >= 0)) return 'sum(monthly[' + year + '-*/' + store + '].' + col + ')';
if (adjFull) return 'sum(pnlAdj[' + year + '-*/' + store + '].' + col + ')';
return plus(ms.filter(function (m) { return hasData(m, store); }).map(function (m) { return mv(m, store, col); })) || 'ui:noData';
};
var revTotal = sumVals(ms.map(function (m) { var r = row(m, store); return r && r.has_data ? r.revenue : null; }));
function line(id, label, kind) {
var cells = ms.map(function (m) { var r = row(m, store); return r && r.has_data ? val(r[id], mv(m, store, id)) : val(null, 'ui:noData'); });
var total = sumVals(cells.map(function (c) { return c.value; }));
return {
id: id, label: label, kind: kind, cells: cells, total: val(total, total == null ? null : yr(id)),
pct: val(id === 'revenue' || !isNum(total) || !revTotal ? null : total / revTotal, id === 'revenue' || total == null ? null : yr(id) + ' / ' + yr('revenue'))
};
}
function lineOf(id, cols, kind) {
if (cols.length === 1) return line(id, null, kind);
var cells = ms.map(function (m) {
var r = row(m, store);
if (!(r && r.has_data)) return val(null, 'ui:noData');
var have = cols.filter(function (c) { return isNum(r[c]); });
return val(have.length ? sumVals(have.map(function (c) { return r[c]; })) : null, have.length ? plus(have.map(function (c) { return mv(m, store, c); })) : null);
});
var total = sumVals(cells.map(function (c) { return c.value; }));
var used = cols.filter(function (c) { return ms.some(function (m) { var r = row(m, store); return r && r.has_data && isNum(r[c]); }); });
var yv = used.length ? plus(used.map(yr)) : null;
return {
id: id, label: null, kind: kind, cells: cells, merged: cols.slice(1), total: val(total, total == null ? null : yv),
pct: val(!isNum(total) || !revTotal ? null : total / revTotal, total == null || !yv ? null : '(' + yv + ') / ' + yr('revenue'))
};
}
function items(majors, extra) { return itemsOver(store, [year], majors, extra); }
var rev = line('revenue', null, 'income'); rev.children = REV_PARTS.map(function (c) { return line(c, null, 'income-part'); });
var costs = COSTS.map(function (c) { var l = lineOf(c.id, c.cols, 'cost'); l.major = c.major; l.items = items(c.majors, c.extra); return l; });
var margin = {
id: 'op_margin', kind: 'ratio',
cells: ms.map(function (m) { var r = row(m, store); return r && r.has_data ? val(r.revenue ? r.op_profit / r.revenue : null, mv(m, store, 'op_profit') + ' / ' + mv(m, store, 'revenue')) : val(null, 'ui:noData'); })
};
var profit = line('op_profit', null, 'total');
margin.total = val(isNum(profit.total.value) && revTotal ? profit.total.value / revTotal : null, yr('op_profit') + ' / ' + yr('revenue'));
return {
year: year, store: store, months: ms, hasData: ms.map(function (m) { return hasData(m, store); }),
revenue: rev, other: line('other_income', null, 'income'), costs: costs, opCost: line('op_cost', null, 'total'), profit: profit, margin: margin
};
}
function outside(store, month) {
var r = row(month, store), y = String(month).slice(0, 4);
return OUTSIDE.map(function (o) {
var yearVals = months(store).filter(function (m) { return m.slice(0, 4) === y; }).map(function (m) { return row(m, store)[o.id]; });
var ysum = sumVals(yearVals);
return {
id: o.id, personal: o.personal, month: r && r.has_data ? val(r[o.id], mv(month, store, o.id)) : val(null, 'ui:noData'),
year: val(ysum, ysum == null ? null : 'sum(monthly[' + y + '-*/' + store + '].' + o.id + ')')
};
});
}
function outsideOver(store, list) {
return OUTSIDE.map(function (o) { return { id: o.id, personal: o.personal, period: sumOver(store, list, [o.id]) }; });
}
function pnlPeriod(store, groups, itemYears) {
var all = []; groups.forEach(function (g) { g.months.forEach(function (m) { if (all.indexOf(m) < 0) all.push(m); }); });
all.sort();
var revTotal = sumOver(store, all, ['revenue']);
function lineP(id, cols, kind) {
cols = cols || [id];
var cells = groups.map(function (g) { return sumOver(store, g.months, cols); }), total = sumOver(store, all, cols);
return { id: id, kind: kind, cells: cells, total: total,
pct: val(id === 'revenue' || !isNum(total.value) || !revTotal.value ? null : total.value / revTotal.value, id === 'revenue' || !total.v || !revTotal.v ? null : '(' + total.v + ') / (' + revTotal.v + ')') };
}
var rev = lineP('revenue', null, 'income'); rev.children = REV_PARTS.map(function (c) { return lineP(c, null, 'income-part'); });
var costs = COSTS.map(function (c) { var l = lineP(c.id, c.cols, 'cost'); l.major = c.major; l.items = itemYears && itemYears.length ? itemsOver(store, itemYears, c.majors, c.extra) : [];
if (itemYears && itemYears.length > 1) l.items.forEach(function (it) { it.pct = val(isNum(it.amount.value) && revTotal.value ? it.amount.value / revTotal.value : null, it.amount.v && revTotal.v ? '(' + it.amount.v + ') / (' + revTotal.v + ')' : null); });
return l; });
var profit = lineP('op_profit', null, 'total');
var ratio = function (a, b) { return val(isNum(a.value) && b.value ? a.value / b.value : null, a.v && b.v ? '(' + a.v + ') / (' + b.v + ')' : null); };
var margin = { id: 'op_margin', kind: 'ratio', cells: groups.map(function (g, i) { return ratio(profit.cells[i], rev.cells[i]); }), total: ratio(profit.total, revTotal) };
return { store: store, groups: groups, months: all, revenue: rev, other: lineP('other_income', null, 'income'), costs: costs, opCost: lineP('op_cost', null, 'total'), profit: profit, margin: margin, hasItems: !!(itemYears && itemYears.length) };
}
var bankBy = {}; (snap.bankMonthly || []).forEach(function (r) { bankBy[r.month + '/' + r.store] = r; });
function bankPath(m, s, c) { return 'bankMonthly[' + m + '/' + s + '].' + c; }
function runsOf(list) {
var out = [];
list.slice().sort().forEach(function (m) { var last = out[out.length - 1]; if (last && addMonths(last[last.length - 1], 1) === m) last.push(m); else out.push([m]); });
return out;
}
function negV(x) { return val(isNum(x.value) ? -x.value : null, x.v ? '-(' + x.v + ')' : null); }
function addV(list) {
var have = list.filter(function (x) { return x && isNum(x.value) && x.v; });
return val(have.length ? sumVals(have.map(function (x) { return x.value; })) : null, have.length ? have.map(function (x) { return '(' + x.v + ')'; }).join(' + ') : null);
}
function subV(a, b) { return isNum(a.value) && isNum(b.value) && a.v && b.v ? val(a.value - b.value, '(' + a.v + ') - (' + b.v + ')') : a; }
var FLOW_USES = ['taxes', 'tax_arrears', 'loan', 'kiwoom', 'owner_transfer', 'family_transfer', 'personal_out', 'personal_tax', 'supplier', 'other_out'];
function cashFlow(store, list, debtCols, opts) {
var bankFood = !!(opts && opts.bankFood), merge = !!(opts && opts.mergePersonal);
var ms = (list || []).filter(function (m) { return hasData(m, store); }).sort();
if (!ms.length) return null;
var stores = store === 'all' ? ['2ho', 'eungam'] : [store];
var hasBank = ms.every(function (m) { return stores.every(function (s) { return !!bankBy[m + '/' + s]; }); });
var sumBank = function (col) {
var vals = [], paths = [];
ms.forEach(function (m) { stores.forEach(function (s) { var r = bankBy[m + '/' + s]; if (r && isNum(r[col])) { vals.push(r[col]); paths.push(bankPath(m, s, col)); } }); });
return val(vals.length ? sumVals(vals) : null, paths.length ? plus(paths) : null);
};
var earned = sumOver(store, ms, ['op_profit']);
if (bankFood && adjOn) earned = addV([earned, adjSum(store, ms, ['d_food'])]);
var fin = sumOver(store, ms, ['finance_out']);
var hasLoanP = hasBank && ms.every(function (m) { return stores.every(function (s) { return isNum(bankBy[m + '/' + s].loan_p); }); });
var loanP = hasLoanP ? sumBank('loan_p') : val(null, null);
var hasKw = hasBank && ms.every(function (m) { return stores.every(function (s) { var b = bankBy[m + '/' + s]; return isNum(b.kw_o) && isNum(b.kw_f); }); });
var kwO = hasKw ? sumBank('kw_o') : val(null, null), kwF = hasKw ? sumBank('kw_f') : val(null, null);
var hasPtax = hasBank && ms.every(function (m) { return stores.every(function (s) { return isNum(bankBy[m + '/' + s].ptax); }); });
var ptax = hasPtax ? sumBank('ptax') : val(null, null);
var hasTaxX = hasBank && ms.every(function (m) { return stores.every(function (s) { return isNum(bankBy[m + '/' + s].tax_x); }); });
var uses = [];
if (adjOn) {
var tax = sumOver(store, ms, ['taxes']), taxX = hasTaxX ? sumBank('tax_x') : null;
uses.push({ id: 'taxes', x: taxX ? subV(tax, taxX) : tax });
if (taxX) uses.push({ id: 'tax_arrears', x: taxX });
}
uses.push({ id: 'loan', x: fin, parts: { personal: hasLoanP ? loanP : val(null, null) } });
if (hasKw) uses.push({ id: 'kiwoom', x: addV([kwO, kwF]), parts: { owner: kwO, family: kwF } });
var own = sumOver(store, ms, ['owner_transfer']), fam = sumOver(store, ms, ['family_transfer']);
if (hasKw) { own = subV(own, kwO); fam = subV(fam, kwF); }
if (hasPtax) own = subV(own, ptax);
if (merge) uses.push({ id: 'personal_out', x: addV([own, fam]) });
else { uses.push({ id: 'owner_transfer', x: own }); uses.push({ id: 'family_transfer', x: fam }); }
if (hasPtax) uses.push({ id: 'personal_tax', x: ptax });
if (adjOn && !bankFood) uses.push({ id: 'supplier', x: negV(adjSum(store, ms, ['d_food'])) });
var oth = [sumOver(store, ms, ['internal_net'])];
if (hasBank) { oth.push(sumBank('other')); if (store !== 'all') oth.push(sumBank('xfer')); }
uses.push({ id: 'other_out', x: negV(addV(oth)), parts: { internal: oth[0], other: hasBank ? oth[1] : val(null, null), xfer: hasBank && store !== 'all' ? oth[2] : val(null, null) } });
var usedTotal = addV(uses.map(function (u) { return u.x; }));
var left = subV(earned, usedTotal);
var bank = null, runs = runsOf(ms);
if (hasBank) {
var dv = [], dp = [];
runs.forEach(function (run) { var a = run[0], b = run[run.length - 1]; stores.forEach(function (s) { dv.push(bankBy[b + '/' + s].close - bankBy[a + '/' + s].open); dp.push(bankPath(b, s, 'close') + ' - ' + bankPath(a, s, 'open')); }); });
bank = { change: val(sumVals(dv), dp.join(' + ')), runs: runs.length };
if (runs.length === 1) {
var a0 = runs[0][0], b0 = runs[0][runs[0].length - 1];
bank.from = a0; bank.to = b0;
bank.start = val(sumVals(stores.map(function (s) { return bankBy[a0 + '/' + s].open; })), plus(stores.map(function (s) { return bankPath(a0, s, 'open'); })));
bank.end = val(sumVals(stores.map(function (s) { return bankBy[b0 + '/' + s].close; })), plus(stores.map(function (s) { return bankPath(b0, s, 'close'); })));
}
}
var diff = bank && isNum(left.value) && isNum(bank.change.value) ? val(bank.change.value - left.value, '(' + bank.change.v + ') - (' + left.v + ')') : val(null, null);
var shift = adjOn ? adjSum(store, ms, ['d_labor', 'd_rent', 'd_family']) : val(null, null);
var debt = null;
if (!adjOn && debtCols && debtCols.length) {
var cv = [], cp = [], okD = true;
runs.forEach(function (run) {
var c = compareCols(debtCols, run[run.length - 1], addMonths(run[0], -1));
if (c.both.length !== debtCols.length || !isNum(c.change.value)) { okD = false; return; }
cv.push(c.change.value); cp.push('(' + c.change.v + ')');
});
if (okD && cv.length) debt = { change: val(sumVals(cv), cp.join(' + ')), cols: debtCols.slice() };
}
return { months: ms, store: store, adjusted: adjOn, bankFood: bankFood, earned: earned, uses: uses, usedTotal: usedTotal, left: left, bank: bank, diff: diff, shift: shift, debt: debt, hasBank: hasBank, hasLoanP: hasLoanP, hasKw: hasKw, hasPtax: hasPtax, hasTaxX: hasTaxX };
}
function foodBasisOf(month, supplier) { var f = (snap.foodBasis || []).filter(function (x) { return x.month === month && x.supplier === supplier; })[0]; return f ? f.basis : null; }
function foodDiff(supplier, list) {
var vals = [], paths = [];
(snap.foodBasis || []).forEach(function (f) {
if (f.supplier !== supplier || f.basis !== 'S' || (list || []).indexOf(f.month) < 0 || !isNum(f.paid) || !isNum(f.buy)) return;
var k = 'foodBasis[' + f.month + '/' + f.supplier + '].';
vals.push(f.paid - f.buy); paths.push('(' + k + 'paid - ' + k + 'buy)');
});
return vals.length ? val(sumVals(vals), plus(paths)) : val(0, 'ui:zero');
}
function bcGaps(store, list) {
var stores = store === 'all' ? ['2ho', 'eungam'] : [store], out = [];
var inList = list ? function (m) { return list.indexOf(m) >= 0; } : function () { return true; };
stores.forEach(function (s) {
var rows = (snap.bankMonthly || []).filter(function (r) { return r.store === s && isNum(r.bc); }).sort(function (a, b) { return a.month < b.month ? -1 : 1; });
var seen = false, cur = null;
rows.forEach(function (r, i) {
var gap = seen && r.bc === 0 && r.n > 0 && hasData(r.month, s);
if (r.bc > 0) seen = true;
if (gap) {
if (!cur) {
var before = rows.slice(0, i).filter(function (x) { return x.bc > 0; }).slice(-6);
cur = { store: s, months: [], usual: val(before.length ? Math.round(sumVals(before.map(function (x) { return x.bc; })) / before.length) : null, before.length ? 'round((' + before.map(function (x) { return bankPath(x.month, s, 'bc'); }).join(' + ') + ') / ' + before.length + ')' : null),
usualFrom: before.length ? before[0].month : null, usualTo: before.length ? before[before.length - 1].month : null, usualN: before.length };
out.push(cur);
}
cur.months.push(r.month);
} else cur = null;
});
});
return out.map(function (g) { g.from = g.months[0]; g.to = g.months[g.months.length - 1]; g.shown = g.months.filter(inList); return g; }).filter(function (g) { return g.shown.length; });
}
function taxRepay(store, months) {
var stores = store === 'all' ? ['2ho', 'eungam'] : [store];
var kinds = [], seen = {};
(snap.taxPaid || []).forEach(function (t) { if (months.indexOf(t.month) >= 0 && stores.indexOf(t.store) >= 0 && !seen[t.kind]) { seen[t.kind] = true; kinds.push(t.kind); } });
kinds.sort(function (a, b) { var o = ['국세', '지방세']; var ia = o.indexOf(a), ib = o.indexOf(b); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib) || (a < b ? -1 : 1); });
var byKind = !!(snap.taxPaid && snap.taxPaid.length);
var cols = stores.map(function (s) { return s === '2ho' ? 'tax_2ho' : 'tax_eungam'; });
return { kinds: byKind ? kinds : ['세금'], byKind: byKind, rows: months.map(function (m) {
var has = hasData(m, store);
var ks = byKind ? kinds.map(function (k) {
var vals = [], paths = [];
(snap.taxPaid || []).forEach(function (t) { if (t.month === m && t.kind === k && stores.indexOf(t.store) >= 0) { vals.push(t.amount); paths.push('taxPaid[' + m + '/' + t.store + '/' + k + '].amount'); } });
return has ? val(vals.length ? sumVals(vals) : 0, paths.length ? plus(paths) : 'ui:zero') : val(null, null);
}) : [has ? sumOver(store, [m], ['taxes']) : val(null, null)];
var rem = cols.map(function (c) { return debtCell(m, c); }), remOk = rem.every(function (x) { return isNum(x.value); });
return { month: m, hasData: has, kinds: ks, paid: has ? sumOver(store, [m], ['taxes']) : val(null, null),
remaining: remOk ? val(sumVals(rem.map(function (x) { return x.value; })), plus(rem.map(function (x) { return x.v; }))) : val(null, null) };
}) };
}
function taxRepayMonths() {
var ms = dmMonths.filter(function (m) { return (!debtMonth || m <= debtMonth) && isNum(dmv(m, 'tax_2ho')) && isNum(dmv(m, 'tax_eungam')); });
return ms;
}
function taxPayList() {
var out = [], cur = null;
(snap.taxPays || []).forEach(function (r) {
var m = String(r.date).slice(0, 7), key = r.date + '/' + r.store + '/' + r.seq;
if (!cur || cur.month !== m) { cur = { month: m, rows: [] }; out.push(cur); }
cur.rows.push({ date: r.date, store: r.store, kind: r.kind, amount: val(r.amount, 'taxPays[' + key + '].amount') });
});
out.forEach(function (g) { g.total = val(sumVals(g.rows.map(function (x) { return x.amount.value; })), plus(g.rows.map(function (x) { return x.amount.v; }))); });
return out;
}
var SUP_ORDER = ['nain', 'taejo', 'hyunjin', 'bethel'], supCache = {};
function supOpen(id) { return (snap.supOpen || []).filter(function (o) { return o.supplier === id; })[0] || null; }
function supIds() { return SUP_ORDER.filter(function (id) { var o = supOpen(id); return !!(o && o.last_date); }); }
function supDays(id) {
if (!supCache[id]) supCache[id] = (snap.supDaily || []).filter(function (r) { return r.supplier === id; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
return supCache[id];
}
var rqBy = {}; (snap.reviewText || []).forEach(function (q) { rqBy[q.id] = q; });
function reviewTextOf(id) { return rqBy[id] || null; }
function supGaps(id) { return (snap.supGaps || []).filter(function (g) { return g.supplier === id; }); }
function supMonths(id) { var seen = {}, out = []; supDays(id).forEach(function (r) { var m = r.date.slice(0, 7); if (!seen[m]) { seen[m] = 1; out.push(m); } }); return out; }
function supBalAt(id, m) {
var all = supDays(id);
for (var i = all.length - 1; i >= 0; i--) if (all[i].date.slice(0, 7) <= m && isNum(all[i].bal)) return val(all[i].bal, 'supDaily[' + id + '/' + all[i].date + '].bal');
var o = supOpen(id);
return o && isNum(o.bal) ? val(o.bal, 'supOpen[' + id + '].bal') : val(null, null);
}
function supMonth(id, m) {
var rows = supDays(id).filter(function (r) { return r.date.slice(0, 7) === m; });
var sum = function (f) { var s = sumVals(rows.map(function (r) { return r[f]; })); return val(s, s == null ? null : 'sum(supDaily[' + id + '/' + m + '-*].' + f + ')'); };
return { month: m, rows: rows, buy: sum('buy'), b2: sum('b2'), be: sum('be'), bc: sum('bc'), adj: sum('adj'), fix: sum('fix'), paid: sum('paid'),
nPaid: rows.filter(function (r) { return isNum(r.paid) && r.paid; }).length, nBuy: rows.filter(function (r) { return isNum(r.buy) && r.buy; }).length,
start: supBalAt(id, addMonths(m, -1)), end: supBalAt(id, m) };
}
function itemList(id) { return (snap.itemSummary || []).filter(function (r) { return r.supplier === id; }).slice().sort(function (a, b) { return (b.amount || 0) - (a.amount || 0); }); }
function itemMonthly(id, item) { return (snap.itemMonthly || []).filter(function (r) { return r.supplier === id && r.item === item; }).slice().sort(function (a, b) { return a.month < b.month ? -1 : a.month > b.month ? 1 : 0; }); }
function adjSum(store, list, cols) {
var vals = [], paths = [];
(list || []).forEach(function (m) { var a = adjBy[m + '/' + store]; if (!a) return; cols.forEach(function (c) { if (isNum(a[c])) { vals.push(a[c]); paths.push('pnlAdj[' + m + '/' + store + '].' + c); } }); });
return val(vals.length ? sumVals(vals) : null, paths.length ? plus(paths) : null);
}
function taxTable(store, period) {
var stores = store === 'all' ? ['2ho', 'eungam'] : [store];
var list = Array.isArray(period) ? period.filter(function (m) { return hasData(m, store); }) : months(store).filter(function (m) { return m.slice(0, 4) === String(period); });
var kinds = [], seen = {};
(snap.taxPaid || []).forEach(function (t) { if (list.indexOf(t.month) >= 0 && stores.indexOf(t.store) >= 0 && !seen[t.kind]) { seen[t.kind] = true; kinds.push(t.kind); } });
kinds.sort(function (a, b) { var o = ['국세', '지방세']; var ia = o.indexOf(a), ib = o.indexOf(b); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib) || (a < b ? -1 : 1); });
var tm = {}; (snap.taxMonthly || []).forEach(function (r) { tm[r.month + '/' + r.store] = r; });
var rows = list.map(function (m) {
var by = kinds.map(function (k) {
var vals = [], paths = [];
(snap.taxPaid || []).forEach(function (t) { if (t.month === m && t.kind === k && stores.indexOf(t.store) >= 0) { vals.push(t.amount); paths.push('taxPaid[' + m + '/' + t.store + '/' + k + '].amount'); } });
return val(vals.length ? sumVals(vals) : 0, paths.length ? plus(paths) : 'ui:zero');
});
var total = sumOver(store, [m], ['taxes']);
var rem = stores.every(function (s) { return tm[m + '/' + s]; }) ? val(sumVals(stores.map(function (s) { return tm[m + '/' + s].remaining; })), plus(stores.map(function (s) { return 'taxMonthly[' + m + '/' + s + '].remaining'; }))) : val(null, null);
return { month: m, kinds: by, total: total, remaining: rem };
});
var tot = sumOver(store, rows.map(function (r) { return r.month; }), ['taxes']);
return { kinds: kinds, rows: rows, total: tot, hasRemaining: rows.some(function (r) { return isNum(r.remaining.value); }) };
}
function foodBank(month) {
return (snap.foodBasis || []).filter(function (f) { return f.month === month && f.basis === 'B' && (f.paid || f.buy); }).map(function (f) { return f.supplier; });
}
function hasHalf(stores, monthList, cols) {
cols = cols || S.WON_MONTHLY;
return stores.some(function (s) {
return monthList.some(function (m) { var r = row(m, s); return r && r.has_data && cols.some(function (c) { return isNum(r[c]) && Math.round(r[c]) !== r[c]; }); });
});
}
function revenueMix(store, month) {
var r = row(month, store);
if (!r || !r.has_data) return [];
return REV_PARTS.map(function (c) { return { id: c, value: r[c], v: mv(month, store, c), share: r.revenue ? r[c] / r.revenue : null, shareV: mv(month, store, c) + ' / ' + mv(month, store, 'revenue') }; });
}
function supplierMonth(month, supplier) {
var all = snap.supplierRecent || [];
var rows = all.filter(function (r) { return String(r.date).slice(0, 7) === month && (!supplier || r.supplier === supplier); });
if (!rows.length) return null;
var dates = all.map(function (r) { return String(r.date); }).sort(), mine = rows.map(function (r) { return String(r.date); }).sort();
var pat = (supplier || '*') + '/' + month + '-*';
var buy = sumVals(rows.map(function (r) { return r.buy_total; })), paid = sumVals(rows.map(function (r) { return r.paid; }));
return {
month: month, from: mine[0], to: mine[mine.length - 1], covered: dates[0] <= month + '-01', count: Array.from(new Set(rows.map(function (r) { return r.supplier; }))).length,
buy: val(buy, buy == null ? null : 'sum(supplierRecent[' + pat + '].buy_total)'), paid: val(paid, paid == null ? null : 'sum(supplierRecent[' + pat + '].paid)')
};
}
var UT = null;
var REF_PLACES = VC.UTIL_REF_PLACES || ['개인'];
function billOf(b) {
if (b.n_bank != null) return b;
var n = b.n || 0, paid = b.paid_n || 0;
return Object.assign({}, b, { amount: b.amount != null ? b.amount : b.billed, n_bank: paid, n_check: Math.max(0, n - paid), n_auto: 0, n_unpaid: 0, n_hold: 0, autopay: b.autopay || b.hl_autopay || null, _old: true });
}
function utilIndex() {
if (UT) return UT;
var rows = snap.utilities || [], bills = (snap.utilBills || []).map(billOf), em = snap.extMeta || {};
var U = {}, B = {}, order = {}, places = [], itemsOf = {}, photo = {};
var addPI = function (p, i) {
if (!p || !i) return;
if (!itemsOf[p]) { itemsOf[p] = []; places.push(p); }
if (itemsOf[p].indexOf(i) < 0) itemsOf[p].push(i);
};
rows.forEach(function (r) { U[r.month + '/' + r.place + '/' + r.item] = r; });
bills.forEach(function (b) { B[b.place + '/' + b.item + '/' + b.month] = b; photo[b.place + '/' + b.item] = true; addPI(b.place, b.item); });
var hasBills = bills.length > 0;
if (!hasBills) rows.forEach(function (r) { if (isNum(r.paid_bank) || isNum(r.owner_record) || isNum(r.billed) || r.status === '빠짐?') addPI(r.place, r.item); });
places.forEach(function (p, i) { order[p] = placeRank(p) >= 0 ? placeRank(p) : 100 + i; });
places.sort(function (a, b) { return order[a] - order[b]; });
var uMonths = Array.from(new Set(rows.map(function (r) { return r.month; }).filter(Boolean))).sort();
UT = { U: U, B: B, bills: bills, photo: photo, places: places, itemsOf: itemsOf, hasBills: hasBills, lastBankMonth: uMonths[uMonths.length - 1] || null, uMonths: uMonths,
cutoff: em.util_cutoff || null, bankAsOf: em.bank_asof || asOf, billsLast: em.bills_last || meta.bills_last || null, billsSource: em.bills_source || (bills.length ? 'store' : 'none'), hasExt: !!snap.extMeta,
held: isNum(em.bills_held) ? em.bills_held : null, skipped: isNum(em.bills_skipped) ? em.bills_skipped : null, oldBills: bills.some(function (b) { return b._old; }) };
return UT;
}
function utilCell(place, item, month) {
var I = utilIndex(), u = I.U[month + '/' + place + '/' + item] || null, b = I.B[place + '/' + item + '/' + month] || null;
var up = function (c) { return 'utilities[' + month + '/' + place + '/' + item + '].' + c; };
var bp = function (c) { return 'utilBills[' + place + '/' + item + '/' + month + '].' + c; };
var bank = u && isNum(u.paid_bank) && u.paid_bank > 0 ? val(u.paid_bank, up('paid_bank')) : null;
var record = u && isNum(u.owner_record) ? val(u.owner_record, up('owner_record')) : null;
var base = { place: place, item: item, month: month, bank: bank, record: record, status: u ? u.status : null };
if (b) {
var kind = b.n_bank >= b.n ? 'paid' : b.n_bank > 0 ? 'part' : b.n_unpaid > 0 ? 'unpaid' : b.n_check > 0 ? 'check' : 'auto';
var amount = isNum(b.amount) ? val(b.amount, b._old ? bp('billed') : bp('amount')) : null;
return Object.assign(base, { photo: true, kind: kind, amount: amount, bill: b, n: b.n, hold: b.n_hold > 0, auto: b.autopay === 'Y',
diff: !!(bank && amount && (kind === 'paid' || kind === 'part') && Math.abs(bank.value - amount.value) >= 1) });
}
if (bank) return Object.assign(base, { photo: false, kind: I.hasBills ? 'nophoto' : 'bank', amount: bank, diff: !!(record && Math.abs(record.value - bank.value) >= 1) });
if (record) return Object.assign(base, { photo: false, kind: 'record', amount: record });
if (u && isNum(u.billed)) return Object.assign(base, { photo: false, kind: 'xlbill', amount: val(u.billed, up('billed')) });
return Object.assign(base, { photo: false, kind: u && u.status === '빠짐?' ? 'missing' : 'none', amount: null });
}
function utilGrid(place) {
var I = utilIndex(), items = I.itemsOf[place] || [], ms = {};
items.forEach(function (it) {
I.bills.forEach(function (b) { if (b.place === place && b.item === it) ms[b.month] = true; });
I.uMonths.forEach(function (m) { var u = I.U[m + '/' + place + '/' + it]; if (u && (isNum(u.paid_bank) || isNum(u.owner_record) || isNum(u.billed) || u.status === '빠짐?')) ms[m] = true; });
});
var months = Object.keys(ms).sort().reverse();
var list = items.map(function (item) {
var cells = months.map(function (m) { return utilCell(place, item, m); });
return { item: item, cells: cells, any: cells.some(function (c) { return c.kind !== 'none'; }) };
}).filter(function (x) { return x.any; });
return { place: place, months: months, items: list };
}
function utilPlaces() { var I = utilIndex(); return I.places.filter(function (p) { return utilGrid(p).items.length > 0; }); }
function utilBankOnly() {
var I = utilIndex();
if (!I.hasBills) return [];
var by = {}, out = [];
(snap.utilities || []).forEach(function (u) {
if (I.photo[u.place + '/' + u.item] || !(isNum(u.paid_bank) && u.paid_bank > 0)) return;
var k = u.place + '/' + u.item, g = by[k];
if (!g) { g = by[k] = { place: u.place, item: u.item, months: [], vals: [], paths: [] }; out.push(g); }
g.months.push(u.month); g.vals.push(u.paid_bank); g.paths.push('utilities[' + u.month + '/' + u.place + '/' + u.item + '].paid_bank');
});
var order = function (p) { var i = placeRank(p); return i < 0 ? 99 : i; };
return out.map(function (g) { g.months.sort(); return { place: g.place, item: g.item, n: g.months.length, first: g.months[0], last: g.months[g.months.length - 1], total: val(sumVals(g.vals), plus(g.paths)), ref: REF_PLACES.indexOf(g.place) >= 0 }; })
.sort(function (a, b) { return order(a.place) - order(b.place) || (b.total.value || 0) - (a.total.value || 0); });
}
var KIND_RANK = { unpaid: 0, check: 1, part: 2, auto: 3 };
function utilIssues() {
var I = utilIndex(), asOf2 = I.bankAsOf, later = [], groups = {}, open = [], ref = [];
I.bills.forEach(function (b) {
if (b.n_bank >= b.n) return;
var c = utilCell(b.place, b.item, b.month);
var e = { place: b.place, item: b.item, month: b.month, kind: c.kind, amount: c.amount, due: b.due || null, dueV: b.due ? 'utilBills[' + b.place + '/' + b.item + '/' + b.month + '].due' : null,
n: b.n, miss: b.n - b.n_bank, auto: b.autopay === 'Y', hold: b.n_hold > 0, days: b.due ? daysBetween(today, b.due) : null };
var isRef = REF_PLACES.indexOf(b.place) >= 0;
if (!isRef && e.due && asOf2 && e.due > asOf2) { later.push(e); return; }
var k = b.place + '/' + b.item, g = groups[k];
if (!g) { g = groups[k] = { place: b.place, item: b.item, ref: isRef, list: [] }; (isRef ? ref : open).push(g); }
g.list.push(e);
});
var fin = function (g) {
g.list.sort(function (a, b) { return a.month < b.month ? 1 : a.month > b.month ? -1 : 0; });
g.latest = g.list[0]; g.count = g.list.reduce(function (s, e) { return s + e.miss; }, 0);
g.first = g.list[g.list.length - 1].month; g.last = g.latest.month;
g.kind = g.list.map(function (e) { return e.kind; }).sort(function (a, b) { return KIND_RANK[a] - KIND_RANK[b]; })[0];
g.kinds = {}; g.list.forEach(function (e) { g.kinds[e.kind] = (g.kinds[e.kind] || 0) + e.miss; });
return g;
};
var order = function (p) { var i = placeRank(p); return i < 0 ? 99 : i; };
var byRank = function (a, b) { return KIND_RANK[a.kind] - KIND_RANK[b.kind] || String(b.latest.due || b.last).localeCompare(String(a.latest.due || a.last)) || order(a.place) - order(b.place); };
later.sort(function (a, b) { return String(a.due).localeCompare(String(b.due)) || order(a.place) - order(b.place); });
return { later: later, open: open.map(fin).sort(byRank), ref: ref.map(fin).sort(byRank), bankAsOf: asOf2 };
}
function util() { var I = utilIndex(); return { cutoff: I.cutoff, bankAsOf: I.bankAsOf, billsLast: I.billsLast, billsSource: I.billsSource, hasExt: I.hasExt, hasBills: I.hasBills, lastBankMonth: I.lastBankMonth, held: I.held, skipped: I.skipped, oldBills: I.oldBills, refPlaces: REF_PLACES.slice() }; }
var REF_NOTE = /집\s*\(?\s*2·3층|상암동|가게와 상관없|가게 비용(이)? 아닌|가게 비용 아님/;
function utilNotes() {
var list = notesFor('util', null, null).filter(function (n) { return n.scope === 'util'; });
var rank = { bad: 0, warn: 1, info: 2, good: 3 };
var main = list.filter(function (n) { return !REF_NOTE.test(n.text); }).sort(function (a, b) { return (rank[a.kind] != null ? rank[a.kind] : 2) - (rank[b.kind] != null ? rank[b.kind] : 2); });
return { main: main, ref: list.filter(function (n) { return REF_NOTE.test(n.text); }), all: list };
}
function notesFor(scope, period, store) {
return (snap.notes || []).filter(function (n) {
if (!n || !n.text) return false;
if (n.scope !== scope && n.scope !== 'all') return false;
if (n.store && store && n.store !== store) return false;
var p = n.period || '';
if (!p || !period) return true;
return p === period || (String(period).length === 7 && p === String(period).slice(0, 4));
}).sort(function (a, b) { return String(b.period || '').localeCompare(String(a.period || '')); });
}
return {
snap: snap, today: today, asOf: asOf, asOfMonth: asOfMonth, prevMonth: prevDebtMonth, labels: labels, label: label,
debtMonth: debtMonth, prevDebtMonth: prevDebtMonth, debtAsOf: debtAsOf,
storeLabel: storeLabel, placeCode: placeCode, row: row, hasData: hasData, months: months, allMonths: allMonths, latestMonth: latestMonth, years: years,
metric: metric, kpis: kpis, series: series,
debtTotal: debtTotal, taxPeriods: taxPeriods, compareCols: compareCols, cashFlow: cashFlow, debtNow: debtNow, debtSeries: debtSeries, debtMonths: debtMonths, excludedDebts: excludedDebts, lateColumns: lateColumns, debtGroups: debtGroups, findGroup: findGroup, composition: composition,
unknownDebts: unknownDebts, pace: pace, payoffWith: payoffWith, compareCols: compareCols,
tax: tax, reviewTypes: reviewTypes, reviewItems: reviewItems, reviewCount: reviewCount, checks: checks,
finding: finding, freshness: freshness, supplier: supplier, pnlTable: pnlTable, outside: outside, revenueMix: revenueMix, hasHalf: hasHalf,
sumOver: sumOver, metricOver: metricOver, yearMonths: yearMonths, sameMonthsLastYear: sameMonthsLastYear, kpisYear: kpisYear, kpisOver: kpisOver, outsideOver: outsideOver, pnlPeriod: pnlPeriod, revenueMixOver: revenueMixOver,
debtCell: debtCell, colName: colName, LEAF: LEAF, supplierMonth: supplierMonth,
util: util, utilGrid: utilGrid, utilPlaces: utilPlaces, utilIssues: utilIssues, utilBankOnly: utilBankOnly, utilNotes: utilNotes, utilCell: utilCell, notesFor: notesFor,
COST_ROWS: COST_ROWS, SHOWN_COSTS: COSTS, DRIVERS: DRIVERS_I, REV_PARTS: REV_PARTS, KPI_IDS: KPI_IDS, adjusted: adjOn, basis: adjOn ? 'adjusted' : 'bank', hasAdj: !!(snap.pnlAdj && snap.pnlAdj.length),
taxTable: taxTable, foodBank: foodBank, adjSum: adjSum, sumOverBank: sumOverBank, foodBasisOf: foodBasisOf, foodDiff: foodDiff, bcGaps: bcGaps, taxRepay: taxRepay, taxRepayMonths: taxRepayMonths, taxPayList: taxPayList, FLOW_USES: FLOW_USES,
reviewTextOf: reviewTextOf, supIds: supIds, supOpen: supOpen, supDays: supDays, supGaps: supGaps, supMonths: supMonths, supMonth: supMonth, supBalAt: supBalAt, supMeta: snap.supMeta || null,
itemList: itemList, itemMonthly: itemMonthly, itemMeta: snap.itemMeta || null,
splitHalf: !!(snap.adjMeta && snap.adjMeta.half_rows > 0 && snap.adjMeta.half_rows_h === snap.adjMeta.half_rows && snap.adjMeta.half_excel === true)
};
}
function debtHidden(g, cfg) {
var list = (cfg && cfg.hideEmpty) || [];
if (!g || !list.length || (list.indexOf(g.id) < 0 && list.indexOf(g.kind) < 0)) return false;
var v = g.current ? g.current.value : null;
return !isNum(v) || v === 0;
}
var calc = {
payoff: function (snap, n) { var p = create(snap).pace(Number(n) || 6); return p && p.payoff.value; },
groupPayoff: function (snap, id) { var g = create(snap).findGroup(id); return g && g.payoff.value; },
payoffWith: function (snap, amount, total) { var r = create(snap).payoffWith(Number(amount), Number(total)); return r && r.month; }
};
return { create: create, calc: calc, addMonths: addMonths, daysBetween: daysBetween, weekStart: weekStart, todayLocal: todayLocal, ym: ym, SHOWN_COSTS: SHOWN_COSTS, DRIVERS: DRIVERS, debtHidden: debtHidden };
});
(function (root, factory) {
if (typeof module === 'object' && module.exports) module.exports = factory(require('./ui/format-won.js'), require('./model.js'));
else { root.Ledger = root.Ledger || {}; root.Ledger.reasons = factory(root.Ledger.fmt, root.Ledger.model); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (F, Model) {
'use strict';
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
var addMonths = Model.addMonths;
function josa(word, pair) {
var w = String(word || ''), i = w.length - 1;
while (i >= 0 && !(w.charCodeAt(i) >= 0xac00 && w.charCodeAt(i) <= 0xd7a3)) i--;
var p = pair.split('/'), code = i >= 0 ? w.charCodeAt(i) - 0xac00 : -1, has = code >= 0 && code % 28 !== 0;
if (code < 0) has = /[013678LMNlmn]$/.test(w);
if (pair === '으로/로' && code >= 0 && code % 28 === 8) return w + '로';
return w + (has ? p[0] : p[1]);
}
function N(x, u, o) { return { n: { value: x ? x.value : null, v: x ? x.v : null }, u: u, o: o || null }; }
function absDiff(a, b) {
var d = a.value - b.value;
return { value: Math.abs(d), v: d >= 0 ? '(' + a.v + ') - (' + b.v + ')' : '(' + b.v + ') - (' + a.v + ')' };
}
function neg(x) { return { value: -x.value, v: '-(' + x.v + ')' }; }
function ok(x) { return x && isNum(x.value) && x.v; }
function refYear(M) { return Number(String(M.today).slice(0, 4)); }
function monthsLabel(list) {
if (!list.length) return '';
var a = Number(list[0].slice(5)), b = Number(list[list.length - 1].slice(5));
return list.length === b - a + 1 ? (a === b ? a + '월' : a + '~' + b + '월') : list.length + '달';
}
function compare(M, store, A, B) {
var a = M.sumOver(store, A, ['op_profit']), b = M.sumOver(store, B, ['op_profit']);
if (!ok(a) || !ok(b)) return null;
var d = a.value - b.value, dir = d > 0 ? 1 : d < 0 ? -1 : 0;
var drivers = M.DRIVERS.map(function (dr) {
var x = M.sumOver(store, A, dr.cols), y = M.sumOver(store, B, dr.cols);
if (!ok(x) || !ok(y)) return null;
return { id: dr.id, a: x, b: y, change: x.value - y.value, contrib: dr.sign * (x.value - y.value) };
}).filter(Boolean);
var top = dir ? drivers.filter(function (x) { return x.contrib * dir > 0; }).sort(function (p, q) { return Math.abs(q.contrib) - Math.abs(p.contrib) || (p.id < q.id ? -1 : 1); })[0] || null : null;
return { a: a, b: b, d: d, top: top };
}
function changeSentence(M, prefix, cmp, A, B) {
if (!cmp.d) return { kind: 'info', parts: [prefix.replace(/보다$/, '과') + ' 영업이익이 같아요.'], drill: { kind: 'lines', A: A } };
var up = cmp.d > 0, parts = [prefix + ' 영업이익이 ', N(absDiff(cmp.a, cmp.b), 'man'), up ? ' 늘었어요.' : ' 줄었어요.'];
if (cmp.top) parts.push(' ' + josa(M.label(cmp.top.id), '이/가') + ' ', N(absDiff(cmp.top.a, cmp.top.b), 'man'), (cmp.top.change > 0 ? ' 늘어난' : ' 줄어든') + ' 영향이 가장 커요.');
return { kind: up ? 'good' : 'bad', parts: parts, drill: cmp.top ? { kind: 'pl', line: cmp.top.id, A: A, B: B, dir: cmp.top.change > 0 ? 1 : -1 } : { kind: 'lines', A: A } };
}
function resultSentence(subject, op, rev, mg) {
if (!ok(op)) return null;
if (op.value < 0) return { kind: 'bad', parts: [josa(subject, '은/는') + ' ', N(neg(op), 'man'), ' 적자예요. 영업비용이 매출보다 그만큼 많았어요.'] };
var parts = [subject + ' 영업이익은 ', N(op, 'man'), '이에요'];
if (ok(rev) && ok(mg)) parts.push('(매출 ', N(rev, 'man'), '의 ', N(mg, 'pct'), ')');
parts.push('.');
return { kind: op.value > 0 ? 'good' : 'info', parts: parts };
}
function withDrill(s, d) { if (s && !s.drill) s.drill = d; return s; }
function biggestCost(M, store, list) {
var rev = M.sumOver(store, list, ['revenue']);
if (!ok(rev) || !rev.value) return null;
var best = null;
M.SHOWN_COSTS.forEach(function (c) { var x = M.sumOver(store, list, c.cols); if (ok(x) && (!best || x.value > best.x.value)) best = { id: c.id, x: x }; });
if (!best || best.x.value <= 0) return null;
return { kind: 'info', parts: ['가장 큰 비용은 ' + josa(M.label(best.id), '으로/로') + ' 매출의 ', N({ value: best.x.value / rev.value, v: '(' + best.x.v + ') / (' + rev.v + ')' }, 'pct'), '예요.'], drill: { kind: 'pl', line: best.id, A: list } };
}
function buyVsPaid(M, store, month, label) {
if (store !== 'all') return null;
var sm = M.supplierMonth(month);
if (!sm || !sm.covered || !ok(sm.buy) || !ok(sm.paid)) return null;
var d = sm.buy.value - sm.paid.value;
var parts = [label + ' 거래처 ' + sm.count + '곳 명세표로 산 것은 ', N(sm.buy, 'man'), ', 보낸 돈은 ', N(sm.paid, 'man'), '이에요.'];
if (d > 0) parts.push(' 산 것이 ', N(absDiff(sm.buy, sm.paid), 'man'), ' 많아서 외상이 늘었어요.');
else if (d < 0) parts.push(' 보낸 돈이 ', N(absDiff(sm.paid, sm.buy), 'man'), ' 많아서 외상이 줄었어요(지난 외상을 갚은 돈도 통장 식재료비에 들어가요).');
return { kind: d > 0 ? 'warn' : 'info', parts: parts, drill: { kind: 'suppliers', month: month } };
}
function accrualSentence(M, store, month) {
var r = M.row(month, store);
if (!r || !r.has_data || !r.accrual_complete || !isNum(r.food_accrual) || !isNum(r.food) || !isNum(r.op_profit_accrual)) return null;
var mv = function (c) { return 'monthly[' + month + '/' + store + '].' + c; };
var a = { value: r.food, v: mv('food') }, b = { value: r.food_accrual, v: mv('food_accrual') }, d = r.food - r.food_accrual;
if (!d) return null;
return { kind: 'info', parts: ['식재료비는 통장에서 나간 돈이라 명세표로 산 것보다 ', N(absDiff(a, b), 'man'), d > 0 ? ' 더 나갔어요.' : ' 덜 나갔어요.', ' 산 것 기준 영업이익은 ', N({ value: r.op_profit_accrual, v: mv('op_profit_accrual') }, 'man'), '이에요.'], drill: { kind: 'pl', line: 'food', A: [month] } };
}
function pnlMonth(M, store, month) {
var r = M.row(month, store);
if (!r || !r.has_data) return [];
var ref = refYear(M), mlab = F.month(month, { refYear: ref }), subject = store === 'all' ? mlab : mlab + ' ' + M.storeLabel(store);
var out = [withDrill(resultSentence(subject, M.metric(month, store, 'op_profit'), M.metric(month, store, 'revenue'), M.metric(month, store, 'op_margin')), { kind: 'lines', A: [month] })];
var pm = addMonths(month, -1);
if (M.hasData(pm, store)) { var c1 = compare(M, store, [month], [pm]); if (c1) out.push(changeSentence(M, '지난달보다', c1, [month], [pm])); }
var ly = addMonths(month, -12);
if (M.hasData(ly, store)) { var c2 = compare(M, store, [month], [ly]); if (c2) out.push(changeSentence(M, '작년 ' + Number(month.slice(5)) + '월보다', c2, [month], [ly])); }
out.push(buyVsPaid(M, store, month, mlab) || accrualSentence(M, store, month) || biggestCost(M, store, [month]));
return out.filter(Boolean).slice(0, 4);
}
function pnlYear(M, store, year) {
var ms = M.yearMonths(store, year);
if (!ms.length) return [];
var K = M.kpisYear(store, year), label = year + '년' + (ms.length < 12 ? '(' + monthsLabel(ms) + ')' : '');
var subject = store === 'all' ? label : label + ' ' + M.storeLabel(store);
var out = [withDrill(resultSentence(subject, K.op_profit, K.revenue, K.op_margin), { kind: 'lines', A: ms })];
if (K.sameMonths.length) {
var prev = K.sameMonths.map(function (m) { return addMonths(m, -12); });
var c = compare(M, store, K.sameMonths, prev);
if (c) out.push(changeSentence(M, K.sameMonths.length === 12 ? '작년보다' : '작년 같은 기간(' + monthsLabel(K.sameMonths) + ')보다', c, K.sameMonths, prev));
}
out.push(biggestCost(M, store, ms));
var stores = store === 'all' ? ['2ho', 'eungam'] : [store], loss = [];
stores.forEach(function (s) {
var lm = M.yearMonths(s, year).filter(function (m) { var x = M.row(m, s); return x && isNum(x.op_profit) && x.op_profit < 0; });
if (lm.length) loss.push(josa(M.storeLabel(s), '은/는') + ' ' + lm.map(function (m) { return Number(m.slice(5)) + '월'; }).join('·') + '에 적자였어요.');
});
if (loss.length) out.push({ kind: 'bad', parts: [loss.join(' ')], drill: { kind: 'months', A: ms } });
else out.push({ kind: 'good', parts: [(store === 'all' ? '두 가게 모두 ' : josa(M.storeLabel(store), '은/는') + ' ') + '자료 있는 ', N({ value: ms.length, v: 'ui:months' }, 'count', { word: '달' }), ' 내내 흑자예요.'], drill: { kind: 'months', A: ms } });
return out.filter(Boolean).slice(0, 4);
}
function pnlOver(M, store, list, label) {
var ms = (list || []).filter(function (m) { return M.hasData(m, store); });
if (!ms.length) return [];
var K = M.kpisOver(store, ms), subject = store === 'all' ? label : label + ' ' + M.storeLabel(store);
var out = [withDrill(resultSentence(subject, K.op_profit, K.revenue, K.op_margin), { kind: 'lines', A: ms })];
if (K.sameMonths.length) {
var prev = K.sameMonths.map(function (m) { return addMonths(m, -12); });
var c = compare(M, store, K.sameMonths, prev);
if (c) out.push(changeSentence(M, K.sameMonths.length === ms.length ? '작년 같은 달보다' : '작년 같은 달(' + K.sameMonths.length + '달)끼리 보면 작년보다', c, K.sameMonths, prev));
}
out.push(biggestCost(M, store, ms));
var multiYear = new Set(ms.map(function (m) { return m.slice(0, 4); })).size > 1;
var stores = store === 'all' ? ['2ho', 'eungam'] : [store], loss = [];
stores.forEach(function (s) {
var lm = ms.filter(function (m) { var x = M.row(m, s); return x && x.has_data && isNum(x.op_profit) && x.op_profit < 0; });
if (lm.length) loss.push(josa(M.storeLabel(s), '은/는') + ' ' + lm.map(function (m) { return multiYear ? F.month(m, { year: true }) : Number(m.slice(5)) + '월'; }).join('·') + '에 적자였어요.');
});
if (loss.length) out.push({ kind: 'bad', parts: [loss.join(' ')], drill: { kind: 'months', A: ms } });
else out.push({ kind: 'good', parts: [(store === 'all' ? '두 가게 모두 ' : josa(M.storeLabel(store), '은/는') + ' ') + '고른 ', N({ value: ms.length, v: 'ui:months' }, 'count', { word: '달' }), ' 내내 흑자예요.'], drill: { kind: 'months', A: ms } });
return out.filter(Boolean).slice(0, 4);
}
function debts(M) {
var out = [], now = M.debtNow(), ref = refYear(M);
if (now.prevMonth && isNum(now.change.value)) {
var since = F.month(now.prevMonth, { refYear: ref }) + ' 말보다', ch = now.change.value;
var parts = ch ? [since + ' ', N(ch < 0 ? neg(now.change) : now.change, 'man'), ch < 0 ? ' 줄었어요(같은 항목끼리).' : ' 늘었어요(같은 항목끼리).'] : [since.replace(/보다$/, '과') + ' 같아요(같은 항목끼리).'];
var movers = (now.compared || []).map(function (c) { var a = M.debtCell(now.month, c), b = M.debtCell(now.prevMonth, c); return { c: c, a: a, b: b, d: a.value - b.value }; })
.filter(function (x) { return x.d; }).sort(function (p, q) { return Math.abs(q.d) - Math.abs(p.d) || (p.c < q.c ? -1 : 1); });
if (movers.length) { var t = movers[0]; parts.push(' ' + josa(M.colName(t.c), '이/가') + ' ', N(absDiff(t.a, t.b), 'man'), t.d < 0 ? ' 줄어든 게 가장 커요.' : ' 늘어난 게 가장 커요.'); }
out.push({ kind: ch < 0 ? 'good' : ch > 0 ? 'bad' : 'info', parts: parts, drill: { kind: 'debtCols', month: now.month, prev: now.prevMonth } });
}
var sm = M.supplierMonth(now.month);
if (sm && ok(sm.buy) && ok(sm.paid)) {
var d = sm.buy.value - sm.paid.value, p2 = [F.date(sm.from, { refYear: ref }) + '부터 ' + F.date(sm.to, { refYear: ref }) + '까지 거래처 ' + sm.count + '곳에서 명세표로 ', N(sm.buy, 'man'), ' 사고 ', N(sm.paid, 'man'), ' 보냈어요.'];
if (d > 0) p2.push(' 산 것이 ', N(absDiff(sm.buy, sm.paid), 'man'), ' 많아서 외상이 늘었어요.');
else if (d < 0) p2.push(' 보낸 돈이 ', N(absDiff(sm.paid, sm.buy), 'man'), ' 많아서 외상이 줄었어요.');
out.push({ kind: d > 0 ? 'bad' : d < 0 ? 'good' : 'info', parts: p2, drill: { kind: 'suppliers', month: now.month } });
}
if (now.excluded && now.excluded.length && ok(now.total) && ok(now.prevTotal) && isNum(now.change.value) && now.total.value - now.prevTotal.value !== now.change.value) {
var td = now.total.value - now.prevTotal.value;
out.push({ kind: 'info', parts: ['합계로는 ', N(absDiff(now.total, now.prevTotal), 'man'), td >= 0 ? ' 늘었어요. ' : ' 줄었어요. ', josa(now.excluded.join('·'), '이/가') + ' ' + F.month(now.month, { refYear: ref }) + '부터 합계에 들어갔기 때문이에요.'], drill: { kind: 'debtCols', month: now.month, prev: now.prevMonth } });
}
var pace = M.pace(6);
if (pace && ok(pace.avg) && pace.avg.value) {
var pm6 = []; for (var k = 6; k >= 0; k--) pm6.push(addMonths(now.month, -k));
out.push(pace.avg.value > 0 ? { kind: 'good', parts: ['최근 6개월 평균으로는 한 달 ', N(pace.avg, 'man'), '씩 줄었어요.'], drill: { kind: 'pace', months: pm6 } }
: { kind: 'bad', parts: ['최근 6개월 평균으로는 한 달 ', N(neg(pace.avg), 'man'), '씩 늘었어요.'], drill: { kind: 'pace', months: pm6 } });
}
return out.slice(0, 4);
}
function toText(s) {
return s.parts.map(function (p) {
if (typeof p === 'string') return p;
var v = p.n.value, u = p.u, o = p.o || {};
if (u === 'man') return F.man(v); if (u === 'won') return F.won(v); if (u === 'pct') return F.pct(v); if (u === 'count') return F.count(v, o.word);
return String(v);
}).join('');
}
return { pnlMonth: pnlMonth, pnlYear: pnlYear, pnlOver: pnlOver, debts: debts, toText: toText, josa: josa, compare: compare };
});
(function (root, factory) {
var api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root && typeof root === 'object') { root.Ledger = root.Ledger || {}; root.Ledger.tx = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
var PLUS = ['revenue', 'other_income', 'internal_net'];
var OUTSIDE = ['owner_transfer', 'family_transfer', 'finance_out', 'internal_net'];
var PERSONAL_LOAN = /개인 대출 상환/, SECURITIES = /증권/, TAX_ARREARS = /체납/, LOAN_P_NAME = '대출금 (개인)';
var PERSONAL_TAX = /개인 세금/;
function isPtax(r) { return r.line === 'owner_transfer' && PERSONAL_TAX.test(r.detail || ''); }
function isKiwoom(r) { return (r.line === 'owner_transfer' || r.line === 'family_transfer') && SECURITIES.test(r.detail || ''); }
var FLOW = {
taxes: function (r) { return r.line === 'taxes' && !TAX_ARREARS.test(r.detail); },
tax_arrears: function (r) { return r.line === 'taxes' && TAX_ARREARS.test(r.detail); },
loan: function (r) { return r.line === 'finance_out'; },
loan_personal: function (r) { return r.line === 'finance_out' && PERSONAL_LOAN.test(r.detail); },
finance_out: function (r) { return r.line === 'finance_out'; },
kiwoom: isKiwoom,
personal_tax: isPtax,
owner_transfer: function (r) { return r.line === 'owner_transfer' && !isKiwoom(r) && !isPtax(r); },
family_transfer: function (r) { return r.line === 'family_transfer' && !isKiwoom(r); },
personal_out: function (r) { return (r.line === 'owner_transfer' || r.line === 'family_transfer') && !isKiwoom(r) && !isPtax(r); },
supplier: function (r) { return r.line === 'food' && !!r.sup; },
other_out: function (r) { return r.line === 'internal_net' || !r.line; }
};
var LINES = ['revenue', 'other_income', 'food', 'labor', 'rent_fixed', 'utilities', 'delivery_fees', 'taxes', 'opex', 'finance_out', 'owner_transfer', 'family_transfer', 'internal_net'];
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function shareOf(split, store) {
if (store === '2ho') return split === 'a' ? 1 : split === 'h' ? 0.5 : 0;
if (store === 'eungam') return split === 'b' ? 1 : split === 'h' ? 0.5 : 0;
return 1;
}
function signOf(line) { return PLUS.indexOf(line) >= 0 ? 1 : -1; }
function rows(contents, opts) {
opts = opts || {};
var out = [], q = String(opts.q || '').trim().toLowerCase();
(contents || []).forEach(function (c) {
var t = c && (c.txm || c.txo);
if (!t || !Array.isArray(t.r)) return;
t.r.forEach(function (r) {
var k = t.k[r[3]] || ['', '', '', '', ''], line = k[4] || '';
if (opts.line && line !== opts.line) return;
var sup = k[5] || '';
var sh = shareOf(r[4], opts.store || 'all');
if (!sh) return;
var loanP = line === 'finance_out' && PERSONAL_LOAN.test(k[2] || '');
var row = { date: t.m + '-' + pad2(r[0]), month: t.m, name: r[1], raw: r[2], amount: signOf(line) * r[2] * sh, out: -r[2] * sh, share: sh, split: r[4],
major: k[0], item: k[1], detail: k[2], pl: k[3], line: line, inside: k[3] !== '손익밖', sup: sup,
cls: loanP ? LOAN_P_NAME : k[0] + ' › ' + k[1], what: loanP ? LOAN_P_NAME : k[1] + (k[2] ? ' · ' + k[2] : '') };
if (opts.flow && !(FLOW[opts.flow] && FLOW[opts.flow](row))) return;
if (opts.keep && !opts.keep(row)) return;
if (q && (row.name + ' ' + row.detail + ' ' + row.major + ' ' + row.item + ' ' + row.what).toLowerCase().indexOf(q) < 0) return;
out.push(row);
});
});
return out;
}
function sortRows(list, by) {
return list.slice().sort(by === 'date'
? function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : Math.abs(b.amount) - Math.abs(a.amount); }
: function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount) || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0); });
}
function total(list) { var s = 0; list.forEach(function (r) { s += r.amount; }); return { amount: s, count: list.length }; }
function flow(list) { var i = 0, o = 0; list.forEach(function (r) { var v = r.raw * r.share; if (v > 0) i += v; else o -= v; }); return { inflow: Math.round(i), outflow: Math.round(o), count: list.length }; }
function groupByName(list, by) {
var m = {}, out = [];
list.forEach(function (r) {
var g = m[r.name];
if (!g) { g = m[r.name] = { name: r.name, count: 0, amount: 0, classes: {}, splits: {}, last: r.date, first: r.date, inside: 0, outside: 0 }; out.push(g); }
g.count++; g.amount += r.amount;
var ck = r.cls || r.major + ' › ' + r.item; g.classes[ck] = (g.classes[ck] || 0) + 1;
g.splits[r.split] = true;
if (r.date > g.last) g.last = r.date; if (r.date < g.first) g.first = r.date;
if (r.inside) g.inside++; else g.outside++;
});
return out.sort(by === 'date'
? function (a, b) { return a.last < b.last ? 1 : a.last > b.last ? -1 : Math.abs(b.amount) - Math.abs(a.amount); }
: function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount) || (a.name < b.name ? -1 : 1); });
}
function groupByClass(list, by) {
var m = {}, out = [];
list.forEach(function (r) {
var key = r.what || r.item + (r.detail ? ' · ' + r.detail : '');
var g = m[key];
if (!g) { g = m[key] = { name: key, item: r.item, detail: r.detail, count: 0, amount: 0, last: r.date, first: r.date }; out.push(g); }
g.count++; g.amount += r.amount;
if (r.date > g.last) g.last = r.date; if (r.date < g.first) g.first = r.date;
});
return out.sort(by === 'date'
? function (a, b) { return a.last < b.last ? 1 : a.last > b.last ? -1 : Math.abs(b.amount) - Math.abs(a.amount); }
: function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount) || (a.name < b.name ? -1 : 1); });
}
function diffByName(listA, listB) {
var m = {}, out = [];
var add = function (list, key) {
list.forEach(function (r) {
var g = m[r.name];
if (!g) { g = m[r.name] = { name: r.name, a: 0, b: 0, na: 0, nb: 0 }; out.push(g); }
g[key] += r.amount; if (key === 'a') g.na++; else g.nb++;
});
};
add(listA, 'a'); add(listB || [], 'b');
out.forEach(function (g) { g.d = g.a - g.b; });
return out.sort(function (x, y) { return Math.abs(y.d) - Math.abs(x.d) || (x.name < y.name ? -1 : 1); });
}
function outTotal(list) { var s = 0; list.forEach(function (r) { s += r.out; }); return s; }
return { LINES: LINES, OUTSIDE: OUTSIDE, PLUS: PLUS, FLOW: FLOW, isKiwoom: isKiwoom, LOAN_P_NAME: LOAN_P_NAME, outTotal: outTotal, groupByClass: groupByClass, shareOf: shareOf, signOf: signOf, rows: rows, sortRows: sortRows, total: total, flow: flow, groupByName: groupByName, diffByName: diffByName };
});
(function (root, factory) {
var api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root && typeof root === 'object') { root.Ledger = root.Ledger || {}; root.Ledger.router = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
var STORES = ['all', '2ho', 'eungam'];
var SCREENS = ['overview', 'debts', 'sup', 'price', 'pnl', 'util', 'review', 'data', 'link'];
var TYPE_CODES = { '분류': 'class', '가게 나누기': 'split', '글씨': 'hand', '계산 안 맞음': 'calc', '빈칸': 'blank', '빠진 자료': 'missing', '재촬영': 'retake', '확인': 'check' };
var CODE_TYPES = {}; Object.keys(TYPE_CODES).forEach(function (k) { CODE_TYPES[TYPE_CODES[k]] = k; });
var SAFE = /^[A-Za-z0-9._~-]*$/;
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function routeOf(path, params) {
var seg = String(path || '/').split('/').filter(Boolean), screen = 'overview', arg = null;
if (seg[0] === 'debts' && seg[1]) { screen = 'debt-detail'; try { arg = decodeURIComponent(seg.slice(1).join('/')); } catch (e) { arg = seg.slice(1).join('/'); } }
else if (seg[0] === 'debts') screen = 'debts';
else if (seg[0] === 'pnl' || seg[0] === 'util' || seg[0] === 'review' || seg[0] === 'data' || seg[0] === 'sup' || seg[0] === 'price' || seg[0] === 'link') screen = seg[0];
else if (seg[0] === 'overview' && seg.length === 1) screen = 'overview';
else if (seg.length) screen = 'notfound';
var p = screen === 'overview' ? '/' : '/' + seg.join('/');
return { path: p, params: params, screen: screen, arg: arg };
}
function parse(hash) {
var h = String(hash || ''), body = h.charAt(0) === '#' ? h.slice(1) : h;
try { body = decodeURIComponent(body); } catch (e) { }
if (!body || body === '/') return routeOf('/', new URLSearchParams(''));
if (body.charAt(0) === '/') {
var i = body.indexOf('?');
return routeOf(i >= 0 ? body.slice(0, i) : body, new URLSearchParams(i >= 0 ? body.slice(i + 1) : ''));
}
var parts = body.split('~'), head = parts.shift(), dot = head.indexOf('.');
var screen = dot >= 0 ? head.slice(0, dot) : head, arg = dot >= 0 ? head.slice(dot + 1) : '';
var q = new URLSearchParams('');
parts.forEach(function (x) {
var k = x.charAt(0), v = x.slice(1);
if (!v) return;
if (k === 's') q.set('store', v);
else if (k === 'y') q.set('y', v);
else if (k === 'm') q.set('m', v);
else if (k === 'k') q.set('k', v);
else if (k === 't') q.set('type', CODE_TYPES[v] || v);
else if (k === 'p') q.set('place', v);
else if (k === 'b') q.set('basis', v);
else if (k === 'g') q.set('sup', v);
else if (k === 'd') q.set('day', v);
else if (k === 'c') q.set('chart', v);
});
if (SCREENS.indexOf(screen) < 0) return routeOf('/' + head, q);
return routeOf('/' + screen + (arg && screen === 'debts' ? '/' + arg : ''), q);
}
function build(path, params) {
var seg = String(path || '/').split('/').filter(Boolean);
var token = seg.length ? seg[0] : 'overview';
if (seg[0] === 'debts' && seg[1]) {
var id = seg.slice(1).join('/');
try { id = decodeURIComponent(id); } catch (e) { }
token += '.' + (SAFE.test(id) ? id : encodeURIComponent(id).replace(/[^A-Za-z0-9._~-]/g, '-'));
}
var p = params || {}, get = function (k) { return p && typeof p.get === 'function' ? p.get(k) : p[k]; };
var out = token;
var add = function (key, v) { if (v != null && v !== '' && SAFE.test(String(v))) out += '~' + key + v; };
add('s', get('store'));
add('y', get('y'));
var m = get('m'); if (m != null && m !== '') add('m', String(m).length < 2 ? '0' + m : m);
add('k', get('k'));
var t = get('type'); if (t != null && t !== '' && t !== '전체') add('t', TYPE_CODES[t] || (SAFE.test(t) ? t : null));
add('p', get('place'));
add('b', get('basis'));
add('g', get('sup'));
add('d', get('day'));
add('c', get('chart'));
return '#' + out;
}
function isAnnual(m) { return m != null && m !== '' && /^0+$/.test(String(m)); }
function listOf(raw) { return raw == null ? [] : String(raw).split('.').filter(function (x) { return x !== ''; }); }
function resolveFilters(M, params, mem, opts) {
mem = mem || {};
var multi = !!(opts && opts.multi);
var get = function (k) { return params && params.get ? params.get(k) : null; };
var store = get('store') || mem.store || 'all';
if (STORES.indexOf(store) < 0) store = 'all';
var latest = M.latestMonth(store) || M.latestMonth('all');
var inYear = function (yy) { return M.months(store).filter(function (m) { return m.slice(0, 4) === String(yy); }); };
var ys = listOf(get('y') || mem.y).map(Number).filter(function (y) { return y > 0 && inYear(y).length; });
ys = ys.filter(function (y, i) { return ys.indexOf(y) === i; }).sort(function (a, b) { return a - b; });
if (!multi) ys = ys.slice(-1);
if (!ys.length && latest) ys = [Number(latest.slice(0, 4))];
var y = ys.length ? ys[ys.length - 1] : 0;
var raw = get('m') != null && get('m') !== '' ? get('m') : (mem.m != null ? String(mem.m) : null);
var annual = isAnnual(raw);
var ms = annual ? [] : listOf(raw).map(Number).filter(function (k) { return k >= 1 && k <= 12; });
ms = ms.filter(function (k, i) { return ms.indexOf(k) === i; }).sort(function (a, b) { return a - b; });
if (!multi) ms = ms.slice(0, 1);
var list = inYear(y);
if (!multi || (ys.length === 1 && ms.length <= 1)) {
var mm = ms[0] || 0;
var month = mm >= 1 && mm <= 12 ? y + '-' + pad2(mm) : null;
if (!month || list.indexOf(month) < 0) month = list[list.length - 1] || latest;
return { store: store, year: y, month: month, annual: annual, years: [y], months: annual ? [] : [Number(String(month).slice(5))], period: annual ? list : [month], multi: false };
}
var period = [];
ys.forEach(function (yy) { inYear(yy).forEach(function (m) { if (annual || ms.indexOf(Number(m.slice(5))) >= 0) period.push(m); }); });
if (!period.length) { var last = list[list.length - 1] || latest; return { store: store, year: y, month: last, annual: false, years: [y], months: [Number(String(last).slice(5))], period: [last], multi: false }; }
return { store: store, year: y, month: period[period.length - 1], annual: annual, years: ys, months: ms, period: period, multi: true };
}
function periodParams(years, months) {
return { y: years.join('.'), m: months && months.length ? months.map(function (k) { return pad2(k); }).join('.') : '00' };
}
function monthForYear(M, store, y, m) {
var list = M.months(store).filter(function (x) { return x.slice(0, 4) === String(y); });
return list.indexOf(y + '-' + pad2(m)) >= 0 ? m : (list.length ? Number(list[list.length - 1].slice(5)) : m);
}
return { STORES: STORES, SCREENS: SCREENS, TYPE_CODES: TYPE_CODES, parse: parse, build: build, resolveFilters: resolveFilters, periodParams: periodParams, monthForYear: monthForYear, isAnnual: isAnnual };
});
(() => {
const NS = 'http://www.w3.org/2000/svg', MINUS = '\u2212', ROW = 14, LANE = (rows) => 8 + rows * ROW + (rows ? 4 : 0);
const css = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;
const cssNum = (el, name, fb) => { const v = parseFloat(css(el, name, '')); return Number.isFinite(v) ? v : fb; };
const svg = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v); if (parent) parent.appendChild(n); return n; };
const text = (parent, str, attrs) => { const t = svg('text', attrs, parent); t.textContent = str; return t; };
const titled = (parent, str) => { svg('title', {}, parent).textContent = str; return parent; };
const nf = (o) => new Intl.NumberFormat(document.documentElement.lang || 'en', o);
const fmt = {
int: (v) => nf({ maximumFractionDigits: 0 }).format(v),
dec: (d) => (v) => nf({ minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
pct: (d = 1) => (v) => nf({ style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
money: (cur = 'EUR', d = 0) => (v) => nf({ style: 'currency', currency: cur, minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
compact: (v) => nf({ notation: 'compact', maximumFractionDigits: 1 }).format(v),
ms: (v) => `${nf({ maximumFractionDigits: 0 }).format(v)} ms`,
signed: (f = (v) => nf({ maximumFractionDigits: 0 }).format(v)) => (v) => (v > 0 ? '+' : v < 0 ? MINUS : '') + f(Math.abs(v)),
clock: (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`,
};
const minutes = (t) => (t == null || t === '' ? null : typeof t === 'number' ? t : (([hh, mm]) => hh * 60 + (mm || 0))(String(t).split(':').map(Number)));
function ticks(min, max, count = 4) {
if (max === min) max = min + 1;
const raw = (max - min) / count, mag = 10 ** Math.floor(Math.log10(raw));
const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
const lo = Math.floor(min / step) * step; let hi = Math.ceil(max / step) * step; if (hi <= max) hi += step;
const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
return out;
}
function xPicks(labels, span, at) {
const n = labels.length;
if (at) return at.filter((i) => i >= 0 && i < n);
if (n <= 1) return n ? [0] : [];
const longest = Math.max(...labels.map((l) => String(l).length));
const cap = Math.max(2, Math.min(8, Math.floor(span / (longest * 7 + 18))));
if (n <= cap) return [...Array(n).keys()];
const mins = labels.every((l) => /^\d{1,2}:\d{2}$/.test(String(l))) ? labels.map(minutes) : null;
const d = mins ? mins[1] - mins[0] : 0;
let first = null, land = null;
for (let k = 1; k < n; k++) {
const stepM = k * d, clock = mins && d > 0;
if (clock && (stepM >= 60 ? ![1, 2, 3, 4, 6, 12].includes(stepM / 60) : 60 % stepM !== 0)) continue;
let s = clock ? mins.findIndex((m) => m % Math.max(60, stepM) === 0) : 0;
if (s < 0) s = Math.max(0, mins.findIndex((m) => m % 60 === 0));
const count = Math.floor((n - 1 - s) / k) + 1;
if (count > cap) continue;
if (first == null) first = { k, s };
if ((n - 1 - s) % k === 0) { land = { k, s, count }; break; }
}
const pick = land && land.count >= Math.max(3, Math.ceil(cap * 0.6)) ? land : first || { k: n - 1, s: 0 };
const out = []; for (let i = pick.s; i < n; i += pick.k) out.push(i);
return out;
}
const swatchProbe = document.createElement('span'); swatchProbe.style.display = 'none';
const rgb = (el, value) => {
el.appendChild(swatchProbe); swatchProbe.style.color = ''; swatchProbe.style.color = value;
const c = getComputedStyle(swatchProbe).color; swatchProbe.remove();
const m = c.match(/-?[\d.]+/g); if (!m || m.length < 3) return null;
return c.startsWith('color(') ? m.slice(0, 3).map((v) => Math.round(+v * 255)) : m.slice(0, 3).map(Number);
};
const mix = (el, a, b, t) => { const p = rgb(el, a), q = rgb(el, b); return p && q ? `rgb(${p.map((v, i) => Math.round(v * t + q[i] * (1 - t))).join(',')})` : a; };
const measure = (s, str, size = 11, weight = 400) => { const t = text(s, str, { x: -999, y: -999, 'font-size': size, 'font-weight': weight, visibility: 'hidden' }); let wd = 0; try { wd = t.getComputedTextLength(); } catch {} t.remove(); return wd > 0 ? wd : String(str).length * size * 0.56; };
const fit = (s, str, max, size, weight) => { str = String(str); if (measure(s, str, size, weight) <= max) return str; while (str.length > 1 && measure(s, str + '\u2026', size, weight) > max) str = str.slice(0, -1); return str.trimEnd() + '\u2026'; };
function frame(el, h) {
el.innerHTML = '';
const w = Math.max(240, el.clientWidth || 600);
const s = svg('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: h, role: 'img' }, el);
s.style.cssText = 'display:block;overflow:visible;font-variant-numeric:tabular-nums';
return { s, w, h };
}
function tooltip(el) {
let t = el.querySelector('.chart-tip');
if (!t) { t = document.createElement('div'); t.className = 'chart-tip'; t.style.cssText = 'position:absolute;pointer-events:none;padding:6px 8px;font:inherit;font-size:12px;line-height:1.35;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity 120ms ease;background:var(--surface,#fff);color:var(--ink,#111);border:1px solid var(--grid,#e5e7eb)'; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; el.appendChild(t); }
return t;
}
function axes(g, el, { w, h, padL, padB, yt, y, labels, x, band = false, at = null, tick, avoid = null, boldAt = null }) {
const grid = css(el, '--grid', '#e8e8e8'), ink = css(el, '--axis-ink', '#6b6b6b'), s = g.ownerSVGElement;
for (const v of yt) {
const yy = y(v);
svg('line', { x1: padL, x2: w, y1: yy, y2: yy, stroke: grid, 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, g);
text(g, tick(v), { x: padL - 8, y: yy + 4, 'text-anchor': 'end', 'font-size': 12, fill: ink });
}
const n = labels.length;
for (const i of xPicks(labels, w - padL, at)) {
const lab = String(labels[i]), tw = measure(s, lab, 12), xx = x(i);
let left = band ? xx - tw / 2 : i === 0 ? xx : i === n - 1 ? xx - tw : xx - tw / 2;
left = Math.max(band ? 0 : padL, Math.min(w - tw, left));
if (avoid && left < avoid[1] + 8 && left + tw > avoid[0] - 8) continue;
text(g, lab, { x: left, y: h - padB + 18, 'font-size': 12, fill: i === boldAt ? css(el, '--ink', '#111') : ink, 'font-weight': i === boldAt ? 600 : null });
}
}
function lane(s, items, w, maxRows = 3) {
const gap = 6, rank = (it) => (it.fixed != null ? 0 : it.span ? 1 : 2);
const order = [...items].sort((a, b) => rank(a) - rank(b) || (a.x ?? a.x0) - (b.x ?? b.x0));
const opts = order.map((it) => {
const out = [];
for (const str of [it.label, it.short].filter(Boolean)) {
const tw = measure(s, str, 12) + (it.glyph ? 9 : 0), mid = it.span ? (it.x0 + it.x1) / 2 : 0;
const cands = it.fixed != null ? [[it.fixed, it.fixed + tw]] : it.span ? [[mid - tw / 2, mid + tw / 2], [it.x0, it.x0 + tw], [it.x1 - tw, it.x1]] : [[it.x + 4, it.x + 4 + tw], [it.x - 4 - tw, it.x - 4]];
for (let row = 0; row < maxRows; row++) for (const [x0, x1] of cands) if (x0 >= 0 && x1 <= w) out.push({ ...it, text: str, isShort: str !== it.label, row, x0, x1 });
}
return out;
});
const free = (c, placed) => placed.every((p) => p.dropped || (!(p.row === c.row && c.x0 < p.x1 + gap && c.x1 > p.x0 - gap)
&& !(p.leader != null && p.row >= c.row && p.leader > c.x0 - 3 && p.leader < c.x1 + 3)
&& !(c.leader != null && p.row <= c.row && c.leader > p.x0 - 3 && c.leader < p.x1 + 3)));
let best = null, steps = 0;
const solve = (i, placed, allowShort, allowDrop) => {
if (++steps > 20000) return false;
if (i === order.length) { best = placed.slice(); return true; }
for (const c of opts[i]) { if ((c.isShort && !allowShort) || !free(c, placed)) continue; placed.push(c); if (solve(i + 1, placed, allowShort, allowDrop)) return true; placed.pop(); }
if (allowDrop) { placed.push({ ...order[i], dropped: true }); if (solve(i + 1, placed, allowShort, allowDrop)) return true; placed.pop(); }
return false;
};
for (const [sh, dr] of [[false, false], [true, false], [true, true]]) { steps = 0; if (solve(0, [], sh, dr)) break; }
const placed = (best || []).filter((p) => !p.dropped), dropped = (best || order.map((it) => ({ ...it, dropped: true }))).filter((p) => p.dropped);
return { placed, dropped, rows: placed.length ? Math.max(...placed.map((p) => p.row)) + 1 : 0 };
}
function prepNotes(s, annotations = [], x, w, extra = []) {
const items = [];
for (const a of annotations || []) {
if (a.from != null) items.push({ span: true, x0: Math.min(x(a.from), x(a.to)), x1: Math.max(x(a.from), x(a.to)), label: a.label, short: a.short, colour: a.colour, fill: a.fill });
else if (a.at != null) items.push({ x: x(a.at), at: a.at, leader: x(a.at), label: a.label, short: a.short, colour: a.colour, value: a.value, strong: a.strong });
}
items.push(...extra);
return { items, ...lane(s, items.filter((it) => it.label), w) };
}
const spanFill = (el, it) => (it.fill === 'warn' ? { fill: css(el, '--chart-warn', '#e08a1e'), opacity: cssNum(el, '--chart-warn-span', 0.18) } : { fill: css(el, '--axis-ink', '#6b6b6b'), opacity: cssNum(el, '--chart-span', 0.07) });
const spanInk = (el, p, ink) => p.colour || (p.fill === 'warn' ? css(el, '--chart-warn-ink', ink) : p.strong ? css(el, '--ink', ink) : ink);
function notesUnder(g, el, N, { padT, h, padB }) {
for (const it of N.items) if (it.span) { const f = spanFill(el, it), w = Math.max(it.fill === 'warn' ? 6 : 0, it.x1 - it.x0); svg('rect', { x: it.x1 - it.x0 < w ? (it.x0 + it.x1 - w) / 2 : it.x0, y: padT, width: w, height: h - padT - padB, fill: f.fill, opacity: f.opacity }, g); }
}
function notesOver(g, el, N, { padT, h, padB }) {
const ink = css(el, '--axis-ink', '#6b6b6b');
for (const it of N.items) if (it.leader != null && !it.drawn) svg('line', { x1: it.leader, x2: it.leader, y1: padT, y2: Math.max(padT, it.end ?? h - padB), stroke: ink, 'stroke-width': 1, opacity: 0.45, 'shape-rendering': 'crispEdges' }, g);
for (const p of N.placed) {
const base = padT - 9 - p.row * ROW;
if (p.leader != null) svg('line', { x1: p.leader, x2: p.leader, y1: base - 8, y2: padT, stroke: ink, 'stroke-width': 1, opacity: 0.45, 'shape-rendering': 'crispEdges' }, g);
if (p.glyph) svg('path', { d: p.glyph === 'up' ? `M${p.x0} ${base - 1}l3 -6l3 6z` : `M${p.x0} ${base - 7}l3 6l3 -6z`, fill: ink }, g);
text(g, p.text, { x: p.x0 + (p.glyph ? 9 : 0), y: base, 'font-size': 12, fill: spanInk(el, p, ink) });
}
const el2 = g.ownerSVGElement.parentNode; el2._warned = el2._warned || new Set();
for (const d of N.dropped) {
if (d.leader != null) { const hit = svg('line', { x1: d.leader, x2: d.leader, y1: padT, y2: h - padB, stroke: 'transparent', 'stroke-width': 8 }, g); titled(hit, d.label, {}); }
if (!el2._warned.has(d.label)) { el2._warned.add(d.label); console.warn(`Charts: no room above the plot for "${d.label}". Give it a short form (short) or label fewer markers.`); }
}
}
function hits(b, lines) {
for (const pts of lines) for (let k = 1; k < pts.length; k++) {
const a = pts[k - 1], c = pts[k]; if (!a || !c) continue;
if (a[0] === c[0]) { if (a[0] >= b.x0 - 3 && a[0] <= b.x1 + 3 && Math.max(a[1], c[1]) >= b.y0 - 3 && Math.min(a[1], c[1]) <= b.y1 + 3) return true; continue; }
const lo = Math.max(b.x0 - 3, Math.min(a[0], c[0])), hi = Math.min(b.x1 + 3, Math.max(a[0], c[0]));
for (let xx = lo; xx <= hi; xx += 2) { const yy = a[1] + ((xx - a[0]) / (c[0] - a[0])) * (c[1] - a[1]); if (yy >= b.y0 - 3 && yy <= b.y1 + 3) return true; }
}
return false;
}
const boxHits = (b, boxes) => boxes.some((r) => b.x0 < r.x1 + 3 && b.x1 > r.x0 - 3 && b.y0 < r.y1 + 3 && b.y1 > r.y0 - 3);
function references(g, el, refs, { y, padL, w, lines = [], boxes = [] }) {
const ink = css(el, '--axis-ink', '#6b6b6b'), s = g.ownerSVGElement;
for (const r of [].concat(refs || [])) {
const yy = y(r.value);
svg('line', { x1: padL, x2: w, y1: yy, y2: yy, stroke: ink, 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.7 }, g);
if (!r.label) continue;
const tw = measure(s, r.label, 12), right = r.at !== 'left';
const cand = [[right, -5], [right, 13], [!right, -5], [!right, 13]].map(([rt, dy]) => ({ x0: rt ? w - tw : padL + 4, x1: rt ? w : padL + 4 + tw, y0: yy + dy - 9, y1: yy + dy + 2, base: yy + dy }));
const b = cand.find((c) => !hits(c, lines) && !boxHits(c, boxes)) || cand[0];
text(g, r.label, { x: b.x0, y: b.base, 'font-size': 12, fill: ink });
}
}
function paintRect(parent, st, x, y, w, h, r = 0) {
let fill = st.fill || 'none';
if (st.hatch) {
const s = parent.ownerSVGElement || parent, id = 'h' + Math.random().toString(36).slice(2, 8);
const p = svg('pattern', { id, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, svg('defs', {}, s));
svg('rect', { width: 5, height: 5, fill: st.fill }, p); svg('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: st.hatch, 'stroke-width': 1.2 }, p);
fill = `url(#${id})`;
}
const inset = st.stroke ? (st.width || 1) / 2 : 0;
const n = svg('rect', { x: x + inset, y: y + inset, width: Math.max(0, w - inset * 2), height: Math.max(0, h - inset * 2), rx: r, fill, stroke: st.stroke, 'stroke-width': st.stroke ? st.width || 1 : null, 'stroke-dasharray': st.dash, opacity: st.opacity, 'shape-rendering': r ? null : 'crispEdges' }, parent);
if (st.edge) svg('rect', { x, y, width: 3, height: h, rx: Math.min(r, 1.5), fill: st.edge }, parent);
return n;
}
const legendCss = ':where(.chart-legend){list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;line-height:16px;color:var(--muted,#5f6368)}:where(.chart-legend li){display:inline-flex;align-items:center;gap:6px;white-space:nowrap}:where(.chart-legend svg){flex:none;overflow:visible}@media (max-width:480px){:where(.chart-legend){display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}';
function legendEl(items, target) {
if (!document.getElementById('charts-legend-css')) { const st = document.createElement('style'); st.id = 'charts-legend-css'; st.textContent = legendCss; document.head.appendChild(st); }
const ul = document.createElement('ul'); ul.className = 'chart-legend';
for (const it of items) {
const li = document.createElement('li'), sw = svg('svg', { width: it.w || 14, height: 12, 'aria-hidden': 'true' });
it.draw(sw); li.append(sw, document.createTextNode(it.label)); ul.appendChild(li);
}
const t = typeof target === 'string' ? document.querySelector(target) : target;
if (t) t.replaceChildren(ul);
return ul;
}
const rectSwatch = (st, w = 14, h = 10, r = 2) => (sw) => paintRect(sw, st, 0, (12 - h) / 2, w, h, r);
function settle(draw) { if (document.fonts) { document.fonts.ready.then(draw); document.fonts.addEventListener?.('loadingdone', draw, { once: true }); } }
const heightOf = (h) => (typeof h === 'function' ? h() : h);
function line(el, { labels, series, format = fmt.int, tickFormat = null, height = 220, fill = false, min, max, step = false, annotations, reference, today = null, todayLabel = 'Today', endLabel = false, yTicks = null, xAt = null, legend = null, ariaLabel = null, tickLabels = null, markDots = null, bottomMarks = null }) {
el._fmt = format;
const colourOf = (sr, k) => sr.colour || (k === 0 ? css(el, '--chart-1', '#2f6fdf') : css(el, `--chart-${k + 1}`, css(el, '--chart-muted', '#a3a3a3')));
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const all = series.flatMap((x) => x.values.filter((v) => v != null)).concat([].concat(reference || []).map((r) => r.value));
const top = max ?? Math.max(...all);
const yt = yTicks || ticks(min ?? Math.min(0, ...all), top, 4);
const tick = tickFormat || format;
const lastVal = series[0].values.filter((v) => v != null).at(-1);
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padB = 26, padR = endLabel ? 10 + measure(s, format(lastVal), 12, 600) : 0;
const x = (i) => padL + (i * (w - padL - padR)) / Math.max(1, labels.length - 1);
const peaks = [];
series.forEach((sr, k) => sr.values.forEach((v, i) => { if (v != null && v > yt.at(-1) && (i === 0 || sr.values[i - 1] == null || sr.values[i - 1] <= yt.at(-1))) { let j = i, peak = v; while (j < sr.values.length && sr.values[j] != null && sr.values[j] > yt.at(-1)) { peak = Math.max(peak, sr.values[j]); j++; } peaks.push({ x: x(i), label: format(peak) + ' \u00b7 ' + labels[i], colour: colourOf(sr, k) }); } }));
const scale = (N) => { const padT = LANE(N.rows); return { padT, y: (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0])) }; };
const linesAt = (y) => series.map((sr) => { const out = []; sr.values.forEach((v, i) => { if (v == null) { out.push(null); return; } const p = [x(i), y(Math.min(v, yt.at(-1)))]; const prev = out.at(-1); if (step && prev) out.push([p[0], prev[1]]); out.push(p); }); return out; }).concat([].concat(reference || []).map((r) => [[padL, y(r.value)], [w, y(r.value)]]));
let N = prepNotes(s, annotations, x, w, peaks), { padT, y } = scale(N), todayBox = null;
if (today != null && todayLabel) {
const cut = x(today), tw = measure(s, todayLabel, 12), lines = linesAt(y);
const cand = [[cut + 4, h - padB - 6], [cut - 4 - tw, h - padB - 6], [cut + 4, padT + 11], [cut - 4 - tw, padT + 11]].map(([x0, b]) => ({ x0, x1: x0 + tw, y0: b - 9, y1: b + 2, base: b }));
todayBox = cand.find((b) => b.x0 >= padL && b.x1 <= w && !hits(b, lines)) || null;
if (!todayBox) { N = prepNotes(s, annotations, x, w, [...peaks, { x: cut, leader: cut, drawn: true, label: todayLabel }]); ({ padT, y } = scale(N)); }
}
const g = svg('g', {}, s);
axes(g, el, { w, h, padL, padB, yt, y, labels: tickLabels || labels, x, at: xAt, tick });
notesUnder(g, el, N, { padT, h, padB });
series.forEach((sr, k) => {
const col = colourOf(sr, k);
const pts = sr.values.map((v, i) => (v == null ? null : [x(i), y(Math.min(v, yt.at(-1)))]));
const d = pts.reduce((acc, p, i) => (p ? acc + (acc && pts[i - 1] ? (step ? `L${p[0].toFixed(1)} ${pts[i - 1][1].toFixed(1)}L` : 'L') : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) : acc), '');
if (fill && k === 0) { const first = pts.find(Boolean), last = [...pts].reverse().find(Boolean); svg('path', { d: `${d}L${last[0]} ${y(yt[0])}L${first[0]} ${y(yt[0])}Z`, fill: col, opacity: 0.12 }, g); }
if (today == null) svg('path', { d, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
else {
const cut = x(today), id = 'c' + k + Math.random().toString(36).slice(2, 8);
const defs = svg('defs', {}, g);
const a = svg('clipPath', { id: id + 'a' }, defs); svg('rect', { x: 0, y: 0, width: cut, height: h }, a);
const b = svg('clipPath', { id: id + 'b' }, defs); svg('rect', { x: cut, y: 0, width: w, height: h }, b);
svg('path', { d, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', 'clip-path': 'url(#' + id + 'a)' }, g);
svg('path', { d, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0.8, 'clip-path': 'url(#' + id + 'b)' }, g);
if (k === 0) { svg('line', { x1: cut, x2: cut, y1: padT, y2: h - padB, stroke: css(el, '--axis-ink', '#6b6b6b'), 'stroke-width': 1, opacity: 0.4 }, g); if (todayBox) text(g, todayLabel, { x: todayBox.x0, y: todayBox.base, 'font-size': 12, fill: css(el, '--axis-ink', '#6b6b6b') }); }
}
if (endLabel && k === 0) { const li = sr.values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0).at(-1); text(g, format(sr.values[li]), { x: x(li) + 6, y: y(Math.min(sr.values[li], yt.at(-1))) + 4, 'font-size': 12, 'font-weight': 600, fill: css(el, '--ink', '#111') }); }
});
references(g, el, reference, { y, padL, w, lines: linesAt(y).slice(0, series.length) });
for (const it of N.items) if (it.value != null && it.leader != null) it.end = y(Math.min(it.value, yt.at(-1))) - 4;
notesOver(g, el, N, { padT, h, padB });
if (bottomMarks && bottomMarks.length) {
const ink = css(el, '--ink', '#111'), muted = css(el, '--axis-ink', '#6b6b6b'), vals = series[0].values;
const refY = [].concat(reference || []).filter((r) => r && r.value != null).map((r) => y(r.value));
const floorOf = (x0, x1) => {
let low = padT;
vals.forEach((v, i) => { const xx = x(i); if (v != null && xx >= x0 - 6 && xx <= x1 + 6) low = Math.max(low, y(Math.min(v, yt.at(-1)))); });
for (const ry of refY) low = Math.max(low, ry + 16);
return low + 8;
};
const placed = [];
const free = (b) => placed.every((p) => b.x1 + 6 <= p.x0 || b.x0 >= p.x1 + 6 || b.y1 + 4 <= p.y0 || b.y0 >= p.y1 + 4);
for (const mk of bottomMarks) {
const v = vals[mk.at]; if (v == null) continue;
const px = x(mk.at), py = y(Math.min(v, yt.at(-1))), ls = (mk.lines || []).filter(Boolean);
const sizes = ls.map((str, i) => (i === ls.length - 1 ? 14 : 13));
const tw = Math.max(...ls.map((str, i) => measure(s, str, sizes[i], i === ls.length - 1 ? 700 : 400))), th = ls.reduce((a, str, i) => a + sizes[i] + 3, 0);
const plotH = h - padB - padT, base = padT + 0.58 * plotH, stepH = th + 8;
let box = null;
for (const k of [0, 1, -1, 2, -2]) {
const y0 = base + k * stepH, y1 = y0 + th;
if (y1 > h - padB - 4) continue;
for (const x0 of [px - tw / 2, px - 4, px - tw + 4]) {
const bx = Math.max(padL + 2, Math.min(w - tw - 2, x0)), b = { x0: bx, x1: bx + tw, y0, y1 };
if (y0 >= floorOf(b.x0, b.x1) && free(b)) { box = b; break; }
}
if (box) break;
}
if (!box) continue;
placed.push(box);
const lx = Math.max(box.x0 + 4, Math.min(box.x1 - 4, px));
svg('line', { x1: px, y1: py + 6, x2: lx, y2: box.y0 - 5, stroke: muted, 'stroke-width': 1, 'stroke-dasharray': '2 3', opacity: 0.7 }, g);
let yy = box.y0;
ls.forEach((str, i) => { yy += sizes[i]; text(g, str, { x: box.x0, y: yy, 'font-size': sizes[i], fill: i === ls.length - 1 ? ink : muted, 'font-weight': i === ls.length - 1 ? 700 : null }); yy += 3; });
}
}
for (const i of markDots || []) { const v = series[0].values[i]; if (v != null) svg('circle', { cx: x(i), cy: y(Math.min(v, yt.at(-1))), r: 4, fill: colourOf(series[0], 0), stroke: css(el, '--surface', '#fff'), 'stroke-width': 1.5 }, g); }
for (const it of N.items) if (it.value != null && it.leader != null) svg('circle', { cx: it.leader, cy: y(Math.min(it.value, yt.at(-1))), r: 3.5, fill: colourOf(series[0], 0), stroke: css(el, '--surface', '#fff'), 'stroke-width': 1.5 }, g);
const tip = tooltip(el), rule = svg('line', { y1: padT, y2: h - padB, stroke: css(el, '--axis-ink', '#6b6b6b'), 'stroke-width': 1, opacity: 0 }, g);
const dots = series.map((sr, k) => svg('circle', { r: 3.5, fill: css(el, '--surface', '#fff'), stroke: colourOf(sr, k), 'stroke-width': 2, opacity: 0 }, g));
const hit = svg('rect', { x: padL, y: padT, width: w - padL, height: h - padT - padB, fill: 'transparent' }, s);
const move = (ev) => { const r = s.getBoundingClientRect(); const px = ((ev.clientX - r.left) / r.width) * w; const i = Math.max(0, Math.min(labels.length - 1, Math.round(((px - padL) / (w - padL - padR)) * (labels.length - 1)))); rule.setAttribute('x1', x(i)); rule.setAttribute('x2', x(i)); rule.setAttribute('opacity', 0.35); series.forEach((sr, k) => { const v = sr.values[i]; dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', v == null ? -99 : y(Math.min(v, yt.at(-1)))); dots[k].setAttribute('opacity', v == null ? 0 : 1); }); tip.innerHTML = `<div style="opacity:.7">${labels[i]}</div>` + series.map((sr) => `<div><b style="font-weight:600">${sr.values[i] == null ? '–' : format(sr.values[i])}</b> ${series.length > 1 ? sr.name : ''}</div>`).join(''); const left = Math.min((x(i) / w) * r.width + 12, r.width - tip.offsetWidth - 4); tip.style.left = `${Math.max(0, left)}px`; tip.style.top = '0px'; tip.style.opacity = 1; };
hit.addEventListener('pointermove', move); hit.addEventListener('pointerleave', () => { tip.style.opacity = 0; rule.setAttribute('opacity', 0); dots.forEach((d) => d.setAttribute('opacity', 0)); });
const last = series[0].values.filter((v) => v != null).at(-1);
s.setAttribute('aria-label', ariaLabel || `${series.map((x) => x.name).join(', ')}, ${labels[0]} to ${labels.at(-1)}; latest ${last == null ? 'no data' : format(last)}`);
};
draw(); watch(el, draw); settle(draw);
const lg = series.length > 1 ? legendEl(series.map((sr, k) => ({ label: sr.name, w: 16, draw: (sw) => svg('line', { x1: 0, x2: 16, y1: 6, y2: 6, stroke: colourOf(sr, k), 'stroke-width': 2, 'stroke-dasharray': sr.dash ? '4 3' : null }, sw) })), legend) : null;
return { legend: lg };
}
function diverging(el, { labels, up, down, values, above = 'Above', below = 'Below', mark = [], markLabel = null, markSide = 'below', partial = null, format = fmt.int, tickFormat = null, height = 200, annotations, reference, xAt = null, legend = null, ariaLabel = null, tickLabels = null }) {
if (values) { up = values.map((v) => Math.max(0, v || 0)); down = values.map((v) => Math.max(0, -(v || 0))); }
up = up || labels.map(() => 0); down = down || labels.map(() => 0);
const st = { above: { fill: css(el, '--chart-1', '#2f6fdf') }, below: { fill: css(el, '--chart-muted', '#c9c9c9') }, mark: { fill: css(el, '--chart-mark', css(el, '--ink', '#111')) } };
const marked = (i, side) => mark.includes(i) && (markSide === 'both' || markSide === side);
const tick = (v) => (v > 0 ? '+' : v < 0 ? MINUS : '') + (tickFormat || format)(Math.abs(v));
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const hiUp = Math.max(0, ...up), hiDown = Math.max(0, ...down);
const yt = ticks(-hiDown, hiUp || 1, 4); const stp = yt[1] - yt[0]; if (hiDown > 0 && yt[0] >= -hiDown) yt.unshift(+(yt[0] - stp).toFixed(10));
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padB = 26;
const band = (w - padL) / labels.length, bw = Math.max(2, band * 0.62);
const x = (i) => padL + band * i + band / 2;
const N = prepNotes(s, annotations, x, w, [{ fixed: padL, glyph: 'up', label: above }]), padT = LANE(N.rows);
const y = (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
const g = svg('g', {}, s), ink = css(el, '--axis-ink', '#6b6b6b');
const bwid = measure(s, below, 12) + 9;
axes(g, el, { w, h, padL, padB, yt, y, labels: tickLabels || labels, x, band: true, at: xAt, tick, avoid: [padL, padL + bwid] });
svg('path', { d: `M${padL} ${h - padB + 11}l3 6l3 -6z`, fill: ink }, g); text(g, below, { x: padL + 9, y: h - padB + 18, 'font-size': 12, fill: ink });
notesUnder(g, el, N, { padT, h, padB });
for (const it of N.items) if (it.at != null) it.end = y(up[it.at] || 0) - 4;
labels.forEach((lab, i) => {
const o = partial === i ? 0.5 : null;
if (up[i] > 0) { const r = paintRect(g, { ...(marked(i, 'above') ? st.mark : st.above), opacity: o }, x(i) - bw / 2, y(up[i]), bw, Math.max(0, y(0) - y(up[i]) - 1)); titled(r, `${lab}: ${above} ${format(up[i])}`, {}); }
if (down[i] > 0) { const r = paintRect(g, { ...(marked(i, 'below') ? st.mark : st.below), opacity: o }, x(i) - bw / 2, y(0) + 1, bw, Math.max(0, y(-down[i]) - y(0) - 1)); titled(r, `${lab}: ${below} ${format(down[i])}`, {}); }
});
svg('line', { x1: padL, x2: w, y1: y(0), y2: y(0), stroke: ink, 'stroke-width': 1, opacity: 0.8, 'shape-rendering': 'crispEdges' }, g);
references(g, el, reference, { y, padL, w, boxes: labels.map((_, i) => ({ x0: x(i) - bw / 2, x1: x(i) + bw / 2, y0: y(up[i]), y1: y(-down[i]) })) });
notesOver(g, el, N, { padT, h, padB });
s.setAttribute('aria-label', ariaLabel || `${above} above the line and ${below} below it, ${labels[0]} to ${labels.at(-1)}`);
};
draw(); watch(el, draw); settle(draw);
const items = [];
if (up.some((v) => v > 0)) items.push({ label: above, draw: rectSwatch(st.above) });
if (down.some((v) => v > 0)) items.push({ label: below, draw: rectSwatch(st.below) });
if (mark.length && markLabel) items.push({ label: markLabel, draw: rectSwatch(st.mark) });
return { get svg() { return el.querySelector(':scope > svg'); }, legend: legendEl(items, legend) };
}
function placeValueLabels(box, { n, x, top, w, anchor, bold = true, gap = 6, spread = false, bottom = null }) {
if (!box) return;
const els = Array.from(box.querySelectorAll('[data-i]'));
const info = els.map((e) => { const i = Number(e.getAttribute('data-i')); e.classList.remove('off'); return { e, i, t: top(i) }; }).filter((o) => {
if (!(o.i >= 0 && o.i < n) || o.t == null) { o.e.classList.add('off'); return false; }
return true;
});
info.forEach((o) => { o.lw = o.e.offsetWidth || String(o.e.textContent).length * 7; o.lh = o.e.offsetHeight || 14; });
if (!info.length) return;
const at = info.some((o) => o.i === anchor) ? anchor : info[info.length - 1].i;
const box1 = (o) => { const cx = x(o.i), l = Math.max(0, Math.min(w - o.lw, cx - o.lw / 2)); return [l, l + o.lw]; };
const yOf = (o, k) => (o.t.above ? o.t.y - o.lh - 2 - k * (o.lh + 1) : o.t.y + 2 + k * (o.lh + 1));
const rect = (o, k) => { const b = box1(o), y0 = yOf(o, k); return { x0: b[0], x1: b[1], y0, y1: y0 + o.lh }; };
const hit2 = (p, q) => p.x0 < q.x1 + gap && p.x1 + gap > q.x0 && p.y0 < q.y1 + 1 && p.y1 + 1 > q.y0;
if (spread) {
const order = info.slice().sort((a, b) => Math.abs(a.i - at) - Math.abs(b.i - at)), placed = [];
for (const o of order) {
let ok = null;
for (let k = 0; k < 3 && !ok; k++) { const r = rect(o, k); if (r.y0 >= -2 && (bottom == null || r.y1 <= bottom) && placed.every((q) => !hit2(r, q))) ok = { r, k }; }
if (!ok) { o.e.classList.add('off'); continue; }
placed.push(ok.r);
o.e.style.left = ok.r.x0.toFixed(1) + 'px'; o.e.style.top = ok.r.y0.toFixed(1) + 'px';
o.e.classList.toggle('on', !!bold && o.i === anchor);
}
return;
}
const fits = (list) => { const bs = list.map(box1).sort((a, b) => a[0] - b[0]); return bs.every((b, k) => !k || b[0] >= bs[k - 1][1] + gap); };
let k = 1, pick = info;
while (k < n && !fits(pick)) { k++; pick = info.filter((o) => (((o.i - at) % k) + k) % k === 0); }
const shown = new Set(pick.map((o) => o.i));
const sorted = pick.slice().sort((a, b) => Math.abs(a.i - at) - Math.abs(b.i - at));
const kept = [];
for (const o of sorted) { const b = box1(o); if (kept.every((q) => b[1] + gap <= q[0] || b[0] >= q[1] + gap)) kept.push(b); else shown.delete(o.i); }
for (const o of info) {
if (!shown.has(o.i)) { o.e.classList.add('off'); continue; }
const b = box1(o);
o.e.style.left = b[0].toFixed(1) + 'px'; o.e.style.top = (o.t.above ? o.t.y - o.lh - 2 : o.t.y + 2).toFixed(1) + 'px';
o.e.classList.toggle('on', !!bold && o.i === anchor);
}
}
function prepSpans(s, spans, x, band, w) {
const items = (spans || []).filter((sp) => sp && sp.from != null && sp.to != null).map((sp) => ({ span: true, x0: Math.max(0, x(Math.min(sp.from, sp.to)) - band / 2), x1: Math.min(w, x(Math.max(sp.from, sp.to)) + band / 2), label: sp.label, short: sp.short, fill: sp.fill }));
return { items, ...lane(s, items.filter((it) => it.label), w, 2) };
}
function drawSpans(g, el, N, { plotTop, h, padB }) {
for (const it of N.items) { const f = spanFill(el, it); svg('rect', { x: it.x0, y: plotTop, width: Math.max(0, it.x1 - it.x0), height: Math.max(0, h - plotTop - padB), fill: f.fill, opacity: it.fill === 'warn' ? f.opacity : Math.max(0.1, f.opacity * 1.6) }, g); }
}
function drawSpanLabels(g, el, N, laneTop) {
const ink = css(el, '--axis-ink', '#6b6b6b');
for (const p of N.placed) text(g, p.text, { x: p.x0, y: laneTop - 9 - p.row * ROW, 'font-size': 12, fill: spanInk(el, p, ink) });
}
function columns(el, { labels, values, format = fmt.int, tickFormat = null, height = 200, highlight = null, ariaLabel = null, tickLabels = null, xAt = null, onSelect = null, valueLabels = null, spans = null, spread = false }) {
el._fmt = format;
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const nums = values.filter((v) => v != null);
const lo = Math.min(0, ...nums), hi = Math.max(0, ...nums);
const yt = ticks(lo, hi > lo ? hi : lo + 1, 4), tick = tickFormat || format;
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padB = 26;
const band = (w - padL) / values.length, bw = Math.max(2, Math.min(band * 0.62, 48));
const x = (i) => padL + band * i + band / 2;
const N = prepSpans(s, spans, x, band, w), laneTop = N.rows ? LANE(N.rows) : 0;
const padT = (laneTop || 8) + (valueLabels ? (spread ? 32 : 16) : 0);
const room = spread && valueLabels && lo < 0 ? 12 : 0;
const y = (v) => padT + (h - padT - padB - room) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
const lit = (i) => highlight == null || (Array.isArray(highlight) ? highlight.includes(i) : highlight === i);
const tl = tickLabels || labels;
let at = xAt;
if (!at) {
const longest = Math.max(...tl.map((l) => String(l).length)), cap = Math.max(2, Math.min(12, Math.floor((w - padL) / (longest * 7 + 16))));
const k = Math.max(1, Math.ceil(values.length / cap)), anchor = highlight != null && !Array.isArray(highlight) ? highlight : values.length - 1;
at = []; for (let i = anchor % k; i < values.length; i += k) at.push(i);
}
const g = svg('g', {}, s);
if (N.items.length) drawSpans(g, el, N, { plotTop: padT - (valueLabels ? 16 : 0), h, padB });
axes(g, el, { w, h, padL, padB, yt, y, labels: tl, x, band: true, at, tick, boldAt: highlight != null && !Array.isArray(highlight) ? highlight : null });
const hue = css(el, '--chart-1', '#1d5fbf'), muted = css(el, '--chart-muted', '#c9c9c9'), neg = css(el, '--negative', '#c4242a');
values.forEach((v, i) => {
if (v == null) return;
const y0 = y(0), y1 = y(v), hgt = Math.abs(y1 - y0);
if (hgt < 0.5) return;
const r = svg('rect', { x: x(i) - bw / 2, y: Math.min(y0, y1), width: bw, height: hgt, fill: v < 0 ? neg : lit(i) ? hue : muted, 'shape-rendering': 'crispEdges' }, g);
titled(r, `${labels[i]} ${format(v)}`);
if (onSelect) { r.style.cursor = 'pointer'; r.addEventListener('click', () => onSelect(i, r)); }
});
if (onSelect) values.forEach((v, i) => { if (v == null) return; const hit = svg('rect', { x: x(i) - band / 2, y: padT, width: band, height: h - padT - padB, fill: 'transparent' }, s); hit.style.cursor = 'pointer'; titled(hit, `${labels[i]} ${format(v)}`); hit.addEventListener('click', () => onSelect(i, hit)); });
svg('line', { x1: padL, x2: w, y1: y(0), y2: y(0), stroke: css(el, '--axis-ink', '#6b6b6b'), 'stroke-width': 1, opacity: 0.8, 'shape-rendering': 'crispEdges' }, g);
if (N.placed.length) drawSpanLabels(g, el, N, laneTop);
s.setAttribute('aria-label', ariaLabel || `${labels[0]} – ${labels.at(-1)}`);
placeValueLabels(valueLabels, { n: values.length, x, w, spread, bottom: h - padB + 6, anchor: highlight != null && !Array.isArray(highlight) ? highlight : values.length - 1, bold: highlight != null && !Array.isArray(highlight),
top: (i) => (values[i] == null ? null : values[i] >= 0 ? { y: y(values[i]), above: true } : { y: y(values[i]), above: false }) });
};
draw(); watch(el, draw); settle(draw);
}
function stackLine(el, { labels, stacks = [], line = null, format = fmt.int, tickFormat = null, height = 220, highlight = null, ariaLabel = null, tickLabels = null, valueLabels = null, legend = null, onSelect = null }) {
el._fmt = format;
const hueOf = () => css(el, '--chart-1', '#1d5fbf');
const styles = () => { const hue = hueOf(), surface = css(el, '--surface', '#fff'); return stacks.map((_, k) => ({ fill: k === 0 ? hue : mix(el, hue, surface, k === 1 ? 0.42 : 0.24) })); };
const lineStyle = () => ({ stroke: css(el, '--ink', '#111') });
const totals = labels.map((_, i) => { let t = null; stacks.forEach((sk) => { const v = sk.values[i]; if (v != null) t = (t || 0) + v; }); return t; });
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const st = styles(), ls = lineStyle();
const nums = totals.filter((v) => v != null).concat(line ? line.values.filter((v) => v != null) : []);
const hi = Math.max(1, ...nums), lo = Math.min(0, ...nums);
const yt = ticks(lo, hi, 4), tick = tickFormat || format;
const lastLine = line ? line.values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0).at(-1) : -1;
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padB = 26, padR = lastLine >= 0 ? 10 + measure(s, format(line.values[lastLine]), 12, 600) : 0;
const padT = 8 + (valueLabels ? 16 : 0);
const band = (w - padL - padR) / labels.length, bw = Math.max(2, Math.min(band * 0.62, 40));
const x = (i) => padL + band * i + band / 2;
const y = (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
const g = svg('g', {}, s), tl = tickLabels || labels;
const longest = Math.max(...tl.map((l) => String(l).length)), cap = Math.max(2, Math.min(12, Math.floor((w - padL - padR) / (longest * 7 + 16))));
const k = Math.max(1, Math.ceil(labels.length / cap)), anchor = highlight != null ? highlight : labels.length - 1, at = [];
for (let i = anchor % k; i < labels.length; i += k) at.push(i);
axes(g, el, { w: w - padR, h, padL, padB, yt, y, labels: tl, x, band: true, at, tick, boldAt: highlight });
labels.forEach((lab, i) => {
let base = 0;
stacks.forEach((sk, kk) => {
const v = sk.values[i]; if (v == null || v <= 0) return;
const y0 = y(base), y1 = y(base + v); base += v;
if (Math.abs(y0 - y1) < 0.5) return;
const r = paintRect(g, st[kk], x(i) - bw / 2, y1, bw, y0 - y1);
titled(r, `${lab} ${sk.name} ${format(v)}`);
if (onSelect) { r.style.cursor = 'pointer'; r.addEventListener('click', () => onSelect(i, r)); }
});
});
svg('line', { x1: padL, x2: w - padR, y1: y(0), y2: y(0), stroke: css(el, '--axis-ink', '#6b6b6b'), 'stroke-width': 1, opacity: 0.8, 'shape-rendering': 'crispEdges' }, g);
if (line) {
const pts = line.values.map((v, i) => (v == null ? null : [x(i), y(v)]));
const d = pts.reduce((acc, p, i) => (p ? acc + (acc && pts[i - 1] ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) : acc), '');
if (d) svg('path', { d, fill: 'none', stroke: ls.stroke, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
if (lastLine >= 0) text(g, format(line.values[lastLine]), { x: x(lastLine) + 6, y: y(line.values[lastLine]) + 4, 'font-size': 12, 'font-weight': 600, fill: css(el, '--ink', '#111') });
}
s.setAttribute('aria-label', ariaLabel || `${labels[0]} – ${labels.at(-1)}`);
placeValueLabels(valueLabels, { n: labels.length, x, w: w - padR, anchor, bold: highlight != null, top: (i) => (totals[i] == null || totals[i] <= 0 ? null : { y: y(totals[i]), above: true }) });
};
draw(); watch(el, draw); settle(draw);
const st0 = styles(), ls0 = lineStyle();
const items = stacks.map((sk, kk) => ({ label: sk.name, draw: rectSwatch(st0[kk]) })).filter((it, kk) => stacks[kk].values.some((v) => v > 0));
if (line && line.values.some((v) => v != null)) items.push({ label: line.name, w: 16, draw: (sw) => svg('line', { x1: 0, x2: 16, y1: 6, y2: 6, stroke: ls0.stroke, 'stroke-width': 2 }, sw) });
return { legend: legendEl(items, legend) };
}
function stackStyles(el, n) {
const hue = css(el, '--chart-1', '#1d5fbf'), surface = css(el, '--surface', '#fff'), steps = [1, 0.7, 0.48, 0.3, 0.16];
return Array.from({ length: n }, (_, i) => mix(el, hue, surface, steps[Math.min(i, steps.length - 1)]));
}
function stack100(el, parts, { format = fmt.int, height = 12, ariaLabel = null } = {}) {
el.innerHTML = '';
const st = stackStyles(el, parts.length);
const bar = document.createElement('div');
bar.className = 'stack100'; bar.setAttribute('role', 'img');
bar.style.cssText = `display:flex;gap:2px;height:${height}px;border-radius:${height / 2}px;overflow:hidden`;
parts.forEach((p, i) => {
if (!(p.value > 0)) return;
const seg = document.createElement('span');
seg.style.cssText = `flex:${p.value} 1 0px;min-width:2px;background:${st[i]}`;
seg.title = `${p.label} ${format(p.value)}`;
bar.appendChild(seg);
});
bar.setAttribute('aria-label', ariaLabel || parts.map((p) => `${p.label} ${format(p.value)}`).join(', '));
el.appendChild(bar);
return { styles: st };
}
function trackStyles(el) {
const surface = css(el, '--surface', '#fff'), ink = css(el, '--ink', '#111');
return { owed: { fill: css(el, '--chart-1', '#1d5fbf') }, paid: { fill: mix(el, ink, surface, 0.13) }, over: { fill: css(el, '--negative', '#c4242a') } };
}
function track(el, { value, base, scaleMax = null, height = 8, ariaLabel = '' }) {
el.innerHTML = '';
const st = trackStyles(el), mk = (cssText) => { const n = document.createElement('span'); n.style.cssText = cssText; return n; };
const wrap = document.createElement('div');
wrap.className = 'track'; wrap.setAttribute('role', 'img'); if (ariaLabel) wrap.setAttribute('aria-label', ariaLabel);
if (!(base > 0) || value == null || value < 0) { wrap.style.cssText = `height:${height}px`; el.appendChild(wrap); return; }
const over = value > base ? value - base : 0, whole = base + over;
const room = scaleMax ? Math.max(4, (whole / scaleMax) * 100) : 100;
wrap.style.cssText = `position:relative;height:${height}px;width:${room}%`;
const baseW = over ? (base / whole) * 100 : 100;
const t = mk(`position:absolute;left:0;top:0;bottom:0;width:${baseW}%;border-radius:999px;background:${st.paid.fill}`);
const owedPct = (Math.min(value, base) / base) * 100;
if (owedPct > 0) t.appendChild(mk(`position:absolute;left:0;top:0;bottom:0;width:${owedPct}%;min-width:${height}px;border-radius:999px;background:${st.owed.fill}`));
wrap.appendChild(t);
if (over) {
wrap.appendChild(mk(`position:absolute;top:-3px;bottom:-3px;left:${baseW}%;width:1px;background:${css(el, '--ink', '#111')}`));
wrap.appendChild(mk(`position:absolute;top:0;bottom:0;left:calc(${baseW}% + 3px);right:0;min-width:${height}px;border-radius:0 999px 999px 0;background:${st.over.fill}`));
}
el.appendChild(wrap);
}
function trackLegend(el, names, target) {
const st = trackStyles(el);
const items = [{ label: names.owed, draw: rectSwatch(st.owed, 14, 8, 4) }, { label: names.paid, draw: rectSwatch(st.paid, 14, 8, 4) }];
if (names.over) items.push({ label: names.over, draw: rectSwatch(st.over, 14, 8, 4) });
return legendEl(items, target);
}
function flowBars(el, { items, format = fmt.int, tickFormat = null, height = 240, onSelect = null, ariaLabel = null }) {
el._fmt = format;
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const vals = items.map((it) => (it.value == null ? 0 : it.value));
const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
const yt = ticks(lo, hi > lo ? hi : lo + 1, 4), tick = tickFormat || format;
const rows = Math.max(1, ...items.map((it) => (it.lines || []).length));
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padT = 20, padB = 8 + rows * 13 + 6;
const n = items.length, band = (w - padL) / n, bw = Math.max(8, Math.min(band * 0.6, 54));
const x = (i) => padL + band * i + band / 2;
const y = (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
const grid = css(el, '--grid', '#e8e8e8'), ink = css(el, '--ink', '#111'), axis = css(el, '--axis-ink', '#6b6b6b');
const col = { earned: css(el, '--chart-1', '#2f6fdf'), use: css(el, '--negative', '#c4242a'), adj: css(el, '--positive', '#2e7d32'), left: ink };
const surf = css(el, '--surface', '#fff');
const g = svg('g', {}, s);
for (const v of yt) { const yy = y(v); svg('line', { x1: padL, x2: w, y1: yy, y2: yy, stroke: grid, 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, g); text(g, tick(v), { x: padL - 8, y: yy + 4, 'text-anchor': 'end', 'font-size': 12, fill: axis }); }
svg('line', { x1: padL, x2: w, y1: y(0), y2: y(0), stroke: ink, 'stroke-width': 1.5, 'shape-rendering': 'crispEdges' }, g);
const placed = [];
const clash = (b) => placed.some((p) => b.x0 < p.x1 + 2 && b.x1 > p.x0 - 2 && b.y0 < p.y1 + 1 && b.y1 > p.y0 - 1);
items.forEach((it, i) => {
const v = it.value; if (v == null) return;
const cx = x(i), y0 = y(Math.max(0, v)), y1 = y(Math.min(0, v)), hgt = Math.max(1, y1 - y0);
const fillc = col[it.kind] || axis;
if (it.kind === 'left' && v < 0) svg('rect', { x: cx - bw / 2 + 0.75, y: y0 + 0.75, width: bw - 1.5, height: Math.max(0, hgt - 1.5), fill: surf, stroke: col.use, 'stroke-width': 1.5 }, g);
else svg('rect', { x: cx - bw / 2, y: y0, width: bw, height: hgt, fill: fillc, opacity: it.kind === 'left' ? 0.85 : 1 }, g);
if (it.text) {
const size = 11, tw = measure(s, it.text, size, 600);
const out = v >= 0 ? { x0: cx - tw / 2, x1: cx + tw / 2, y0: y0 - 4 - size, y1: y0 - 4 } : { x0: cx - tw / 2, x1: cx + tw / 2, y0: y1 + 3, y1: y1 + 3 + size };
const inside = v >= 0 ? { x0: cx - tw / 2, x1: cx + tw / 2, y0: y0 + 3, y1: y0 + 3 + size } : { x0: cx - tw / 2, x1: cx + tw / 2, y0: y1 - 3 - size, y1: y1 - 3 };
const step = (k) => (v >= 0 ? { x0: out.x0, x1: out.x1, y0: out.y0 - k * (size + 2), y1: out.y1 - k * (size + 2) } : { x0: out.x0, x1: out.x1, y0: out.y0 + k * (size + 2), y1: out.y1 + k * (size + 2) });
let b = null, fillT = ink;
for (let k = 0; k < 3 && !b; k++) { const o = step(k); if (!clash(o) && o.y0 >= 2 && o.y1 <= h - padB) b = o; }
if (!b && tw <= bw - 2 && hgt >= size + 6 && !clash(inside) && !(it.kind === 'left' && v < 0)) { b = inside; fillT = surf; }
const opp = v >= 0 ? { x0: out.x0, x1: out.x1, y0: y(0) + 3, y1: y(0) + 3 + size } : { x0: out.x0, x1: out.x1, y0: y(0) - 4 - size, y1: y(0) - 4 };
if (!b && !clash(opp) && opp.y0 >= 2 && opp.y1 <= h - padB) b = opp;
if (b) { placed.push(b); text(g, it.text, { x: cx, y: b.y1 - 1, 'text-anchor': 'middle', 'font-size': size, 'font-weight': 600, fill: fillT }); }
}
(it.lines || []).forEach((ln, k) => text(g, fit(s, ln, band + 6, 11), { x: cx, y: h - padB + 8 + 11 + k * 13, 'text-anchor': 'middle', 'font-size': 11, fill: it.kind === 'use' ? ink : axis }));
});
const tip = tooltip(el);
items.forEach((it, i) => {
const hit = svg('rect', { x: padL + band * i, y: padT, width: band, height: h - padT - padB + rows * 13 + 8, fill: 'transparent' }, s);
if (onSelect && it.select) { hit.style.cursor = 'pointer'; hit.addEventListener('click', () => onSelect(i, el)); }
hit.addEventListener('pointermove', (ev) => { const r = s.getBoundingClientRect(); tip.innerHTML = '<div style="opacity:.7">' + (it.tip || (it.lines || []).join(' ')) + '</div><div><b style="font-weight:600">' + (it.value == null ? '–' : format(it.value)) + '</b></div>'; const left = Math.min(((x(i) / w) * r.width) + 10, r.width - tip.offsetWidth - 4); tip.style.left = Math.max(0, left) + 'px'; tip.style.top = '0px'; tip.style.opacity = 1; });
hit.addEventListener('pointerleave', () => { tip.style.opacity = 0; });
});
s.setAttribute('aria-label', ariaLabel || items.map((it) => (it.tip || (it.lines || []).join(' ')) + ' ' + format(it.value)).join(', '));
};
draw(); watch(el, draw); settle(draw);
}
function levels(el, { labels, tickLabels = null, units, names = {}, format = fmt.int, tickFormat = null, height = 240, xAt = null, hi = null, ariaLabel = null, empty = '–', buyTone = '--ink', paidTone = '--chart-1' }) {
el._fmt = format;
const RING = 1.5, ok = (v) => v != null && Number.isFinite(v), amt = (v) => (ok(v) ? v : 0), moved = (v) => Math.abs(amt(v)) >= 0.5;
const shape = (parent, kind, cx, cy, r, fill) => {
if (kind === 'diamond') { const d = r * 1.3; return svg('path', { d: `M${cx.toFixed(1)} ${(cy - d).toFixed(1)}L${(cx + d).toFixed(1)} ${cy.toFixed(1)}L${cx.toFixed(1)} ${(cy + d).toFixed(1)}L${(cx - d).toFixed(1)} ${cy.toFixed(1)}Z`, fill }, parent); }
return svg('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r, fill }, parent);
};
const mark = (parent, kind, fill, ring, cx, cy, r, rw = RING) => { if (rw) shape(parent, kind, cx, cy, r + rw, ring); return shape(parent, kind, cx, cy, r, fill); };
const draw = () => {
const { s, w, h } = frame(el, heightOf(height));
const ink = css(el, buyTone, '#111'), blue = css(el, paidTone, '#2f6fdf'), axisInk = css(el, '--axis-ink', '#6b6b6b'), ring = css(el, '--surface', '#fff');
const n = labels.length, tick = tickFormat || format;
const lv = units.flatMap((u) => (u ? [u.start, u.start + amt(u.buy), u.start + amt(u.buy) + amt(u.gap), u.end] : [])).filter(ok);
if (!lv.length) { s.setAttribute('aria-label', ariaLabel || ''); return; }
let lo = Math.min(...lv), top = Math.max(...lv);
const span0 = Math.max(Math.abs(top) * 0.02, 10000);
if (top - lo < span0) { const mid = (top + lo) / 2; lo = mid - span0 / 2; top = mid + span0 / 2; }
const pad = (top - lo) * 0.03, yt = [4, 5, 6].map((c) => ticks(lo - pad, top + pad, c)).reduce((a, b) => (b.at(-1) - b[0] < a.at(-1) - a[0] && b.length <= 7 ? b : a));
const padL = 12 + Math.max(...yt.map((v) => measure(s, tick(v), 12))), padB = 26, padT = 10;
const band = (w - padL) / Math.max(1, n), x = (i) => padL + band * i + band / 2;
const y = (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
const R = Math.max(2.5, Math.min(3.8, band * 0.32)), gapX = Math.min(band * 0.28, 7);
const g = svg('g', {}, s);
if (hi != null && hi >= 0 && hi < n) svg('rect', { x: x(hi) - band / 2, y: padT, width: band, height: h - padT - padB, fill: css(el, '--sel-col', '#eef3fb') }, g);
const tl = tickLabels || labels, kept = [];
const at = xPicks(tl, w - padL, xAt).sort((a, b) => (a === hi ? -1 : b === hi ? 1 : a - b)).filter((i) => {
const tw = measure(s, String(tl[i]), 12, i === hi ? 600 : 400), l = Math.max(0, Math.min(w - tw, x(i) - tw / 2)), b = [l, l + tw];
if (!kept.every((q) => b[1] + 6 <= q[0] || b[0] >= q[1] + 6)) return false;
kept.push(b); return true;
}).sort((a, b) => a - b);
axes(g, el, { w, h, padL, padB, yt, y, labels: tl, x, band: true, at, tick, boldAt: hi });
const steps = units.map((u, i) => {
if (!u) return null;
const list = [['buy', amt(u.buy)], ['gap', amt(u.gap)], ['paid', -amt(u.paid)]].filter((m) => Math.abs(m[1]) >= 0.5);
let lvl = u.start;
return list.map((m, j) => { const from = lvl; lvl += m[1]; return { kind: m[0], x: x(i) + (j - (list.length - 1) / 2) * gapX, from, to: lvl }; });
});
let d = '', open = false;
units.forEach((u, i) => {
if (!u) { open = false; return; }
d += (open ? 'L' : 'M') + (x(i) - band / 2).toFixed(1) + ' ' + y(u.start).toFixed(1);
for (const st of steps[i]) d += 'L' + st.x.toFixed(1) + ' ' + y(st.from).toFixed(1) + 'L' + st.x.toFixed(1) + ' ' + y(st.to).toFixed(1);
d += 'L' + (x(i) + band / 2).toFixed(1) + ' ' + y(u.end).toFixed(1);
open = true;
});
if (d) svg('path', { d, fill: 'none', stroke: axisInk, 'stroke-width': 1.25, 'stroke-linejoin': 'round', opacity: 0.85 }, g);
const all = steps.flatMap((list) => list || []);
for (const st of all) if (st.kind !== 'gap') svg('line', { x1: st.x.toFixed(1), x2: st.x.toFixed(1), y1: y(st.from).toFixed(1), y2: y(st.to).toFixed(1), stroke: st.kind === 'buy' ? ink : blue, 'stroke-width': 2.5 }, g);
for (const st of all) if (st.kind === 'buy') mark(g, 'dot', ink, ring, st.x, y(st.to), R);
for (const st of all) if (st.kind === 'paid') mark(g, 'diamond', blue, ring, st.x, y(st.to), R);
const rule = svg('line', { y1: padT, y2: h - padB, stroke: axisInk, 'stroke-width': 1, opacity: 0, 'shape-rendering': 'crispEdges' }, g);
const fx = svg('g', {}, s);
const tip = tooltip(el), hit = svg('rect', { x: padL, y: 0, width: Math.max(0, w - padL), height: h, fill: 'transparent' }, s);
const idx = (ev) => { const r = s.getBoundingClientRect(), px = ((ev.clientX - r.left) / Math.max(1, r.width)) * w; return Math.max(0, Math.min(n - 1, Math.floor((px - padL) / band))); };
const key = (draw1) => { const k = svg('svg', { width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': 'true' }); k.style.cssText = 'display:inline-block;margin-right:5px;overflow:visible'; draw1(k); return k; };
const hide = () => { tip.style.opacity = 0; rule.setAttribute('opacity', 0); fx.replaceChildren(); };
const show = (i) => {
const u = units[i];
if (!u) { hide(); return; }
rule.setAttribute('x1', x(i)); rule.setAttribute('x2', x(i)); rule.setAttribute('opacity', 0.35);
fx.replaceChildren();
for (const st of steps[i]) { if (st.kind === 'buy') mark(fx, 'dot', ink, ring, st.x, y(st.to), R + 1.5); else if (st.kind === 'paid') mark(fx, 'diamond', blue, ring, st.x, y(st.to), R + 1.5); }
if (!steps[i].length) mark(fx, 'dot', axisInk, ring, x(i), y(u.end), 2.5);
tip.replaceChildren();
const head = document.createElement('div'); head.style.opacity = '0.7'; head.textContent = labels[i]; tip.appendChild(head);
const row = (k, name, text) => { const div = document.createElement('div'), b = document.createElement('b'); b.style.fontWeight = '600'; b.textContent = text; div.append(k, document.createTextNode(name + ' '), b); tip.appendChild(div); };
row(key((k) => mark(k, 'dot', ink, ring, 5, 5, 3.5, 0)), names.buy || '', moved(u.buy) ? format(u.buy) : empty);
row(key((k) => mark(k, 'diamond', blue, ring, 5, 5, 3.5, 0)), names.paid || '', moved(u.paid) ? format(u.paid) : empty);
row(key((k) => svg('line', { x1: 0, x2: 10, y1: 5, y2: 5, stroke: axisInk, 'stroke-width': 1.5 }, k)), names.end || '', format(u.end));
const r = s.getBoundingClientRect(), left = Math.min((x(i) / w) * r.width + 12, r.width - tip.offsetWidth - 4);
tip.style.left = `${Math.max(0, left)}px`; tip.style.top = '0px'; tip.style.opacity = 1;
};
el._lvHide = hide;
hit.addEventListener('pointermove', (ev) => show(idx(ev)));
hit.addEventListener('pointerdown', (ev) => show(idx(ev)));
hit.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse') hide(); });
hit.addEventListener('pointercancel', hide);
s.setAttribute('aria-label', ariaLabel || `${names.end || ''}, ${labels[0]} – ${labels.at(-1)}`);
};
draw(); watch(el, draw); settle(draw);
if (!el._lvAway) {
el._lvAway = (ev) => { if (!el.isConnected) { document.removeEventListener('pointerdown', el._lvAway, true); return; } if (!el.contains(ev.target) && el._lvHide) el._lvHide(); };
document.addEventListener('pointerdown', el._lvAway, true);
}
}
function watch(el, draw) { if (!('ResizeObserver' in window)) return; let w = el.clientWidth; new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; draw(); } }).observe(el); }
window.Charts = { line, diverging, ticks, fmt, columns, stackLine, stack100, stackStyles, track, trackStyles, trackLegend, legendEl, placeValueLabels, flowBars, levels };
})();
(function (root) {
var L = root.Ledger = root.Ledger || {};
var F = L.fmt, C = L.copy;
var DASH = F.DASH;
function esc(s) {
return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function icon(name, cls) { return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>'; }
function tone(delta, good) {
if (!F.isNum(delta) || delta === 0 || !good) return '';
return (delta > 0) === (good === 'up') ? 'good' : 'bad';
}
function num(x, unit, opts) {
opts = opts || {};
var value = x && typeof x === 'object' && 'value' in x ? x.value : x;
var v = x && typeof x === 'object' && 'v' in x && x.v ? x.v : (opts.v || 'ui:' + (opts.name || 'value'));
var u = unit, text, title = '', note = '';
if (unit === 'man' && opts.units === 'won') u = 'won';
switch (u) {
case 'man': text = F.man(value, { sign: opts.sign }); title = F.isNum(value) ? F.won(value) : ''; note = F.exactNote(value); break;
case 'won': text = F.won(value, { sign: opts.sign }); break;
case 'digits': text = F.digits(value, { sign: opts.sign }); u = 'won'; break;
case 'pct': text = F.pct(value, opts.d, { sign: opts.sign }); break;
case 'pp': text = F.pp(value); break;
case 'share': text = F.share(value); break;
case 'short': text = F.short(value); title = F.isNum(value) ? F.won(value) : ''; break;
case 'pct0': text = F.pct0(value); break;
case 'month': text = F.month(value, opts.refYear ? { refYear: opts.refYear } : undefined); break;
case 'date': text = F.date(value, { refYear: opts.refYear }); break;
case 'days': text = F.days(value); break;
case 'count': text = F.count(value, opts.word); u = 'n'; break;
default: text = String(value);
}
var missing = value == null || value === '' || (typeof value === 'number' && !Number.isFinite(value));
var cls = 'num' + (opts.cls ? ' ' + opts.cls : '') + (missing ? ' dash' : '') + (opts.tone ? ' ' + opts.tone : '');
var raw = missing ? '' : String(value);
return '<data class="' + cls + '" value="' + esc(raw) + '" data-v="' + esc(v) + '" data-u="' + u + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' +
(missing ? '<span aria-hidden="true">' + DASH + '</span><span class="sr-only">없음</span>' : esc(text)) +
(note ? '<span class="sr-only"> (' + esc(note) + ')</span>' : '') + '</data>';
}
function delta(x, unit, good, opts) {
var value = x && typeof x === 'object' ? x.value : x;
return num(x, unit, Object.assign({ sign: true, tone: tone(value, good) }, opts || {}));
}
function pill(text, kind) { return '<span class="pill' + (kind ? ' ' + kind : '') + '">' + esc(text) + '</span>'; }
function status(kind, text) { return statusHtml(kind, esc(text)); }
function statusHtml(kind, html) {
var ic = kind === 'ok' ? 'check' : kind === 'fail' ? 'x' : kind === 'none' ? 'info' : 'alert';
return '<span class="status ' + kind + '">' + icon(ic) + '<span>' + html + '</span></span>';
}
function notice(kind, html, action) {
var ic = kind === 'warn' ? 'alert' : kind === 'bad' ? 'x' : 'info';
return '<div class="notice ' + kind + '" role="' + (kind === 'info' ? 'note' : 'status') + '">' + icon(ic) + '<div>' + html + '</div>' + (action || '') + '</div>';
}
function emptyBlock(text) { return '<p class="empty">' + esc(text) + '</p>'; }
function blockError(text, retry) {
return '<div class="empty" role="alert">' + esc(text) + (retry ? ' <button class="card-link" type="button" data-action="retry">' + esc(C.states.error.retry) + '</button>' : '') + '</div>';
}
function asTable(caption, head, rows) {
return '<details class="as-table"><summary>표로 보기</summary><div class="table-wrap"><table><caption class="sr-only">' + esc(caption) + '</caption><thead><tr>' +
head.map(function (h, i) { return '<th' + (i ? ' class="n"' : '') + ' scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td class="n">' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') +
'</tbody></table></div></details>';
}
function applyWidths(rootEl) {
var els = rootEl.querySelectorAll('[data-w]');
for (var i = 0; i < els.length; i++) els[i].style.width = Math.max(0, Math.min(100, Number(els[i].getAttribute('data-w')) || 0)) + '%';
}
function skTitle(title) {
return '<div class="title-row"><div><h1 tabindex="-1">' + esc(title) + '</h1><p class="sub muted">' + esc(C.states.loading) + '…</p></div></div>';
}
function skPanel(cls, title, body) {
return '<section class="panel ' + cls + '" aria-busy="true"><header><h2>' + esc(title) + '</h2></header>' + body + '</section>';
}
function skRows(n) { var s = ''; for (var i = 0; i < n; i++) s += '<span class="sk line"></span>'; return s; }
function skeleton(screen, labelOf) {
var nav = {}; C.nav.forEach(function (n) { nav[n.id] = labelOf ? labelOf(n.id) : n.label; });
var t = screen === 'debt-detail' ? nav.debts : (nav[screen] || nav.overview);
var h = skTitle(t);
if (screen === 'overview' || !nav[screen]) {
h += '<div class="grid ov">' +
skPanel('c8 o-debt', nav.debts, '<div class="lead"><span class="sk lead"></span></div><span class="sk bar gap"></span>' + skRows(4)) +
skPanel('c4 o-month', '이번 달 가게별 손익', skRows(5)) +
skPanel('c8 o-chart', '영업이익', '<span class="sk chart"></span>') +
skPanel('c4 o-review', nav.review, skRows(4)) +
skPanel('c8 o-tax', '세금 낼 것', skRows(3)) +
skPanel('c4 o-checks', '자료 점검', skRows(3)) + '</div>';
} else if (screen === 'pnl') {
h += '<div class="kpis" aria-busy="true">' + [1, 2, 3, 4, 5, 6].map(function () { return '<div class="kpi"><span class="kpi-label"><span class="sk t w6"></span></span><span class="kpi-value"><span class="sk kpi"></span></span></div>'; }).join('') + '</div>' +
'<div class="grid mt">' + skPanel('c12', '월별', '<span class="sk chart"></span>') + '</div>';
} else {
h += '<div class="grid">' + skPanel('c12', t, skRows(6)) + '</div>';
}
return h + '<p class="sr-only" role="status">' + esc(C.states.loading) + '</p>';
}
function stateScreen(o) {
return '<div class="title-row"><div><h1 tabindex="-1">' + esc(o.title) + '</h1></div></div>' +
'<section class="state" aria-live="polite"><p>' + esc(o.body) + '</p>' + (o.extra || '') +
(o.actions && o.actions.length ? '<div class="row-actions">' + o.actions.map(function (a) {
return '<button type="button" class="btn' + (a.primary ? ' primary' : '') + '" data-action="' + esc(a.action) + '">' + esc(a.label) + '</button>';
}).join(' ') + '</div>' : '') + (o.after || '') + '</section>';
}
L.ui = { esc: esc, icon: icon, tone: tone, num: num, delta: delta, pill: pill, status: status, statusHtml: statusHtml, notice: notice, emptyBlock: emptyBlock, blockError: blockError, asTable: asTable, applyWidths: applyWidths, skeleton: skeleton, stateScreen: stateScreen };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
'use strict';
var L = root.Ledger = root.Ledger || {};
var st = { db: null, unsub: null, ready: false, readOnly: false, error: null, items: {}, onChange: null, editing: null, pending: false, busy: {}, tab: {}, msg: null };
function hash(s) {
var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
for (var i = 0, ch; i < s.length; i++) { ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function idOf(key) { return 'i-' + hash(String(key)); }
function esc(s) { return L.ui ? L.ui.esc(s) : String(s == null ? '' : s); }
function nowIso() { return new Date().toISOString(); }
function shortDate(iso) { var d = new Date(iso); return isNaN(d) ? '' : (d.getMonth() + 1) + '/' + d.getDate(); }
function init(db, onChange) {
if (!db || st.unsub) return;
st.db = db; st.onChange = onChange;
if (!st.timer) st.timer = setInterval(function () { if (st.pending) changed(); }, 1500);
try {
st.unsub = db.collection('inbox').onSnapshot(function (snap) {
var items = {};
snap.docs.forEach(function (d) { var b = d.data(); if (b && typeof b.key === 'string') items[b.key] = Object.assign({ _id: d.id }, b); });
st.items = items; st.ready = true; st.error = null;
changed();
}, function (e) { st.unsub = null; st.ready = false; st.error = e; changed(); });
} catch (e) { st.error = e; }
}
function changed() {
if (st.editing || (L.pop && L.pop.isOpen && L.pop.isOpen())) { st.pending = true; return; }
st.pending = false;
if (st.onChange) st.onChange();
}
function on() { return !!(st.db && st.ready && !st.readOnly); }
function item(key) { return st.items[key] || null; }
function stateOf(key) { var it = item(key); return it ? it.state || 'open' : 'open'; }
function shown(key) { return stateOf(key) === 'open'; }
function doneList(scope) {
return Object.keys(st.items).map(function (k) { return st.items[k]; }).filter(function (it) { return it.state === 'done' && (!scope || it.scope === scope); })
.sort(function (a, b) { return String(b.doneAt || '').localeCompare(String(a.doneAt || '')); });
}
function memos(scope) {
return Object.keys(st.items).map(function (k) { return st.items[k]; }).filter(function (it) { return it.kind === 'memo' && (it.state || 'open') === 'open' && (!scope || it.scope === scope); })
.sort(function (a, b) { return String(b.memoAt || '').localeCompare(String(a.memoAt || '')); });
}
function write(key, patch, meta) {
if (!st.db) return Promise.reject(new Error('자료함이 없어요'));
if (st.busy[key]) return st.busy[key].then(function () { return write(key, patch, meta); });
var ref = st.db.collection('inbox').doc(idOf(key)), cur = item(key), body = Object.assign({}, patch, { updatedAt: nowIso() });
var p = (cur ? ref.update(body) : ref.set(Object.assign({ key: key, scope: (meta && meta.scope) || '', kind: (meta && meta.kind) || 'issue', label: (meta && meta.label) || '', state: 'open', memo: '' }, body)))
.then(function (x) { st.msg = null; return x; }, function (e) {
if (e && e.code === 'invalid_argument') { st.readOnly = true; st.msg = '이 화면에서는 표시를 남길 수 없어요(읽기만 돼요).'; }
else st.msg = '저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.';
changedNow();
throw e;
});
st.busy[key] = p.then(function () { delete st.busy[key]; }, function () { delete st.busy[key]; });
return p;
}
function changedNow() { st.pending = false; if (st.onChange) st.onChange(); }
function attrs(key, meta) {
return ' data-ib-key="' + esc(key) + '" data-ib-scope="' + esc(meta.scope || '') + '" data-ib-kind="' + esc(meta.kind || 'issue') + '" data-ib-label="' + esc(String(meta.label || '').slice(0, 240)) + '"';
}
function controls(key, meta) {
if (!on()) return '';
var it = item(key), hasMemo = it && it.memo;
return '<span class="ib-acts">' +
'<button type="button" class="ib-btn ib-done" data-ib="done"' + attrs(key, meta) + ' title="확인했어요 → 완료로 옮겨요"><span aria-hidden="true">✓</span> 확인</button>' +
'<button type="button" class="ib-btn" data-ib="memo"' + attrs(key, meta) + ' aria-expanded="false">' + (hasMemo ? '메모 고치기' : '메모') + '</button></span>';
}
function extras(key) {
var it = item(key);
if (!it || !(it.memo || it.reply)) return '';
var out = '<div class="ib-thread">';
if (it.memo) out += '<p class="ib-line ib-mine"><span class="ib-who">내 메모</span>' + esc(it.memo) + (it.memoAt ? ' <span class="muted">· ' + esc(shortDate(it.memoAt)) + '</span>' : '') + '</p>';
if (it.reply && (!it.memoAt || !it.replyAt || it.replyAt >= it.memoAt)) out += '<p class="ib-line ib-claude"><span class="ib-who">Claude</span>' + esc(it.reply) + (it.replyAt ? ' <span class="muted">· ' + esc(shortDate(it.replyAt)) + '</span>' : '') + '</p>';
else if (it.memo) out += '<p class="ib-line muted">Claude 가 다음 갱신 때 읽고 여기에 답을 적어요.</p>';
return out + '</div>';
}
function tabs(scope, openCount) {
if (!on()) return '';
var done = doneList(scope).length, cur = st.tab[scope] || 'open';
return '<div class="segmented ib-tabs" role="group" aria-label="할 일 · 완료">' +
'<button type="button" data-ib-tab="open" data-ib-scope="' + esc(scope) + '" aria-pressed="' + (cur === 'open') + '">할 일' + (openCount != null ? ' ' + openCount : '') + '</button>' +
'<button type="button" data-ib-tab="done" data-ib-scope="' + esc(scope) + '" aria-pressed="' + (cur === 'done') + '">완료 ' + done + '</button></div>';
}
function tabOf(scope) { return on() && st.tab[scope] === 'done' ? 'done' : 'open'; }
function donePanel(scope) {
var list = doneList(scope);
if (!list.length) return '<p class="muted">완료로 옮긴 것이 없어요. 할 일에서 [확인]을 누르면 여기로 와요.</p>';
return '<ul class="ib-done-list">' + list.map(function (it) {
return '<li class="ib-done-item"><div class="ib-done-main"><span class="ib-check" aria-hidden="true">✓</span><span>' + esc(it.label || it.memo || '') + '</span>' +
(it.doneAt ? ' <span class="muted">· ' + esc(shortDate(it.doneAt)) + ' 확인</span>' : '') + '</div>' + extras(it.key) +
'<span class="ib-acts"><button type="button" class="ib-btn" data-ib="undo" data-ib-key="' + esc(it.key) + '">되돌리기</button>' +
'<button type="button" class="ib-btn ib-del" data-ib="delete" data-ib-key="' + esc(it.key) + '">지우기</button></span></li>';
}).join('') + '</ul>';
}
function memoBox(scope) {
if (!on()) return '';
var list = memos(scope);
var rows = list.map(function (it) {
return '<li class="ib-memo-item" data-ib-item="' + esc(it.key) + '">' + extras(it.key) +
'<span class="ib-acts"><button type="button" class="ib-btn ib-done" data-ib="done" data-ib-key="' + esc(it.key) + '"><span aria-hidden="true">✓</span> 확인</button>' +
'<button type="button" class="ib-btn" data-ib="memo"' + attrs(it.key, { scope: scope, kind: 'memo', label: '' }) + ' aria-expanded="false">고치기</button></span></li>';
}).join('');
return '<div class="ib-memos">' + (rows ? '<h3 class="set-sub">내 메모</h3><ul class="ib-memo-list">' + rows + '</ul>' : '') +
'<div class="ib-new"><label class="ib-new-label" for="ib-new-' + esc(scope) + '">메모 남기기 <span class="muted">— Claude 가 다음 갱신 때 읽고 해결하거나 답을 적어요</span></label>' +
'<textarea id="ib-new-' + esc(scope) + '" class="ib-text" rows="2" maxlength="600" placeholder="예: 9월 수도는 10월 2일에 현금으로 냈어요" data-ib-new="' + esc(scope) + '"></textarea>' +
'<div class="ib-row"><button type="button" class="btn" data-ib="new" data-ib-scope="' + esc(scope) + '">남기기</button></div></div></div>';
}
function message() { return st.msg ? '<p class="note warn ib-msg" role="status">' + esc(st.msg) + '</p>' : ''; }
function keepFrom(el) { if (L.app && L.app.keep) L.app.keep(el); }
function openEditor(btn) {
var host = btn.closest('[data-ib-item]') || btn.closest('li, .row');
if (!host) return;
var key = btn.getAttribute('data-ib-key'), next = host.nextElementSibling;
if (next && next.classList.contains('ib-editor')) { next.remove(); btn.setAttribute('aria-expanded', 'false'); st.editing = null; return; }
var it = item(key);
var box = document.createElement(host.tagName === 'LI' ? 'li' : 'div');
box.className = 'ib-editor';
box.innerHTML = '<label class="sr-only" for="ib-ed">메모</label><textarea id="ib-ed" class="ib-text" rows="2" maxlength="600" placeholder="이 항목에 대해 적어 주세요. Claude 가 다음 갱신 때 읽어요."></textarea>' +
'<div class="ib-row"><button type="button" class="btn" data-ib="save">저장</button> <button type="button" class="btn ghost" data-ib="cancel">그만두기</button>' +
(it && it.memo ? ' <button type="button" class="btn ghost" data-ib="clear">메모 지우기</button>' : '') + '</div>';
['data-ib-key', 'data-ib-scope', 'data-ib-kind', 'data-ib-label'].forEach(function (a) { var v = btn.getAttribute(a); if (v != null) box.setAttribute(a, v); });
host.parentNode.insertBefore(box, host.nextSibling);
var ta = box.querySelector('textarea'); ta.value = it && it.memo ? it.memo : ''; ta.focus();
btn.setAttribute('aria-expanded', 'true');
st.editing = key;
}
function metaOf(el) { return { scope: el.getAttribute('data-ib-scope') || '', kind: el.getAttribute('data-ib-kind') || 'issue', label: el.getAttribute('data-ib-label') || '' }; }
function onClick(e) {
var tb = e.target.closest('[data-ib-tab]');
if (tb) { keepFrom(tb); st.tab[tb.getAttribute('data-ib-scope')] = tb.getAttribute('data-ib-tab'); changedNow(); return; }
var b = e.target.closest('[data-ib]');
if (!b) return;
var act = b.getAttribute('data-ib'), key = b.getAttribute('data-ib-key');
if (act === 'memo') { openEditor(b); return; }
if (act === 'cancel') { var ed0 = b.closest('.ib-editor'); if (ed0) ed0.remove(); st.editing = null; if (st.pending) changed(); return; }
if (act === 'save' || act === 'clear') {
var ed = b.closest('.ib-editor'), k = ed.getAttribute('data-ib-key'), text = act === 'clear' ? '' : String(ed.querySelector('textarea').value || '').trim().slice(0, 600);
if (act === 'save' && !text) { ed.querySelector('textarea').focus(); return; }
keepFrom(ed); st.editing = null; b.disabled = true;
write(k, { memo: text, memoAt: text ? nowIso() : null }, metaOf(ed)).then(function () { if (L.app && L.app.announce) L.app.announce(text ? '메모를 남겼어요.' : '메모를 지웠어요.'); }, function () { b.disabled = false; });
return;
}
if (act === 'new') {
var scope = b.getAttribute('data-ib-scope'), ta = document.querySelector('[data-ib-new="' + (window.CSS && CSS.escape ? CSS.escape(scope) : scope) + '"]');
var t = ta ? String(ta.value || '').trim().slice(0, 600) : '';
if (!t) { if (ta) ta.focus(); return; }
keepFrom(b); b.disabled = true;
var at = nowIso();
write('memo|' + scope + '|' + at, { memo: t, memoAt: at }, { scope: scope, kind: 'memo', label: '' }).then(function () { if (L.app && L.app.announce) L.app.announce('메모를 남겼어요. Claude 가 다음 갱신 때 읽어요.'); }, function () { b.disabled = false; });
return;
}
if (!key) return;
keepFrom(b); b.disabled = true;
var patch = act === 'done' ? { state: 'done', doneAt: nowIso() } : act === 'undo' ? { state: 'open' } : act === 'delete' ? { state: 'deleted', deletedAt: nowIso() } : null;
if (!patch) return;
write(key, Object.assign(patch, act === 'done' && b.getAttribute('data-ib-label') ? { label: b.getAttribute('data-ib-label') } : {}), metaOf(b))
.then(function () { if (L.app && L.app.announce) L.app.announce(act === 'done' ? '완료로 옮겼어요.' : act === 'undo' ? '할 일로 되돌렸어요.' : '지웠어요.'); }, function () { b.disabled = false; });
}
if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('click', onClick);
L.inbox = { init: init, on: on, ready: function () { return st.ready; }, idOf: idOf, keyHash: hash, stateOf: stateOf, shown: shown, item: item, controls: controls, extras: extras,
tabs: tabs, tabOf: tabOf, donePanel: donePanel, doneList: doneList, memoBox: memoBox, memos: memos, message: message, _state: st };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
'use strict';
var L = root.Ledger = root.Ledger || {};
L.adapters = L.adapters || {};
var KIND = 'ledger-owner', FILE_SCHEMA = 1;
var KEY_SHARE = 'ledger.graph.share', KEY_LOOP = 'ledger.graph.redirectAt', DB_NAME = 'ledger', STORE = 'kv', CACHE_KEY = 'graph:last';
var LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/i;
var LINK_HOST = /^(1drv\.ms|onedrive\.live\.com|([a-z0-9-]+\.)*onedrive\.com|([a-z0-9-]+\.)*sharepoint\.com)$/i;
var REDIRECT_CODES = ['interaction_required', 'consent_required', 'login_required', 'no_tokens_found', 'monitor_window_timeout', 'timed_out', 'token_renewal_error', 'no_account_error', 'refresh_token_expired', 'bad_token'];
function G() { return (L.copy && L.copy.graph) || {}; }
function say(code, vars) { var e = G().err || {}, s = e[code] || code; return L.tpl ? L.tpl(s, vars || {}) : s; }
function uerr(code, vars, extra) {
var m = say(code, vars), e = new Error(m);
e.userMessage = m; e.code = code;
if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) e[k] = extra[k];
return e;
}
function kv(kind, k, v) {
var s = null;
try { s = root[kind] || null; } catch (e) { return null; }
if (!s) return null;
try { if (v === undefined) return s.getItem(k); if (v === null) s.removeItem(k); else s.setItem(k, v); } catch (e) { }
return null;
}
var dbp = null;
function idb() {
if (dbp) return dbp;
dbp = new Promise(function (resolve, reject) {
var f = null; try { f = root.indexedDB || null; } catch (e) { f = null; }
if (!f) { reject(new Error('IndexedDB 없음')); return; }
var r; try { r = f.open(DB_NAME, 1); } catch (e) { reject(e); return; }
r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
r.onsuccess = function () { var d = r.result; d.onversionchange = function () { try { d.close(); } catch (x) { } dbp = null; }; resolve(d); };
r.onerror = function () { reject(r.error); };
}).then(null, function (e) { dbp = null; throw e; });
return dbp;
}
function idbOp(mode, fn) {
return idb().then(function (d) {
return new Promise(function (res, rej) {
var tx = d.transaction(STORE, mode), q = fn(tx.objectStore(STORE));
tx.oncomplete = function () { res(q && q.result); }; tx.onerror = function () { rej(tx.error); }; tx.onabort = function () { rej(tx.error); };
});
});
}
var cache = {
get: function (k) { return idbOp('readonly', function (s) { return s.get(k); }).then(function (v) { return v == null ? null : v; }, function () { return null; }); },
set: function (k, v) { return idbOp('readwrite', function (s) { return s.put(v, k); }).then(null, function () { return null; }); },
del: function (k) { return idbOp('readwrite', function (s) { return s['delete'](k); }).then(null, function () { return null; }); }
};
function hostOf() { var l = root.location || {}; return l.hostname || String(l.origin || '').replace(/^[a-z]+:\/\//i, '').replace(/:\d+$/, ''); }
function pageDir() { var l = root.location || {}; return l.origin ? l.origin + String(l.pathname || '/').replace(/[^/]*$/, '') : ''; }
function cfg(params) {
var c = Object.assign({
clientId: '', authority: 'https://login.microsoftonline.com/consumers',
scopes: ['Files.Read', 'Files.Read.All', 'User.Read'],
redirectUri: '', silentRedirectUri: '',
graphBase: 'https://graph.microsoft.com/v1.0',
folder: '가게장부', file: '장부자료.json', pollMs: 120000, maxBytes: 20 * 1024 * 1024
}, (root.LEDGER_CONFIG && root.LEDGER_CONFIG.graph) || {});
if (!c.redirectUri) c.redirectUri = pageDir();
if (!c.silentRedirectUri) c.silentRedirectUri = String(c.redirectUri).replace(/[^/]*$/, '') + 'blank.html';
var mb = params && params.get ? params.get('mockBase') : null;
if (params && params.get && params.get('mock') === '1' && LOCAL_HOST.test(hostOf())) {
c.mock = true;
c.graphBase = (mb && /^http:\/\/(127\.0\.0\.1|localhost):\d{2,5}$/.test(mb) ? mb : 'http://127.0.0.1:5174') + '/v1.0';
}
return c;
}
function pickLink(input) {
var s = String(input == null ? '' : input).trim();
if (!s) throw uerr('linkEmpty');
var m = /https:\/\/[A-Za-z0-9\-._~:/?#@!$&*+,;=%]+/i.exec(s);
if (!m) throw uerr('linkBad');
var url = m[0].replace(/[.,;:!?]+$/, ''), h = /^https:\/\/([^/?#:@]+)(?::\d+)?(?:[/?#]|$)/i.exec(url);
if (!h || !LINK_HOST.test(h[1])) throw uerr('linkBad');
return url;
}
function shareToken(link) {
var b = root.btoa(unescape(encodeURIComponent(link)));
return 'u!' + b.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-');
}
function verify(text, maxBytes) {
var S = L.Snapshot, doc;
if (text.length > maxBytes) return Promise.reject(uerr('tooBig'));
try { doc = JSON.parse(text); } catch (e) { return Promise.reject(uerr('corrupt')); }
if (!doc || typeof doc !== 'object' || doc.kind !== KIND) return Promise.reject(uerr('kind'));
if (doc.schema !== FILE_SCHEMA) return Promise.reject(uerr('schema'));
if (!S.isSnapshot(doc.snapshot)) return Promise.reject(uerr('corrupt'));
var snap = doc.snapshot;
return S.sha256Hex(JSON.stringify(snap)).then(function (hex) {
if (!doc.sha256 || hex !== String(doc.sha256).toLowerCase()) throw uerr('mismatch', null, { check: 'sha256' });
var v;
try { v = S.validate(snap); } catch (e) { throw uerr('corrupt'); }
if (v.errors.length) throw uerr('invalid', { n: v.errors.length });
return S.fingerprint(snap);
}).then(function (fp) {
if (fp !== doc.fingerprint) throw uerr('mismatch', null, { check: 'fingerprint' });
return doc.extFingerprint ? S.extFingerprint(snap, S.OWNER_EXT_KEYS) : null;
}).then(function (efp) {
if (doc.extFingerprint && efp !== doc.extFingerprint) throw uerr('mismatch', null, { check: 'extFingerprint' });
return doc;
});
}
function create(opts) {
opts = opts || {};
var C = cfg(opts.params), pca = null, account = null, acctKey = '', boot = null, bootErr = null;
var src = null;
var meta = null, metaAt = 0;
var last = null;
var openErr = null, pollBad = false, busy = null, unwatch = null, lastCheck = 0;
function online() { var n = root.navigator; return !n || n.onLine !== false; }
function needsInteraction(e) {
var M = root.msal, code = String((e && (e.errorCode || e.code)) || '');
return !!((M && typeof M.InteractionRequiredAuthError === 'function' && e instanceof M.InteractionRequiredAuthError) || REDIRECT_CODES.indexOf(code) >= 0);
}
function loginErr(e) {
var code = String((e && (e.errorCode || e.code)) || ''), text = String((e && (e.errorMessage || e.message)) || ''), aad = /AADSTS\d+/.exec(text);
if (code === 'user_cancelled' || (aad && aad[0] === 'AADSTS65004')) return uerr('cancelled', null, { signIn: true, cause: e });
return uerr('login', { code: aad ? aad[0] : (code || '?') }, { signIn: true, cause: e });
}
function startAuth() {
if (C.mock) { acctKey = 'mock'; return Promise.resolve(null); }
var M = root.msal;
if (!M || typeof M.PublicClientApplication !== 'function') return Promise.resolve({ state: 'unavailable', reason: 'noMsal' });
if (!C.clientId) return Promise.resolve({ state: 'unavailable', reason: 'noClientId' });
if (!boot) {
try {
pca = new M.PublicClientApplication({
auth: { clientId: C.clientId, authority: C.authority, redirectUri: C.redirectUri, postLogoutRedirectUri: C.redirectUri, navigateToLoginRequestUrl: true },
cache: { cacheLocation: 'localStorage' }
});
} catch (e) { return Promise.resolve({ state: 'error', error: loginErr(e) }); }
boot = Promise.resolve(typeof pca.initialize === 'function' ? pca.initialize() : null)
.then(function () { return pca.handleRedirectPromise(); })
.then(null, function (e) { bootErr = e; return null; });
}
return boot.then(function (r) {
if (bootErr) { var be = bootErr; bootErr = null; return { state: 'error', error: loginErr(be) }; }
account = (r && r.account) || (pca.getActiveAccount && pca.getActiveAccount()) || (pca.getAllAccounts() || [])[0] || null;
if (!account) return { state: 'signedOut' };
if (pca.setActiveAccount) pca.setActiveAccount(account);
acctKey = String(account.homeAccountId || account.username || 'msal');
if (r && r.account) kv('sessionStorage', KEY_LOOP, null);
return null;
});
}
function token(force) {
if (C.mock) return Promise.resolve('mock-token');
var req = { scopes: C.scopes, account: account, redirectUri: C.silentRedirectUri, forceRefresh: !!force };
return pca.acquireTokenSilent(req).then(function (r) { kv('sessionStorage', KEY_LOOP, null); return r.accessToken; }, function (e) {
if (!online()) throw uerr('offline', null, { status: 0 });
if (!needsInteraction(e)) throw loginErr(e);
var at = Number(kv('sessionStorage', KEY_LOOP) || 0);
if (at && Date.now() - at < 120000) throw uerr('loop', null, { signIn: true });
kv('sessionStorage', KEY_LOOP, String(Date.now()));
return Promise.resolve(pca.acquireTokenRedirect({ scopes: C.scopes, account: account })).then(function () { return new Promise(function () {}); }, function (e2) { throw loginErr(e2); });
});
}
function httpErr(status, body) {
var gc = '';
try { var j = JSON.parse(body || 'null'); gc = j && j.error && j.error.code ? String(j.error.code) : ''; } catch (x) { gc = ''; }
var e = status === 401 ? uerr('auth', null, { signIn: true }) : status === 403 ? uerr('forbidden') : status === 404 ? uerr('missing')
: status === 429 || status === 503 ? uerr('throttled') : uerr('server', { status: status });
e.status = status; e.gcode = gc;
return e;
}
function gfetch(path, asText) {
var url = /^https?:\/\//i.test(path) ? path : C.graphBase + path;
if (url.indexOf(C.graphBase + '/') !== 0) return Promise.reject(uerr('server', { status: 'url' }));
function go(force) {
return token(force).then(function (t) {
return root.fetch(url, { headers: { Authorization: 'Bearer ' + t } }).then(null, function () { throw uerr('offline', null, { status: 0 }); });
});
}
return go(false).then(function (r) { return r.status === 401 ? go(true) : r; }).then(function (r) {
if (!r.ok) return r.text().then(null, function () { return ''; }).then(function (b) { throw httpErr(r.status, b); });
return asText ? r.text() : r.json().then(null, function () { throw uerr('server', { status: 'json' }); });
});
}
function enc(s) { return encodeURIComponent(String(s)); }
function ownPath() { return '/me/drive/root:/' + String(C.folder).split('/').map(enc).join('/') + '/' + enc(C.file); }
function itemPath(s) { return s.driveId ? '/drives/' + enc(s.driveId) + '/items/' + enc(s.itemId) : '/me/drive/items/' + enc(s.itemId); }
function driveOf(m) { var r = m && m.remoteItem; return (r && r.parentReference && r.parentReference.driveId) || (m && m.parentReference && m.parentReference.driveId) || ''; }
function idOf(m) { return (m && m.remoteItem && m.remoteItem.id) || (m && m.id) || ''; }
function isFolder(m) { return !!(m && (m.folder || (m.remoteItem && m.remoteItem.folder))); }
function isFile(m) { return !!(m && (m.file || (m.remoteItem && m.remoteItem.file))); }
function sameName(a, b) { var n = function (s) { s = String(s || ''); return (s.normalize ? s.normalize('NFC') : s).toLowerCase(); }; return n(a) === n(b); }
function srcKey() { return src ? src.kind + ':' + (src.driveId || '') + ':' + src.itemId : ''; }
function readShare() {
try { var s = JSON.parse(kv('localStorage', KEY_SHARE) || 'null'); return s && s.token && s.itemId && (!s.account || s.account === acctKey) ? s : null; } catch (e) { return null; }
}
function saveShare(s) { kv('localStorage', KEY_SHARE, JSON.stringify({ v: 1, token: s.token, driveId: s.driveId, itemId: s.itemId, folderId: s.folderId || '', account: acctKey, at: new Date().toISOString() })); }
function dropShare() { kv('localStorage', KEY_SHARE, null); }
function resolveShare(tok) {
return gfetch('/shares/' + tok + '/driveItem').then(null, function (e) {
if (e.status === 400 || e.status === 403 || e.status === 404) throw uerr('linkDenied', null, { status: e.status, linkProblem: true });
throw e;
}).then(function (it) {
var driveId = driveOf(it), id = idOf(it);
if (isFile(it)) {
if (!sameName(it.name || (it.remoteItem && it.remoteItem.name), C.file)) throw uerr('linkNotLedger', null, { linkProblem: true });
return { driveId: driveId, itemId: id, folderId: '', meta: it };
}
if (!isFolder(it)) throw uerr('linkNotLedger', null, { linkProblem: true });
return findChild(driveId, id, tok).then(function (f) { return { driveId: driveOf(f) || driveId, itemId: idOf(f), folderId: id, meta: null }; });
}).then(function (r) { if (!r.driveId || !r.itemId) throw uerr('linkDenied', null, { linkProblem: true }); return r; });
}
function findChild(driveId, folderId, tok) {
var pages = 0;
function pick(list) { return (list || []).filter(function (x) { return sameName(x.name, C.file) && !isFolder(x); })[0] || null; }
function page(url) {
return gfetch(url).then(function (r) {
var hit = pick(r.value);
if (hit) return hit;
if (r['@odata.nextLink'] && ++pages < 20) return page(r['@odata.nextLink']);
throw uerr('noFile', null, { linkProblem: true });
});
}
return page('/drives/' + enc(driveId) + '/items/' + enc(folderId) + '/children?$select=id,name,eTag,size,lastModifiedDateTime,file,folder,parentReference').then(null, function (e) {
if (e.code === 'noFile' || !(e.status === 403 || e.status === 404)) throw e;
return gfetch('/shares/' + tok + '/driveItem?$expand=children').then(function (it) {
var hit = pick(it.children);
if (!hit) throw uerr('noFile', null, { linkProblem: true });
return hit;
}, function () { throw uerr('linkDenied', null, { linkProblem: true }); });
});
}
function keep(m) { meta = m; metaAt = Date.now(); return m; }
function ownLookup() {
return gfetch(ownPath()).then(function (m) { return isFile(m) ? m : null; }, function (e) { if (e.status === 404 || e.status === 403) return null; throw e; });
}
function resolveSource() {
return ownLookup().then(function (m) {
if (m) { src = { kind: 'own', driveId: driveOf(m), itemId: idOf(m) }; keep(m); return true; }
var sh = readShare();
if (sh) { src = { kind: 'share', driveId: sh.driveId, itemId: sh.itemId, folderId: sh.folderId || '', token: sh.token }; meta = null; return true; }
src = null; meta = null; return false;
});
}
function revoke(e) {
if (e.code === 'noFile') return e;
last = null; cache.del(CACHE_KEY);
return uerr('revoked', null, { revoked: true, needLink: true, status: e.status });
}
function fullMeta(fresh) {
if (!fresh && meta && Date.now() - metaAt < 5000 && meta['@microsoft.graph.downloadUrl']) return Promise.resolve(meta);
if (src.kind === 'own') return gfetch(ownPath()).then(keep);
return gfetch(itemPath(src)).then(keep, function (e) {
if (e.status !== 404 && e.status !== 403) throw e;
return resolveShare(src.token).then(function (r) {
src.driveId = r.driveId; src.itemId = r.itemId; src.folderId = r.folderId || src.folderId; saveShare(src);
return gfetch(itemPath(src)).then(keep);
}, function (e2) { throw e2 && e2.linkProblem ? revoke(e2) : e2; });
});
}
function pollMeta() { return gfetch((src.kind === 'own' ? ownPath() : itemPath(src)) + '?$select=id,name,eTag,size,lastModifiedDateTime'); }
function download(m) {
var url = m && m['@microsoft.graph.downloadUrl'];
var got = url
? root.fetch(url).then(null, function () { throw uerr('offline', null, { status: 0 }); }).then(function (r) { if (!r.ok) throw uerr('server', { status: r.status }, { status: r.status }); return r.text(); })
: gfetch(itemPath(src) + '/content', true);
return got.then(function (t) { return verify(String(t), C.maxBytes); });
}
function fetchLatest(fresh) {
if (busy) return busy;
var p = (src ? Promise.resolve(true) : resolveSource()).then(function (found) {
if (!found) throw uerr('missing', null, { needLink: true });
return fullMeta(fresh);
}).then(function (m) {
var key = srcKey();
if (last && last.src === key && last.eTag && last.eTag === m.eTag) return { snapshot: last.snapshot, changed: false };
return download(m).then(function (doc) {
var snap = doc.snapshot;
snap.source = Object.assign({}, snap.source || {}, { mode: 'graph', fingerprint: doc.fingerprint, rev: doc.rev || '', file: m.name || C.file, fileModified: m.lastModifiedDateTime || '' });
var same = !!(last && last.fingerprint === doc.fingerprint && last.extFingerprint === (doc.extFingerprint || ''));
last = { v: 1, account: acctKey, src: key, eTag: m.eTag || '', rev: doc.rev || '', fingerprint: doc.fingerprint, extFingerprint: doc.extFingerprint || '', savedAt: new Date().toISOString(), modified: m.lastModifiedDateTime || '', snapshot: snap };
return cache.set(CACHE_KEY, last).then(function () { return { snapshot: snap, changed: !same }; });
});
});
busy = p;
var done = function () { busy = null; };
p.then(done, done);
return p;
}
function visible() { var d = root.document; return !d || d.visibilityState !== 'hidden'; }
var a = {
kind: 'graph', capabilities: { live: true, signIn: true },
init: function () {
openErr = null;
return startAuth().then(function (res) {
if (res) return res;
return cache.get(CACHE_KEY).then(function (rec) {
last = rec && rec.v === 1 && rec.account === acctKey && rec.snapshot ? rec : null;
}).then(resolveSource).then(function (found) {
return found ? { state: 'ready' } : { state: 'empty', reason: 'noLink' };
}, function (e) {
if (last && !e.signIn) { openErr = e; return { state: 'ready', cachedOnly: true, error: e }; }
return { state: 'error', error: e };
});
});
},
load: function () {
if (openErr && last) return Promise.resolve(last.snapshot);
return fetchLatest().then(function (r) { return r.snapshot; });
},
checkNow: function () {
if (!visible()) return Promise.resolve(null);
lastCheck = Date.now();
var recovering = !!openErr || pollBad;
var p = (src ? Promise.resolve(true) : resolveSource()).then(function (found) {
if (!found) throw uerr('missing', null, { needLink: true });
return pollMeta().then(function (m) {
if (last && last.src === srcKey() && m && m.eTag && m.eTag === last.eTag) return { snapshot: last.snapshot, changed: false };
return fetchLatest(true);
}, function (e) {
if (e.status === 404 || e.status === 403) return fetchLatest(true);
throw e;
});
});
return p.then(function (r) {
openErr = null; pollBad = false;
return r && recovering && !r.changed ? { snapshot: r.snapshot, changed: true, recovered: true } : r;
}, function (e) { pollBad = true; throw e; });
},
watch: function (onSnap, onErr) {
if (unwatch) unwatch();
var run = function () { a.checkNow().then(function (r) { if (r && r.changed) onSnap(r.snapshot); }, function (e) { onErr(e); }); };
var timer = setInterval(function () { if (visible()) run(); }, C.pollMs);
var vis = function () { if (visible() && Date.now() - lastCheck > 15000) run(); };
var doc = root.document;
if (doc && doc.addEventListener) doc.addEventListener('visibilitychange', vis);
unwatch = function () { clearInterval(timer); if (doc && doc.removeEventListener) doc.removeEventListener('visibilitychange', vis); unwatch = null; };
return unwatch;
},
freshness: function () {
var at = (meta && meta.lastModifiedDateTime) || (last && last.modified) || null, mins = at ? Math.round((Date.now() - Date.parse(at)) / 60000) : null;
var label = mins == null ? '' : mins < 1 ? '자료 방금 저장' : mins < 60 ? '자료 저장 ' + mins + '분 전' : mins < 1440 ? '자료 저장 ' + Math.round(mins / 60) + '시간 전' : '자료 저장 ' + Math.round(mins / 1440) + '일 전';
return { at: at, label: label, stale: mins != null && mins > 3 * 1440 };
},
cached: function () { return last ? { snapshot: last.snapshot, savedAt: last.savedAt, rev: last.rev } : null; },
clearCache: function () { last = null; dropShare(); return cache.del(CACHE_KEY); },
loadLazy: function () { return Promise.resolve(null); },
lazyParts: function () { return []; },
signIn: function () { return pca ? Promise.resolve(pca.loginRedirect({ scopes: C.scopes, prompt: 'select_account' })).then(null, function (e) { if (root.console) root.console.warn(e); }) : Promise.resolve(); },
signOut: function () {
dropShare(); last = null; src = null; meta = null;
var p = cache.del(CACHE_KEY);
if (C.mock || !pca) return p.then(function () { return { reload: true }; });
return p.then(function () { return pca.logoutRedirect({ account: account, postLogoutRedirectUri: C.redirectUri }); });
},
setShareLink: function (input) {
var link;
try { link = pickLink(input); } catch (e) { return Promise.reject(e); }
var tok = shareToken(link);
return resolveShare(tok).then(function (r) {
src = { kind: 'share', driveId: r.driveId, itemId: r.itemId, folderId: r.folderId || '', token: tok };
if (r.meta && r.meta['@microsoft.graph.downloadUrl']) keep(r.meta); else meta = null;
saveShare(src);
return { ok: true };
});
},
clearShareLink: function () {
dropShare();
if (src && src.kind === 'share') { src = null; meta = null; }
last = null;
return cache.del(CACHE_KEY);
},
sourceInfo: function () { return { kind: src ? src.kind : null, stored: !!readShare(), folder: C.folder, file: C.file, modified: (meta && meta.lastModifiedDateTime) || (last && last.modified) || '' }; },
accountLabel: function () {
if (C.mock) return '연습용 계정';
var u = account && account.username ? String(account.username) : '', i = u.indexOf('@');
return u ? (i > 2 ? u.slice(0, 2) + '***' + u.slice(i) : '***' + u.slice(Math.max(0, i))) : '';
},
fileLabel: function () { var g = G(); return src ? (src.kind === 'own' ? g.sourceOwn || '' : g.sourceShare || '') + ' › ' + C.file : ''; },
webUrl: function () { return ''; }
};
return a;
}
L.adapters.graph = { kind: 'graph', create: create, _test: { pickLink: pickLink, shareToken: shareToken, cfg: cfg } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
'use strict';
var L = root.Ledger = root.Ledger || {};
var KEY = 'ledger.lock.id', AWAY_MS = 60000, BEAT_MS = 10000;
var now = function () { return Date.now(); };
var st = { started: false, locked: false, hiddenAt: null, beatAt: 0, support: null, supportP: null, subs: [] };
function K() { return (L.copy && L.copy.lock) || {}; }
function err(code, cause) { var e = new Error(code); e.code = code; if (cause) e.cause = cause; return e; }
function codeOf(e) {
var n = e && e.name;
return n === 'NotAllowedError' || n === 'AbortError' ? 'cancelled' : n === 'NotSupportedError' || n === 'SecurityError' ? 'unsupported' : 'failed';
}
function box() { try { return root.localStorage || null; } catch (e) { return null; } }
function storedId() { var s = box(); try { var v = s ? s.getItem(KEY) : null; return v && /^[A-Za-z0-9_-]{8,1400}$/.test(v) ? v : null; } catch (e) { return null; } }
function setId(v) { var s = box(); try { if (s) { if (v) s.setItem(KEY, v); else s.removeItem(KEY); } } catch (e) { } }
function bytes(b) {
if (!b) return new Uint8Array(0);
if (b.BYTES_PER_ELEMENT === 1 && b.length != null) return b;
if (b.buffer && b.byteLength != null) return new Uint8Array(b.buffer, b.byteOffset || 0, b.byteLength);
return new Uint8Array(b);
}
function b64u(b) { var u = bytes(b), s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return root.btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64u(str) {
var s = String(str).replace(/-/g, '+').replace(/_/g, '/');
while (s.length % 4) s += '=';
var bin = root.atob(s), u = new Uint8Array(bin.length);
for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
return u;
}
function rand(n) { var u = new Uint8Array(n); root.crypto.getRandomValues(u); return u; }
function utf8(b) { return new root.TextDecoder().decode(bytes(b)); }
function webauthn() {
var P = root.PublicKeyCredential, n = root.navigator, c = n && n.credentials;
return P && c && typeof c.create === 'function' && typeof c.get === 'function' ? { P: P, c: c } : null;
}
function checkSupport() {
if (st.supportP) return st.supportP;
var a = webauthn();
if (!a || root.isSecureContext === false || typeof a.P.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
st.support = 'no'; st.supportP = Promise.resolve('no');
return st.supportP;
}
st.supportP = Promise.resolve().then(function () { return a.P.isUserVerifyingPlatformAuthenticatorAvailable(); })
.then(function (ok) { return ok ? 'yes' : 'no'; }, function () { return 'no'; })
.then(function (v) { st.support = v; fire('support'); return v; });
return st.supportP;
}
function enable() {
var a = webauthn(), k = K(), p;
if (!a) return Promise.reject(err('unsupported'));
try {
p = a.c.create({ publicKey: {
challenge: rand(32),
rp: { name: k.rpName || '가게 장부' },
user: { id: rand(16), name: k.userName || '장부 잠금', displayName: k.userName || '장부 잠금' },
pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged', requireResidentKey: false },
timeout: 60000, attestation: 'none'
} });
} catch (e) { return Promise.reject(err(codeOf(e), e)); }
return Promise.resolve(p).then(function (cred) {
if (!cred || !cred.rawId || !bytes(cred.rawId).length) throw err('failed');
setId(b64u(cred.rawId));
st.locked = false; st.beatAt = now();
return { ok: true };
}, function (e) { throw err(codeOf(e), e); });
}
function disable() { setId(null); st.locked = false; }
function assertionOk(cred, ch) {
try {
var r = cred.response || {}, ad = bytes(r.authenticatorData), origin = root.location && root.location.origin;
if (ad.length < 37 || !(ad[32] & 0x04)) return false;
var cd = JSON.parse(utf8(r.clientDataJSON));
return cd.type === 'webauthn.get' && cd.challenge === b64u(ch) && (!origin || !cd.origin || cd.origin === origin);
} catch (e) { return false; }
}
function unlock() {
var id = storedId(), a = webauthn(), ch, p;
if (!id) { st.locked = false; fire('lock'); return Promise.resolve({ ok: true }); }
if (!a) return Promise.reject(err('unsupported'));
try {
ch = rand(32);
p = a.c.get({ publicKey: { challenge: ch, allowCredentials: [{ type: 'public-key', id: unb64u(id), transports: ['internal'] }], userVerification: 'required', timeout: 60000 } });
} catch (e) { return Promise.reject(err(codeOf(e), e)); }
return Promise.resolve(p).then(function (cred) {
if (!cred || !cred.rawId || b64u(cred.rawId) !== id || !assertionOk(cred, ch)) throw err('failed');
st.locked = false; st.hiddenAt = null; st.beatAt = now();
fire('lock');
return { ok: true };
}, function (e) { throw err(codeOf(e), e); });
}
function fire(why) { st.subs.slice().forEach(function (fn) { try { fn(why); } catch (e) { if (root.console) root.console.error(e); } }); }
function away(ms) { if (!st.locked && storedId() && ms > AWAY_MS) { st.locked = true; fire('lock'); } }
function back() { if (st.hiddenAt == null) return; var ms = now() - st.hiddenAt; st.hiddenAt = null; st.beatAt = now(); away(ms); }
function onVisibility() { var d = root.document; if (d && d.visibilityState === 'hidden') { if (st.hiddenAt == null) st.hiddenAt = now(); } else back(); }
function onPageHide() { if (st.hiddenAt == null) st.hiddenAt = now(); }
function beat() {
var t = now(), gap = t - st.beatAt, d = root.document;
st.beatAt = t;
if (d && d.visibilityState === 'hidden') return;
if (gap > AWAY_MS + BEAT_MS) away(gap);
}
function start(onChange) {
if (typeof onChange === 'function' && st.subs.indexOf(onChange) < 0) st.subs.push(onChange);
if (st.started) return;
st.started = true;
st.locked = !!storedId();
st.beatAt = now();
var d = root.document;
if (d && d.visibilityState === 'hidden') st.hiddenAt = now();
if (d && d.addEventListener) d.addEventListener('visibilitychange', onVisibility);
if (root.addEventListener) { root.addEventListener('pagehide', onPageHide); root.addEventListener('pageshow', back); }
if (root.setInterval) root.setInterval(beat, BEAT_MS);
checkSupport();
}
L.lock = {
start: start, checkSupport: checkSupport, enable: enable, disable: disable, unlock: unlock,
isOn: function () { return !!storedId(); },
locked: function () { return st.started && st.locked && !!storedId(); },
support: function () { return st.support; },
_test: { b64u: b64u, unb64u: unb64u, beat: beat, KEY: KEY, AWAY_MS: AWAY_MS, clock: function (fn) { now = fn || function () { return Date.now(); }; } }
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger = root.Ledger || {};
var U = L.ui, F = L.fmt;
L.screens = L.screens || {};
function titleRow(title, subHtml, asideHtml) {
return '<div class="title-row"><div><h1 tabindex="-1">' + U.esc(title) + '</h1>' + (subHtml ? '<p class="sub">' + subHtml + '</p>' : '') + '</div>' +
(asideHtml ? '<div class="title-aside">' + asideHtml + '</div>' : '') + '</div>';
}
function filters(ctx, opts) {
opts = opts || {};
var f = ctx.f, M = ctx.M, out = '<div class="filters" role="group" aria-label="보기 고르기" data-keep="filters">';
if (opts.store !== false) {
out += '<div class="segmented" role="group" aria-label="가게">' + ['all', '2ho', 'eungam'].map(function (s) {
return '<button type="button" data-store="' + s + '" aria-pressed="' + (f.store === s) + '">' + U.esc(ctx.storeName(s)) + '</button>';
}).join('') + '</div>';
}
if (opts.period !== false) {
var years = M.years(), months = M.months(f.store);
out += '<div class="chips" role="group" aria-label="연도">' + years.map(function (y) {
var has = months.some(function (m) { return m.slice(0, 4) === String(y); });
return '<button type="button" class="chip" data-year="' + y + '" aria-pressed="' + (f.year === y) + '"' + (has ? '' : ' disabled') + '>' + y + '</button>';
}).join('') + '</div>';
var sel = '';
for (var k = 1; k <= 12; k++) {
var m = L.model.ym(f.year, k), has2 = months.indexOf(m) >= 0;
sel += '<option value="' + k + '"' + (m === f.month ? ' selected' : '') + (has2 ? '' : ' disabled') + '>' + k + '월</option>';
}
out += '<label class="select month-select"><span class="sr-only">월</span><select data-month>' + sel + '</select></label>';
var groups = years.slice().reverse().map(function (y) {
var ms = months.filter(function (m) { return m.slice(0, 4) === String(y); }).reverse();
if (!ms.length) return '';
return '<optgroup label="' + y + '년">' + ms.map(function (m) {
return '<option value="' + y + '-' + Number(m.slice(5)) + '"' + (m === f.month ? ' selected' : '') + '>' + F.month(m) + '</option>';
}).join('') + '</optgroup>';
}).join('');
out += '<label class="select period-phone"><span class="sr-only">기간</span><select data-period>' + groups + '</select></label>';
}
if (opts.extra) out += '<span class="spacer"></span>' + opts.extra;
return out + '</div>';
}
function periodFilters(ctx) {
var f = ctx.f, M = ctx.M, years = M.years(), months = M.months(f.store), multi = !!(ctx.V && ctx.V.multiPeriod);
var ys = f.years || [f.year], picked = function (y) { return ys.indexOf(y) >= 0; };
var out = '<div class="filters' + (multi ? ' multi' : '') + '" role="group" aria-label="보기 고르기" data-keep="filters">' +
'<div class="segmented" role="group" aria-label="가게">' + ['all', '2ho', 'eungam'].map(function (s) {
return '<button type="button" data-store="' + s + '" aria-pressed="' + (f.store === s) + '">' + U.esc(ctx.storeName(s)) + '</button>';
}).join('') + '</div>' +
'<div class="chips years" role="group" aria-label="연도' + (multi ? ' (여러 개 고를 수 있어요)' : '') + '">' + years.map(function (y) {
var has = months.some(function (m) { return m.slice(0, 4) === String(y); });
return '<button type="button" class="chip" data-year="' + y + '" aria-pressed="' + (multi ? picked(y) : f.year === y) + '"' + (has ? '' : ' disabled') + '>' + y + '</button>';
}).join('') + '</div>' +
(multi ? '' : '<label class="select year-phone"><span class="sr-only">연도</span><select data-year-select>' + years.slice().reverse().map(function (y) {
return '<option value="' + y + '"' + (f.year === y ? ' selected' : '') + '>' + y + '년</option>';
}).join('') + '</select></label>') + '</div>';
var inYear = multi ? Array.from(new Set(months.filter(function (m) { return picked(Number(m.slice(0, 4))); }).map(function (m) { return Number(m.slice(5)); }))).sort(function (a, b) { return a - b; }).map(function (k) { return f.year + '-' + (k < 10 ? '0' : '') + k; })
: months.filter(function (m) { return m.slice(0, 4) === String(f.year); });
var onMonth = function (m) { var k = Number(m.slice(5)); return multi ? !f.annual && (f.months || []).indexOf(k) >= 0 : !f.annual && f.month === m; };
out += '<div class="month-bar" data-keep="months" role="group" aria-label="' + (multi ? ys.join('·') + '년 기간 고르기(여러 개 고를 수 있어요)' : f.year + '년 기간 고르기') + '">' +
'<button type="button" class="chip annual" data-month-chip="0" aria-pressed="' + !!f.annual + '">연간</button>' +
'<div class="month-chips">' + inYear.map(function (m) { var k = Number(m.slice(5)); return '<button type="button" class="chip" data-month-chip="' + k + '" aria-pressed="' + onMonth(m) + '">' + k + '월</button>'; }).join('') + '</div></div>';
return out;
}
function sentence(ctx, s) {
var text = s.parts.map(function (p) { return typeof p === 'string' ? U.esc(p) : ctx.num(p.n, p.u, p.o || undefined); }).join('');
var di = s.drill && ctx.V && ctx.V.drill && ctx.addDrill ? ctx.addDrill(s.drill) : -1;
return '<li class="reason" data-kind="' + U.esc(s.kind || 'info') + '">' +
(di >= 0 ? '<button type="button" class="reason-btn" data-drill="' + di + '" aria-haspopup="dialog">' + text + '<span class="reason-more">예시 보기</span></button>' : text) + '</li>';
}
function noteKey(ctx, n) { return 'note|' + n.id + '|' + (ctx.inbox ? ctx.inbox.keyHash(String(n.text || '')) : ''); }
function notesList(ctx, notes, scope) {
var ib = ctx.inbox && ctx.inbox.on() ? ctx.inbox : null;
var done = ib && scope ? ib.doneList(scope) : [];
if ((!notes || !notes.length) && !done.length) return '';
var ref = Number(String(ctx.M.today).slice(0, 4));
var live = ib ? (notes || []).filter(function (n) { return ib.shown(noteKey(ctx, n)); }) : (notes || []);
var items = live.slice(0, 6).map(function (n) {
var when = n.period ? (n.period.length === 4 ? n.period + '년' : F.month(n.period, { refYear: ref })) : '', key = noteKey(ctx, n);
return '<li class="note-item" data-kind="' + U.esc(n.kind || 'info') + '" data-ib-item="' + U.esc(key) + '">' + U.esc(n.text) + (when ? ' <span class="muted">· ' + U.esc(when) + '</span>' : '') +
(ib ? ib.controls(key, { scope: scope || n.scope || '', kind: 'note', label: n.text }) + ib.extras(key) : '') + '</li>';
}).join('');
return '<h3 class="set-sub">' + U.esc(L.copy.reasons.notes) + '</h3>' + (ib ? ib.message() : '') +
(items ? '<ul class="notes-list">' + items + '</ul>' : '<p class="muted">살펴본 점을 모두 확인했어요.</p>') +
(done.length ? '<details class="as-table ib-done-box"><summary>완료 ' + done.length + '개</summary>' + ib.donePanel(scope) + '</details>' : '');
}
function reasonsPanel(ctx, title, list, notes, opts) {
opts = opts || {};
var ib = ctx.inbox && ctx.inbox.on() ? ctx.inbox : null;
var extra = ib && opts.scope ? ib.doneList(opts.scope).length + ib.memos(opts.scope).length : 0;
if ((!list || !list.length) && (!notes || !notes.length) && !extra && !(ib && opts.memo)) return '';
var body = (list && list.length ? '<ul class="reasons">' + list.map(function (s) { return sentence(ctx, s); }).join('') + '</ul>' : '<p class="muted">' + U.esc(L.copy.reasons.none) + '</p>') + notesList(ctx, notes, opts.scope) +
(ib && opts.memo && opts.scope ? ib.memoBox(opts.scope) : '');
return panel('c12 why', title, opts.meta || '', body, null, { id: opts.id, keep: opts.id || 'why' });
}
function panel(cls, title, meta, body, footer, opts) {
opts = opts || {};
var right = (meta ? '<span class="meta">' + meta + '</span>' : '') + (opts.link || '');
return '<section class="panel ' + (cls || '') + '"' + (opts.id ? ' id="' + U.esc(opts.id) + '"' : '') + (opts.keep ? ' data-keep="' + U.esc(opts.keep) + '"' : '') + '><header><h2>' + U.esc(title) + '</h2>' +
(right ? '<span class="head-right">' + right + '</span>' : '') + '</header>' + body + (footer ? '<footer>' + footer + '</footer>' : '') + '</section>';
}
function barLabels(ctx, items, unit) {
return '<div class="bar-labels" aria-hidden="true">' + (items || []).map(function (x, i) {
return x && F.isNum(x.value) && x.v ? '<span class="bl" data-i="' + i + '">' + ctx.num(x, unit || 'short') + '</span>' : '';
}).join('') + '</div>';
}
function chartBox(id, h, labelsHtml) {
return '<div class="chart-box"><div class="chart ch-' + h + '" id="' + U.esc(id) + '"></div>' + (labelsHtml || '') + '</div>';
}
function taxRepayPanel(ctx, opts) {
var M = ctx.M, F2 = F, ref = Number(String(M.today).slice(0, 4));
if (!M.taxRepay || !opts.months || !opts.months.length) return '';
var tr = M.taxRepay(opts.store, opts.months);
if (!tr.rows.some(function (r) { return (F2.isNum(r.paid.value) && r.paid.value > 0) || F2.isNum(r.remaining.value); })) return '';
var labels = barLabels(ctx, tr.rows.map(function (r) { return r.hasData && F2.isNum(r.paid.value) && r.paid.value > 0 ? r.paid : null; }), 'short');
var head = ['달'].concat(tr.kinds.length > 1 ? tr.kinds.map(function (k) { return k + '(원)'; }) : [], ['낸 세금(원)', '그 달 끝 남은 세금(원)']);
var rows = tr.rows.map(function (r) {
return [U.esc(F2.month(r.month, { refYear: ref }))].concat(tr.kinds.length > 1 ? r.kinds.map(function (x) { return ctx.num(x, 'digits'); }) : [], [ctx.num(r.paid, 'digits'), ctx.num(r.remaining, 'digits')]);
});
return panel(opts.cls || 'c12', opts.title, opts.meta || '', (opts.lead || '') +
'<div class="chart-head"><span></span><span class="tr-legend" id="' + U.esc(opts.id) + '-legend"></span></div>' + chartBox(opts.id, 240, labels) +
U.asTable(opts.title, head, rows) + (opts.note || ''), null, { keep: opts.keep || opts.id });
}
function mountTaxRepay(rootEl, ctx, id, store, months, highlight) {
var el = rootEl.querySelector('#' + id); if (!el || !window.Charts || !window.Charts.stackLine) return;
var tr = ctx.M.taxRepay(store, months), ref = Number(String(ctx.M.today).slice(0, 4)), multiYear = months.length && months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4);
window.Charts.stackLine(el, {
labels: months.map(function (m) { return F.month(m); }), tickLabels: months.map(function (m) { return multiYear && Number(m.slice(5)) === 1 ? m.slice(2, 4) + '.1' : F.monthShort(m); }),
stacks: tr.kinds.map(function (k, j) { return { name: k, values: tr.rows.map(function (r) { return r.kinds[j].value; }) }; }),
line: { name: '그 달 끝 남은 세금', values: tr.rows.map(function (r) { return r.remaining.value; }) },
format: F.man, tickFormat: F.tick, height: 240, highlight: highlight != null ? highlight : null,
valueLabels: el.parentNode.querySelector('.bar-labels'), legend: rootEl.querySelector('#' + id + '-legend'),
ariaLabel: '달마다 낸 세금 막대와 그 달 끝 남은 세금 선. ' + F.month(months[0], { refYear: ref }) + '부터 ' + F.month(months[months.length - 1], { refYear: ref }) + '까지.'
});
}
function cardLink(href, text) { return '<a class="card-link" href="' + U.esc(href) + '">' + U.esc(text) + U.icon('chevron') + '</a>'; }
function debtPill(status) {
if (!status) return '';
var kind = status === '늘어나는 중' ? 'neg' : status === '확인 필요' ? 'warn' : status === '줄어드는 중' ? 'pos' : '';
return U.pill(status, kind);
}
function taxPill(row, days) {
var C = L.copy, label = C.taxStatus[row.status] || row.status;
if (row.status === '미납' || (days != null && days < 0)) return U.pill(C.taxStatus['미납'], 'neg');
if (row.status === '일부') return U.pill(label, 'warn');
return U.pill(label, '');
}
function clipped(t) { var s = String(t == null ? '' : t).replace(/\s+$/, ''); return s.length >= 79 && !/(?:[.?!]|요|다)$/.test(s) ? s + '…' : s; }
function supName(ctx, id) {
var d = ((ctx && ctx.snap && ctx.snap.debts) || []).filter(function (x) { return x && x.debt_id === id; })[0];
var n = d && d.name ? String(d.name).replace(/\s*[(（][^)）]*[)）]/g, '').replace(/\s*(수산|푸드|유통|식품|상회|상사)$/, '').trim() : '';
return n || id;
}
L.screens._ = { clipped: clipped, titleRow: titleRow, filters: filters, periodFilters: periodFilters, panel: panel, cardLink: cardLink, debtPill: debtPill, taxPill: taxPill,
sentence: sentence, notesList: notesList, reasonsPanel: reasonsPanel, barLabels: barLabels, chartBox: chartBox, taxRepayPanel: taxRepayPanel, mountTaxRepay: mountTaxRepay, supName: supName };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
function sinceText(M, prevMonth) { return prevMonth ? F.month(prevMonth, { refYear: Number(String(M.today).slice(0, 4)) }) + ' 말보다' : '지난달보다'; }
function excludedText(list, M) {
if (!list || !list.length) return '';
var when = M && M.debtMonth ? F.month(M.debtMonth, { refYear: Number(String(M.today).slice(0, 4)) }) + '부터' : '이번에';
return L.josa(list.join('·'), '은/는') + ' ' + when + ' 합계에 들어가서 비교에서 뺐어요';
}
L.screens._debtText = { since: sinceText, excluded: excludedText };
function findingHtml(ctx, fd) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4));
switch (fd.key) {
case 'checksFailed': return '<span class="k-bad">자료 점검 ' + ctx.num({ value: fd.n, v: 'ui:checksFailed' }, 'count', { word: '개' }) + '가 안 맞아요.</span> 자료 화면에서 어떤 것인지 봐 주세요.';
case 'debtUp': return '<span class="k-bad">부채가 ' + sinceText(M, fd.prevMonth) + ' ' + ctx.num(fd.amount, 'man') + ' 늘었어요.</span>';
case 'loss': return '<span class="k-bad">' + U.esc(L.josa(fd.storeLabel, '이/가')) + ' ' + F.month(fd.month, { refYear: ref }) + '에 ' +
ctx.num({ value: -fd.amount.value, v: '-(' + fd.amount.v + ')' }, 'man') + ' 적자예요.</span>';
case 'taxSoon': return '<span class="k-warn">' + U.esc(F.date(fd.date, { refYear: ref })) + '까지 낼 세금이 ' + ctx.num(fd.amount, 'man') + ' 있어요</span> (' +
(fd.count > 1 ? ctx.num({ value: fd.count, v: 'ui:taxCount' }, 'count') + ', ' : '') + ctx.num({ value: fd.days, v: 'ui:days' }, 'days') + ').';
case 'streak': return '<span class="k-good">' + (fd.store === 'all' ? '두 가게 모두 ' : U.esc(L.josa(fd.storeLabel, '이/가')) + ' ') + ctx.num({ value: fd.n, v: 'ui:streak' }, 'count', { word: '달' }) + ' 연속 흑자예요.</span>';
case 'debtDown': return fd.amount.value > 0 ? '<span class="k-good">부채가 ' + sinceText(M, fd.prevMonth) + ' ' + ctx.num(fd.amount, 'man') + ' 줄었어요.</span>' : '부채가 ' + sinceText(M, fd.prevMonth).replace(/보다$/, '과') + ' 같아요.';
default: return '';
}
}
function unknownText(list) {
var loans = list.filter(function (d) { return d.kind === 'loan'; }), rest = list.filter(function (d) { return d.kind !== 'loan'; });
var parts = rest.map(function (d) { return d.name; });
if (loans.length === 1) parts.push(loans[0].name); else if (loans.length > 1) parts.push(C.groups.loan + ' ' + loans.length + '건');
return parts.join(' · ');
}
L.screens._unknownText = unknownText;
function debtBlock(ctx) {
var M = ctx.M, now = M.debtNow(), total = now.total;
var comp = M.composition(), pace = M.pace(6), unknown = M.unknownDebts(), ref = Number(String(M.today).slice(0, 4));
var change = now.change.value, line, since = sinceText(M, now.prevMonth);
if (change == null) line = '';
else if (change < 0) line = since + ' ' + ctx.num({ value: -change, v: '-(' + now.change.v + ')' }, 'man', { tone: 'good' }) + ' 줄었어요';
else if (change > 0) line = since + ' ' + ctx.num(now.change, 'man', { tone: 'bad' }) + ' 늘었어요';
else line = since.replace(/보다$/, '과') + ' 같아요';
var partSum = comp.reduce(function (s, p) { return s + (F.isNum(p.value) ? p.value : 0); }, 0);
var rows = comp.map(function (p, i) {
return '<tr><th scope="row"><span class="sw" data-i="' + i + '"></span>' + U.esc(p.label) + (p.members && p.members.length ? '<span class="sub">' + U.esc(p.members.join(' · ')) + '</span>' : '') + '</th>' +
'<td class="n">' + ctx.num({ value: p.value, v: p.v }, 'digits') + '</td>' +
'<td class="n">' + ctx.num({ value: partSum ? p.value / partSum : null, v: '(' + p.v + ') / (' + comp.map(function (q) { return q.v; }).join(' + ') + ')' }, 'pct') + '</td></tr>';
}).join('');
var paceHtml = pace && pace.payoff.value
? '이 속도면 ' + ctx.num(pace.payoff, 'month') + '에 다 갚아요 <span class="muted">(최근 6개월 평균 한 달 ' + ctx.num(pace.avg, 'man') + '씩 줄었어요)</span>'
: pace ? '최근 6개월 동안 부채가 줄지 않았어요.' + (F.isNum(pace.avg.value) && pace.avg.value < 0 ? ' <span class="muted">(한 달 평균 ' + ctx.num({ value: -pace.avg.value, v: '-(' + pace.avg.v + ')' }, 'man') + '씩 늘었어요)</span>' : '') : '';
var notes = [];
if (now.excluded.length && change != null) notes.push(U.esc(excludedText(now.excluded, M)) + '.');
if (unknown.length) notes.push(U.esc(L.josa(unknownText(unknown), '은/는')) + ' 금액을 몰라서 합계에 없어요.');
var exNote = L.screens._debts && L.screens._debts.excludedNote ? L.screens._debts.excludedNote(M) : '';
if (exNote) notes.push(U.esc(exNote.replace(/^ · /, '')) + '.');
var note = notes.length ? '<p class="note">' + notes.join(' ') + '</p>' : '';
var body = '<div class="lead">' + ctx.num(total, 'man', { cls: 'lead-figure' }) + (line ? '<span class="delta">' + line + '</span>' : '') + '</div>' +
'<p class="muted asof">' + U.esc(F.date(now.asOf || M.asOf, { refYear: ref })) + ' 기준 · 명세서·홈택스</p>' +
'<div class="chart stack-wrap" id="ov-stack"></div>' +
'<table class="legend-table"><caption class="sr-only">부채 나눠 보기</caption><thead><tr><th scope="col">항목</th><th class="n" scope="col">남은 돈(원)</th><th class="n" scope="col">비율</th></tr></thead><tbody>' + rows + '</tbody></table>' +
(paceHtml ? '<p class="pace">' + paceHtml + '</p>' : '') + note;
return _.panel('c8 o-debt', C.nav[1].label, null, body, null, { link: _.cardLink(ctx.link('/debts'), '자세히') });
}
function monthBox(ctx) {
var M = ctx.M, f = ctx.f, ref = Number(String(M.today).slice(0, 4)), stores = ['2ho', 'eungam', 'all'];
var K = stores.map(function (s) { return M.kpis(s, f.month); });
var line = function (label, id, unit, toneFn) {
return '<tr><th scope="row">' + label + '</th>' + K.map(function (k) {
var x = k[id]; return '<td class="n">' + ctx.num(x, unit, { tone: toneFn ? toneFn(x.value) : '' }) + '</td>';
}).join('') + '</tr>';
};
var neg = function (v) { return F.isNum(v) && v < 0 ? 'bad' : ''; };
var table = '<table><caption class="sr-only">' + U.esc(F.month(f.month, { refYear: ref })) + ' 가게별 손익</caption><thead><tr><th scope="col"><span class="sr-only">항목</span></th>' +
stores.map(function (s) { return '<th class="n" scope="col">' + U.esc(ctx.storeName(s)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
line('매출', 'revenue', 'digits') + line('영업비용', 'op_cost', 'digits') + line('영업이익', 'op_profit', 'digits', neg) + line('이익률', 'op_margin', 'pct', neg) +
'<tr><th scope="row">영업이익<span class="sub">지난달 대비</span></th>' + K.map(function (k) { return '<td class="n">' + ctx.delta(k.op_profit.delta, 'man', 'up') + '</td>'; }).join('') + '</tr></tbody></table>';
var list = '<div class="month-list rows">' + stores.map(function (s, i) {
var k = K[i];
return '<div class="row"><div class="grow"><span class="title">' + U.esc(ctx.storeName(s)) + '</span><span class="line2">매출 ' + ctx.num(k.revenue, 'digits') + ' · 이익률 ' + ctx.num(k.op_margin, 'pct') + '</span>' +
(F.isNum(k.op_profit.delta.value) ? '<span class="line2">영업이익 지난달보다 ' + ctx.delta(k.op_profit.delta, 'man', 'up') + '</span>' : '') + '</div>' +
'<span class="amt">' + ctx.num(k.op_profit, 'digits', { tone: neg(k.op_profit.value) }) + '</span></div>';
}).join('') + '</div>';
var none = !M.hasData(f.month, 'all');
return _.panel('c4 o-month month-box', F.month(f.month, { refYear: ref }) + ' 가게별 손익', '통장 기준',
none ? U.emptyBlock(C.states.blockEmpty) : table + list + '<p class="note">' + U.esc(C.pnlBasisNote) + ' 단위는 원이에요.' +
(M.hasHalf(['2ho', 'eungam'], [f.month], ['revenue', 'op_cost', 'op_profit']) ? ' ' + U.esc(C.halfWonNote) : '') + '</p>',
_.cardLink(ctx.link('/pnl'), '손익 자세히'));
}
function chartBlock(ctx) {
var M = ctx.M, f = ctx.f, series = M.series(f.store, 'op_profit', f.month, 12);
var rows = series.map(function (p) { return [U.esc(F.month(p.month)), ctx.num({ value: p.value, v: p.v }, 'digits')]; });
return _.panel('c8 o-chart', '영업이익', '최근 12개월 · ' + U.esc(ctx.storeName(f.store)) + ' · 통장 기준',
'<div class="chart" id="ov-profit"></div>' + U.asTable('최근 12개월 영업이익', ['달', '영업이익(원)'], rows));
}
function reviewBlock(ctx) {
var M = ctx.M, todo = !!(ctx.V && ctx.V.reviewTodo), all = M.reviewItems(), items = all.slice(0, 3), n = M.reviewCount();
var body = items.length ? '<div class="rows">' + items.map(function (r) {
var qid = (/(Q-[A-Z0-9-]+)\s*$/.exec(String(r.title_masked || '')) || [])[1], q = todo && qid && M.reviewTextOf ? M.reviewTextOf(qid) : null;
return '<div class="row"><div class="grow"><span class="title clamp2" title="' + U.esc(r.title_masked) + '">' + U.esc(q && q.text ? q.text : _.clipped(r.title_masked)) + '</span><span class="line2">' + (q ? U.esc(_.clipped(r.title_masked)) : U.esc(r.type) + ' · ' + U.esc(r.location || '')) + '</span></div>' +
'<span class="amt">' + ctx.num({ value: r.amount, v: 'reviewItems[' + r.rank + '].amount' }, 'digits') + '</span></div>';
}).join('') + '</div>' : U.emptyBlock('확인할 것이 없어요. ' + F.date(M.asOf) + '까지 모두 정리됐어요.');
var foot = items.length ? _.cardLink(ctx.link('/review'), '모두 보기') : '';
return _.panel('c4 o-review', C.nav[3].label, todo ? (all.length ? '사장님 할 일 ' + ctx.num({ value: all.length, v: 'ui:todo' }, 'count') : '') : (n.value ? ctx.num(n, 'count') + ' · 금액 큰 순' : ''), body, foot);
}
function taxBlock(ctx) {
var M = ctx.M, t = M.tax(), ref = Number(String(M.today).slice(0, 4)), next = t.upcoming.slice(0, 3);
var firstDue = t.upcoming.length ? t.upcoming[0].row.due_date : null, sameDay = t.upcoming.filter(function (x) { return x.row.due_date === firstDue; });
var lead = firstDue ? '<p class="tax-next"><span class="tax-next-label">' + U.esc(F.date(firstDue, { refYear: ref })) + '까지</span> ' + ctx.num(t.totalOf(sameDay), 'man', { cls: 'tax-next-figure' }) +
' <span class="muted">' + ctx.num({ value: sameDay.length, v: 'ui:taxCount' }, 'count') + ' · ' + ctx.num({ value: sameDay[0].days, v: 'ui:days' }, 'days') + '</span></p>' : '';
var body = next.length ? lead + '<div class="rows">' + next.map(function (x) {
var r = x.row;
return '<div class="row"><div class="grow"><span class="title">' + U.esc(r.tax_kind) + ' · ' + U.esc(r.period_label) + '</span>' +
'<span class="line2">' + U.esc(r.store === 'all' ? '공통' : ctx.storeName(r.store)) + ' · ' + U.esc(F.date(r.due_date, { refYear: ref })) + '까지 · ' + ctx.num({ value: x.days, v: 'ui:days' }, 'days') + '</span></div>' +
'<span class="amt stack">' + ctx.num(x.remaining, 'digits') + _.taxPill(r, x.days) + '</span></div>';
}).join('') + '</div>' : U.emptyBlock('앞으로 낼 세금이 없어요.');
var foot = (t.overdue.length ? '<span class="bad">기한 지난 세금 ' + ctx.num({ value: t.overdue.length, v: 'ui:overdueCount' }, 'count') + ' ' + ctx.num(t.overdueTotal, 'man') + '</span>' : '<span></span>') +
_.cardLink(ctx.link('/debts/tax'), '세금 모두 보기');
var basis = M.snap.meta && M.snap.meta.tax_snapshot_date ? '홈택스 ' + U.esc(F.date(M.snap.meta.tax_snapshot_date, { refYear: ref })) + ' 조회' : '';
return _.panel('c8 o-tax', '세금 낼 것', basis, body, foot);
}
function checksBlock(ctx) {
var M = ctx.M, ck = M.checks(), v = ctx.validation;
var browser = v.errors.length ? U.status('fail', '화면 계산 오류 ' + v.errors.length + '개') : v.warnings.length ? U.status('warn', '화면 계산 확인 ' + v.warnings.length + '개') : U.status('ok', '두 가게 합·손익·부채를 화면에서 다시 계산했어요');
var rows = '<div class="row">' + browser + '</div>' + ck.bad.slice(0, 3).map(function (c) {
return '<div class="row"><div class="grow">' + U.status(c.status === 'fail' ? 'fail' : 'warn', c.label) + '</div></div>';
}).join('') + '<div class="row"><div class="grow">' + U.status(ck.fail.length ? 'warn' : 'ok', '엑셀 점검 ' + ck.counted + '개 중 ' + ck.ok.length + '개 맞아요') + '</div></div>';
return _.panel('c4 o-checks', '자료 점검', ctx.fingerprint ? '지문 ' + U.esc(F.fingerprint(ctx.fingerprint)) : '', '<div class="rows">' + rows + '</div>', _.cardLink(ctx.link('/data'), '자료 보기'));
}
function notesBlock(ctx) {
if (!ctx.V || !ctx.V.notes) return '';
var notes = ctx.M.notesFor('overview', ctx.f.month, ctx.f.store);
return notes.length ? _.panel('c12 why o-notes', C.reasons.notes, '', _.notesList(ctx, notes, 'overview').replace(/^<h3[^>]*>[^<]*<\/h3>/, ''), null, { keep: 'o-notes' }) : '';
}
L.screens.overview = {
title: function () { return C.nav[0].label; },
html: function (ctx) {
var fd = ctx.M.finding(ctx.f.store, ctx.f.month, ctx.validation);
return _.titleRow(C.nav[0].label, findingHtml(ctx, fd)) + _.filters(ctx) +
'<div class="grid ov">' + debtBlock(ctx) + monthBox(ctx) + chartBlock(ctx) + reviewBlock(ctx) + taxBlock(ctx) + checksBlock(ctx) + notesBlock(ctx) + '</div>';
},
mount: function (rootEl, ctx) {
var M = ctx.M, f = ctx.f, comp = M.composition();
var stackEl = rootEl.querySelector('#ov-stack');
if (stackEl && comp.length) {
var res = window.Charts.stack100(stackEl, comp, { format: F.man, ariaLabel: '부채 나눠 보기: ' + comp.map(function (p) { return p.label + ' ' + F.man(p.value); }).join(', ') });
rootEl.querySelectorAll('.legend-table .sw').forEach(function (sw) { sw.style.background = res.styles[Number(sw.getAttribute('data-i'))]; });
}
var el = rootEl.querySelector('#ov-profit');
if (el) {
var s = M.series(f.store, 'op_profit', f.month, 12);
window.Charts.columns(el, {
labels: s.map(function (p) { return F.month(p.month); }), tickLabels: s.map(function (p) { return F.monthShort(p.month); }),
values: s.map(function (p) { return p.value; }), highlight: s.length - 1, format: F.man, tickFormat: F.tick, height: window.matchMedia && window.matchMedia('(min-width: 1100px)').matches ? 236 : 200,
ariaLabel: ctx.storeName(f.store) + ' 최근 12개월 영업이익 막대. ' + F.month(f.month) + ' ' + F.man(s[s.length - 1].value) + '. 적자 달 ' + s.filter(function (p) { return p.value < 0; }).length + '개.',
onSelect: function (i) { var m = s[i].month; if (M.hasData(m, f.store)) ctx.setFilter({ y: Number(m.slice(0, 4)), m: Number(m.slice(5)) }); }
});
}
}
};
L.screens.notfound = {
title: function () { return '없는 화면'; },
html: function (ctx) { return _.titleRow('찾는 화면이 없어요', '주소가 바뀌었을 수 있어요. ' + _.cardLink(ctx.link('/'), '첫 화면 보기')); }
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
function T(ctx, k) { return ctx && ctx.term ? ctx.term(k) : (C.terms && C.terms[k]) || k; }
function termOf(ctx, k) { return T(ctx, k); }
function tableCfg(ctx) { var c = (ctx && ctx.V && ctx.V.debtTable) || {}; return { kids: c.kids !== false, source: c.source !== false, unknownNote: c.unknownNote !== false, hideEmpty: c.hideEmpty || [], payoff: c.payoff !== false }; }
function chartCols(ctx) { var dc = ctx && ctx.V && ctx.V.debtChart; return dc && dc.cols && dc.cols.length ? dc.cols.slice() : null; }
function chartNames(M, cols) { return cols.map(function (c) { return String(M.colName(c)).replace(/\s*\(.*\)\s*$/, ''); }).join('·'); }
function visibleGroups(ctx, groups) { var cfg = tableCfg(ctx); return groups.filter(function (g) { return !L.model.debtHidden(g, cfg); }); }
function whatIf(ctx, total, pace, idp) {
var M = ctx.M;
if (!F.isNum(total.value) || total.value <= 0) return '<p class="muted">남은 돈이 없어요.</p>';
var avg = pace && F.isNum(pace.avg.value) && pace.avg.value > 0 ? pace.avg.value : null;
var def = Math.max(10, Math.round((avg || total.value / 36) / 1e5) * 10);
var max = Math.max(def * 3, 1000);
var res = M.payoffWith(def * 1e4, total.value);
return '<div class="what-if" data-total="' + total.value + '" data-total-v="' + U.esc(total.v) + '" data-asof="' + U.esc(M.debtMonth) + '">' +
'<label for="' + idp + '-amt">' + U.esc(T(ctx, 'payPerMonth')) + '</label>' +
'<div class="row-input"><input id="' + idp + '-amt" type="number" inputmode="numeric" min="10" max="' + (max * 4) + '" step="10" value="' + def + '" data-wi="amt"><span>만원</span></div>' +
'<input type="range" min="10" max="' + max + '" step="10" value="' + def + '" aria-label="' + U.esc(T(ctx, 'payPerMonth')) + '(만원)" data-wi="range">' +
'<p class="result" aria-live="polite" data-wi="out">' + resultHtml(ctx, res, def, total.value) + '</p>' +
(avg ? '<p class="muted">지금 속도(최근 ' + pace.n + '개월 평균 한 달 ' + ctx.num(pace.avg, 'man') + ')면 ' + ctx.num(pace.payoff, 'month') + '에 다 갚아요.</p>'
: pace && F.isNum(pace.avg.value) ? '<p class="muted">최근 ' + pace.n + '개월 동안은 줄지 않았어요. 처음 금액은 3년(36달)에 나눠 갚는 셈이에요.</p>'
: '<p class="muted">아직 줄어든 흐름이 없어요. 처음 금액은 3년(36달)에 나눠 갚는 셈이에요.</p>') +
'<p class="note">' + ctx.num(total, 'man') + '을 이 금액으로 나눈 거예요. 이자와 새로 생기는 외상은 셈에 넣지 않았어요.</p></div>';
}
function resultHtml(ctx, res, amountMan, total) {
if (!res) return '';
return '→ ' + ctx.num({ value: res.month, v: 'calc:payoffWith:' + amountMan * 1e4 + ':' + total }, 'month') + '에 다 갚아요 <span class="muted">(' + ctx.num({ value: res.months, v: 'ui:months' }, 'count', { word: '달' }) + ')</span>';
}
function mountWhatIf(rootEl, ctx) {
rootEl.querySelectorAll('.what-if').forEach(function (box) {
var amt = box.querySelector('[data-wi="amt"]'), range = box.querySelector('[data-wi="range"]'), out = box.querySelector('[data-wi="out"]');
var total = Number(box.getAttribute('data-total'));
var update = function (from) {
var v = Math.max(10, Math.round(Number(from.value) || 0));
if (from === amt) range.value = Math.min(v, Number(range.max)); else amt.value = v;
out.innerHTML = resultHtml(ctx, ctx.M.payoffWith(v * 1e4, total), v, total);
};
amt.addEventListener('input', function () { update(amt); });
range.addEventListener('input', function () { update(range); });
});
}
function lineData(ctx, cols) {
var M = ctx.M;
return M.debtMonths().map(function (m) {
var parts = cols.map(function (c) { return c === 'all_total' ? M.debtTotal(m) : M.debtCell(m, c); });
var have = parts.filter(function (x) { return F.isNum(x.value); });
return { month: m, value: have.length ? have.reduce(function (s, x) { return s + x.value; }, 0) : null, v: have.length ? have.map(function (x) { return x.v; }).join(' + ') : null };
});
}
function trimmed(data) {
var has = data.map(function (d) { return F.isNum(d.value); }), first = has.indexOf(true), last = has.lastIndexOf(true);
return first < 0 ? [] : data.slice(first, last + 1);
}
function bcSpans(ctx, months) {
var M = ctx.M, gaps = M.bcGaps ? M.bcGaps('all', months) : [], out = [];
gaps.forEach(function (g) {
var idx = g.shown.map(function (m) { return months.indexOf(m); }).filter(function (i) { return i >= 0; }).sort(function (a, b) { return a - b; }), run = null;
idx.forEach(function (i) { if (run && i === run.to + 1) run.to = i; else { run = { from: i, to: i, label: ctx.storeName(g.store) + ' BC카드 입금 없음', short: 'BC 없음', fill: 'warn' }; out.push(run); } });
});
return { spans: out, gaps: gaps };
}
function yyM(m) { return m.slice(2, 4) + '년 ' + Number(m.slice(5)) + '월'; }
function markPoints(ctx, d2) {
var M = ctx.M, cfg = (L.viewConfig || {}).DEBT_MARKS || {}, out = [], seen = {};
var idx = d2.map(function (d) { return d.month; }), past = function (i) { return !M.debtMonth || d2[i].month <= M.debtMonth; };
(cfg.months || []).forEach(function (m) { var i = idx.indexOf(m); if (i >= 0 && F.isNum(d2[i].value) && past(i)) { seen[i] = true; out.push({ at: i, month: m, x: d2[i], kind: 'month' }); } });
if (cfg.bands) {
var i0 = -1; for (var a = 0; a < d2.length; a++) if (F.isNum(d2[a].value)) { i0 = a; break; }
if (i0 >= 0) for (var k = Math.floor(d2[i0].value / 1e8); k >= 2; k--) {
var lim = k * 1e8, hit = -1;
for (var i = i0; i < d2.length && past(i); i++) if (F.isNum(d2[i].value) && d2[i].value < lim) { hit = i; break; }
if (hit < 0) break;
if (hit === i0 || seen[hit]) continue;
seen[hit] = true; out.push({ at: hit, month: d2[hit].month, x: d2[hit], kind: 'band', band: k - 1 });
}
}
return out.sort(function (p, q) { return p.at - q.at; });
}
function markLines(p) { return [yyM(p.month) + (p.kind === 'band' ? '~' : ''), F.man(p.x.value)]; }
function marksLine(ctx, d2) {
var M = ctx.M, pts = markPoints(ctx, d2), nowRow = d2.filter(function (d) { return d.month === M.debtMonth; })[0];
if (!pts.length) return '';
var parts = pts.map(function (p) { return '<span class="mk-pt"><span class="mk-when">' + U.esc(yyM(p.month) + (p.kind === 'band' ? '~' : '')) + '</span> <b>' + ctx.num({ value: p.x.value, v: p.x.v }, 'man') + '</b></span>'; });
if (nowRow && F.isNum(nowRow.value)) parts.push('<span class="mk-pt"><span class="mk-when">지금</span> <b>' + ctx.num({ value: nowRow.value, v: nowRow.v }, 'man') + '</b></span>');
return '<p class="debt-marks sr-only">' + parts.join('<span class="mk-arrow"> → </span>') + '</p>';
}
function taxPlus(ctx, data) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4));
var tg = visibleGroups(ctx, M.debtGroups()).filter(function (g) { return g.kind === 'tax' && F.isNum(g.current.value) && g.current.v; });
if (!tg.length) return '';
var tax = { value: tg.reduce(function (a, g) { return a + g.current.value; }, 0), v: tg.map(function (g) { return '(' + g.current.v + ')'; }).join(' + ') };
var when = tg.map(function (g) { return g.currentDate; }).filter(Boolean).sort().pop();
var nowRow = data.filter(function (d) { return d.month === M.debtMonth; })[0], total = M.debtNow().total;
var sum = nowRow && F.isNum(nowRow.value) && F.isNum(total.value) && Math.abs(nowRow.value + tax.value - total.value) < 1
? '<p class="note tax-sum">거래처 외상 ' + ctx.num({ value: nowRow.value, v: nowRow.v }, 'man') + ' + 세금 ' + ctx.num(tax, 'man') + ' = ' + U.esc(T(ctx, 'debtsTotal')) + ' ' + ctx.num(total, 'man') + '</p>' : '';
return '<p class="tax-plus"><span class="tp-sign" aria-hidden="true">+</span> 세금 <b>' + ctx.num(tax, 'won') + '</b></p>' + sum;
}
function drawLine(el, ctx, data, name, cols) {
var M = ctx.M, d2 = trimmed(data), idx = d2.map(function (d) { return d.month; }), today = idx.indexOf(M.debtMonth);
if (d2.length < 2) return;
var bc = cols && cols.indexOf('all_total') < 0 ? bcSpans(ctx, idx) : { spans: [], gaps: [] };
var pts = cols && cols.indexOf('all_total') < 0 ? markPoints(ctx, d2) : [];
var jan = idx.map(function (m, i) { return Number(m.slice(5)) === 1 ? i : -1; }).filter(function (i) { return i >= 0; });
var refM = M.debtMonth ? String(Number(M.debtMonth.slice(0, 4)) - 1) + '-12' : null, refRow = d2.filter(function (d) { return d.month === refM; })[0];
var late = M.lateColumns().filter(function (c) { return !cols || cols.indexOf(c.col) >= 0 || cols.indexOf('all_total') >= 0; });
var seen = {}, notes = [];
late.forEach(function (c) { var i = idx.indexOf(c.month); if (i < 0 || seen[c.name]) return; seen[c.name] = true; notes.push({ at: i, label: F.month(c.month, { refYear: Number(String(M.today).slice(0, 4)) }) + '부터 ' + c.name + ' 포함', short: c.name }); });
var hasFuture = today >= 0 && today < d2.length - 1;
window.Charts.line(el, {
labels: idx.map(function (m) { return F.month(m); }), tickLabels: idx.map(function (m) { return m.slice(0, 4); }), xAt: jan,
series: [{ name: name, values: d2.map(function (d) { return d.value; }) }],
format: F.man, tickFormat: F.tick, height: pts.length ? 250 : 220, today: hasFuture ? today : null, todayLabel: F.date(M.debtAsOf) + ' 기준',
endLabel: true, annotations: notes.length || bc.spans.length ? notes.concat(bc.spans) : null, markDots: pts.length ? pts.map(function (p) { return p.at; }) : null,
bottomMarks: pts.length ? pts.map(function (p) { return { at: p.at, lines: markLines(p) }; }) : null,
reference: refRow && F.isNum(refRow.value) ? Object.assign({ value: refRow.value, label: '1월 1일 ' + F.man(refRow.value) }, ctx.V && (ctx.V.plain || ctx.V.debtChart) ? { at: 'left' } : {}) : null,
ariaLabel: name + ' 선. ' + F.month(idx[0]) + '부터 ' + F.month(idx[idx.length - 1]) + '까지' + (hasFuture ? ', ' + F.date(M.debtAsOf) + ' 뒤는 점선 예측' : '') +
'. 지금 ' + F.man(today >= 0 ? d2[today].value : null) + '.' + (notes.length ? ' ' + notes.map(function (n) { return n.label; }).join(', ') + '.' : '') + (bc.spans.length ? ' ' + bc.spans.map(function (x) { return x.label; }).join(', ') + '.' : '') + (pts.length ? ' ' + pts.map(function (p) { return markLines(p).join(' '); }).join(', ') + '.' : '')
});
}
function lineTable(ctx, data, caption) {
var M = ctx.M;
return U.asTable(caption, ['달', '남은 돈(원)'], data.filter(function (d) { return F.isNum(d.value); }).map(function (d) {
return [U.esc(F.month(d.month)) + (d.month > M.debtMonth ? ' (예측)' : d.month === M.debtMonth && M.debtAsOf && M.debtAsOf.slice(0, 7) === d.month ? ' (' + U.esc(F.date(M.debtAsOf)) + ')' : ''), ctx.num({ value: d.value, v: d.v }, 'digits')];
}));
}
function points(data) { return data.filter(function (d) { return F.isNum(d.value) && d.value !== 0; }).length ? data.filter(function (d) { return F.isNum(d.value); }).length : 0; }
function trackRow(ctx, g, scaleMax, cols, commonStart) {
var start = g.start.value, cur = g.current.value, ref = Number(String(ctx.M.today).slice(0, 4));
var left;
if (!F.isNum(cur) || !F.isNum(start)) left = '';
else if (cur > start) left = '<span class="bad">기준보다 ' + ctx.num({ value: cur - start, v: '(' + g.current.v + ') - (' + g.start.v + ')' }, 'man') + ' 늘었어요</span>';
else left = '갚은 돈 ' + ctx.num({ value: start - cur, v: '(' + g.start.v + ') - (' + g.current.v + ')' }, 'man') + ' (' + ctx.num({ value: start ? (start - cur) / start : null, v: '((' + g.start.v + ') - (' + g.current.v + ')) / (' + g.start.v + ')' }, 'pct') + ')';
var right = F.isNum(start) ? '기준 ' + ctx.num(g.start, 'man') + (g.startDate && g.startDate !== commonStart ? ' · ' + U.esc(F.date(g.startDate, { year: true })) : '') : '';
return '<tr class="trk"><td colspan="' + cols + '"><div class="track-cell"><div class="track-slot" data-track="' + U.esc(g.id) + '" data-cur="' + (F.isNum(cur) ? cur : '') + '" data-base="' + (F.isNum(start) ? start : '') + '" data-max="' + scaleMax + '" data-name="' + U.esc(g.label) + '"></div>' +
'<div class="track-ends"><span>' + left + '</span><span>' + right + '</span></div></div></td></tr>';
}
function commonStartOf(groups) {
var c = {}, best = null;
groups.filter(function (g) { return !g.unknown && !g.noHistory && g.startDate; }).forEach(function (g) { c[g.startDate] = (c[g.startDate] || 0) + 1; });
Object.keys(c).forEach(function (k) { if (!best || c[k] > c[best]) best = k; });
return best;
}
var NO_PILL = ['줄어드는 중', '늘어나는 중'];
function sourceHint(g) { return g.kind === 'loan' ? '엑셀 대출 시트' : '엑셀 부채현황'; }
function debtTable(ctx, groups) {
var cfg = tableCfg(ctx), M = ctx.M, ref = Number(String(M.today).slice(0, 4)), cols = (cfg.source ? 6 : 5) - (cfg.payoff ? 0 : 1), since = L.screens._debtText.since(M, M.prevDebtMonth);
var scaleMax = Math.max.apply(null, groups.filter(function (g) { return !g.noHistory; }).map(function (g) { return Math.max(g.start.value || 0, g.current.value || 0); }).concat([1]));
var head = '<thead><tr><th scope="col">항목</th><th class="n" scope="col">지금 남은 돈(원)</th><th class="n" scope="col">' + U.esc(since.replace(/보다$/, ' 대비')) + '</th><th class="n" scope="col">한 달 평균 줄어든 돈<span class="sub">최근 3개월 · −는 늘어남</span></th>' + (cfg.payoff ? '<th class="n" scope="col">다 갚는 예상</th>' : '') + (cfg.source ? '<th scope="col">기준 자료</th>' : '') + '</tr></thead>';
var rowOf = function (g) {
var href = ctx.link('/debts/' + encodeURIComponent(g.id));
var partial = !g.unknown && g.unknownMembers && g.unknownMembers.length;
var kids = cfg.kids && g.children && g.children.length ? '<span class="kids">' + g.children.map(function (k) { return U.esc(k.label) + ' ' + (k.unknown ? '<span class="muted">금액 모름</span>' : ctx.num(k.value, 'won')); }).join(' · ') + '</span>' : '';
var nowCell = g.unknown ? '<span class="dash" aria-hidden="true">' + F.DASH + '</span><span class="sr-only">모름</span>'
: ctx.num(g.current, 'digits') + (g.current.value === 0 && !partial ? '<span class="sub">다 갚았어요</span>' : '');
var change = ctx.delta(g.change, 'man', 'down');
var avg = g.unknown ? ctx.num({ value: null, v: g.avg3.v }, 'man') : ctx.num(g.avg3, 'man', { tone: F.isNum(g.avg3.value) && g.avg3.value < 0 ? 'bad' : '' });
var payoff = g.unknown ? '<span class="muted">원금 확인 필요</span>' : partial ? '<span class="muted">확인 필요</span>' : g.current.value === 0 ? '<span class="muted">다 갚음</span>' : g.payoff.value ? ctx.num(g.payoff, 'month')
: '<span class="dash" aria-hidden="true">' + F.DASH + '</span><span class="sr-only">예상 없음</span>';
var src = g.unknown ? '<span class="warn">' + U.esc(g.source || sourceHint(g)) + '에 원금을 적어 주세요</span>' : U.esc(F.prettyDates(g.source || '', ref)) + (g.confirmedDate && String(g.source || '').indexOf(g.confirmedDate) < 0 ? ' ' + U.esc(F.date(g.confirmedDate, { refYear: ref })) : '');
var phone = g.unknown ? '원금을 적어 주세요'
: (F.isNum(g.change.value) ? since + ' ' + change : g.noHistory && cfg.source ? U.esc(F.date(g.currentDate, { refYear: ref })) + ' 조회 기준' : '') +
(cfg.payoff && g.payoff.value ? ' · ' + ctx.num(g.payoff, 'month') + '에 다 갚아요' : '');
var taxHist = g.kind === 'tax' && M.taxPeriods && M.taxPeriods() && M.taxPeriods().filled.length;
var track = g.unknown || (g.current.value === 0 && !(g.start.value > 0)) ? '' : g.noHistory
? (!cfg.source ? '' : taxHist ? '<tr class="trk"><td colspan="' + cols + '"><p class="track-note muted">지난 달 세금은 고지서·납부 기록으로 계산했어요(' + U.esc(F.month(M.taxPeriods().first, { refYear: ref })) + '부터). 달마다 흐름은 세금 상세에서 봐요.</p></td></tr>' : '<tr class="trk"><td colspan="' + cols + '"><p class="track-note muted">' + U.esc(F.date(g.currentDate, { refYear: ref })) + ' ' + U.esc(g.source || '') + ' 조회가 처음이라 줄어든 흐름은 다음 조회부터 보여요.</p></td></tr>')
: trackRow(ctx, g, scaleMax, cols, commonStartOf(groups));
return '<tbody><tr class="fig"><td class="name"><a href="' + U.esc(href) + '">' + U.esc(g.label) + '</a> ' + (g.status && NO_PILL.indexOf(g.status) < 0 ? _.debtPill(g.status) : '') + kids + '</td>' +
'<td class="n now">' + nowCell + '</td><td class="n hide-phone">' + change + '</td><td class="n hide-phone">' + avg + '</td>' + (cfg.payoff ? '<td class="n hide-phone">' + payoff + '</td>' : '') +
(cfg.source ? '<td class="src hide-phone">' + src + '</td>' : '') + '<td class="phone-line">' + phone + '</td></tr>' + track + '</tbody>';
};
var mainG = groups.filter(function (g) { return g.kind !== 'tax'; }), taxG = groups.filter(function (g) { return g.kind === 'tax'; });
var body = mainG.map(rowOf).join('') + (taxG.length ? '<tbody class="debt-sep"><tr><td colspan="' + cols + '"><span class="sep-label">세금</span></td></tr></tbody>' + taxG.map(rowOf).join('') : '');
return '<div class="table-wrap"><table class="debt-table"><caption class="sr-only">' + U.esc(T(ctx, 'debts')) + ' 항목별</caption>' + head + body + '</table></div>';
}
function headline(ctx) {
if (ctx.V && ctx.V.plain) {
var M2 = ctx.M, now2 = M2.debtNow(), ref2 = Number(String(M2.today).slice(0, 4));
return '지금 ' + U.esc(termOf(ctx, 'debtsTotal')) + ' ' + ctx.num(now2.total, 'man', { cls: 'head-amt' }) + ' 남았어요 <span class="muted">(세금 포함 · ' + U.esc(F.date(now2.asOf || M2.asOf, { refYear: ref2 })) + ' 기준' + U.esc(excludedNote(M2)) + ')</span>';
}
var M = ctx.M, now = M.debtNow(), ref = Number(String(M.today).slice(0, 4)), T = L.screens._debtText, ch = now.change.value, since = T.since(M, now.prevMonth);
return '지금 ' + ctx.num(now.total, 'man') + ' 남았어요' +
(ch == null ? '' : ' · ' + since + ' ' + (ch < 0 ? ctx.num({ value: -ch, v: '-(' + now.change.v + ')' }, 'man', { tone: 'good' }) + ' 줄었어요' : ch > 0 ? ctx.num(now.change, 'man', { tone: 'bad' }) + ' 늘었어요' : '그대로예요')) +
' <span class="muted">(' + U.esc(F.date(now.asOf || M.asOf, { refYear: ref })) + ' 기준' + (now.excluded.length && ch != null ? ' · ' + U.esc(T.excluded(now.excluded, M)) : '') + U.esc(excludedNote(M)) + ')</span>';
}
function taxNote(ctx) {
var M = ctx.M, tp = M.taxPeriods ? M.taxPeriods() : null;
if (!tp || !tp.filled.length) return '';
var detail = !!(ctx.V && ctx.V.details), ref = Number(String(M.today).slice(0, 4));
var text = '세금은 고지서와 납부 기록으로 달마다 계산해 넣었어요(' + U.esc(F.month(tp.first)) + '부터).';
if (detail && tp.checkOk && tp.snapDate) text += ' ' + U.esc(F.date(tp.snapDate, { refYear: ref })) + ' 홈택스 ' + ctx.num(tp.got, 'won') + '과 같아요.';
if (detail && tp.assumed.n) text += ' 날짜를 모르는 납부 ' + ctx.num({ value: tp.assumed.n, v: 'ui:taxAssumed' }, 'count') + '은 납부기한에 냈다고 봤어요.';
var bad = [];
if (!tp.checkOk && F.isNum(tp.want.value) && F.isNum(tp.got.value)) bad.push(U.esc(F.date(tp.snapDate, { refYear: ref })) + ' 홈택스 ' + ctx.num(tp.want, 'won') + '과 계산 ' + ctx.num(tp.got, 'won') + '이 ' + ctx.num({ value: Math.abs(tp.got.value - tp.want.value), v: 'ui:taxGap' }, 'won') + ' 달라요');
tp.diffs.forEach(function (d) { bad.push(U.esc(F.month(d.month, { refYear: ref })) + ' ' + U.esc(ctx.storeName(d.store)) + ' 엑셀 ' + ctx.num(d.excel, 'won') + ' · 계산 ' + ctx.num(d.calc, 'won')); });
return '<p class="note tax-note">' + text + '</p>' + (bad.length ? '<p class="note warn tax-warn" role="status">세금 계산이 맞지 않아요: ' + bad.join(' · ') + '. 확인이 필요해요.</p>' : '');
}
function supplierChartPanel(ctx, cc, data, shown, future) {
var M = ctx.M, names = chartNames(M, cc), DT = L.screens._debtText, cmp = M.compareCols(cc, M.debtMonth, M.prevDebtMonth), ch = cmp.change.value;
var nowRow = data.filter(function (d) { return d.month === M.debtMonth; })[0];
var lead = nowRow && F.isNum(nowRow.value) && !(ctx.V && ctx.V.quietNotes) ? '<p class="chart-lead">지금 ' + ctx.num({ value: nowRow.value, v: nowRow.v }, 'man') +
(F.isNum(ch) ? ' · ' + DT.since(M, M.prevDebtMonth) + ' ' + (ch < 0 ? ctx.num({ value: -ch, v: '-(' + cmp.change.v + ')' }, 'man', { tone: 'good' }) + ' 줄었어요' : ch > 0 ? ctx.num(cmp.change, 'man', { tone: 'bad' }) + ' 늘었어요' : '그대로예요') : '') + '</p>' : '';
var d2 = trimmed(data);
return _.panel('c12 d-chart', '거래처 외상, 달마다', U.esc(names) + ' · ' + U.esc(F.month(shown[0] && shown[0].month)) + '부터' + (future ? ' · 점선은 예측' : ''),
lead + '<div class="chart" id="debt-line"></div>' + marksLine(ctx, d2) + taxPlus(ctx, data) + lineTable(ctx, data, '거래처 외상(' + names + '), 달마다'));
}
function taxPaysPanel(ctx) {
var M = ctx.M;
if (!(ctx.V && ctx.V.taxPays) || !M.taxPayList) return '';
var groups = M.taxPayList();
if (!groups.length) return '';
var ref = Number(String(M.today).slice(0, 4)), n = groups.reduce(function (a, g) { return a + g.rows.length; }, 0);
var tot = { value: groups.reduce(function (a, g) { return a + (F.isNum(g.total.value) ? g.total.value : 0); }, 0), v: groups.map(function (g) { return '(' + g.total.v + ')'; }).join(' + ') };
var first = groups[groups.length - 1].month;
var body = groups.map(function (g, i) {
return '<details class="tp-month"' + (i < 3 ? ' open' : '') + '><summary><span class="tp-m">' + U.esc(F.month(g.month, { refYear: ref })) + '</span><span class="tp-n muted">' + g.rows.length + '건</span><span class="tp-sum">' + ctx.num(g.total, 'won') + '</span></summary>' +
'<div class="rows tp-rows">' + g.rows.map(function (r) {
return '<div class="row"><div class="grow"><span class="title">' + U.esc(F.date(r.date, { refYear: ref })) + '</span><span class="line2">' + U.esc(ctx.storeName(r.store)) + ' 통장 · ' + U.esc(r.kind) + '</span></div><span class="amt">' + ctx.num(r.amount, 'won') + '</span></div>';
}).join('') + '</div></details>';
}).join('');
return _.panel('c12 d-taxpays', '세금 낸 날', U.esc(F.month(first, { year: true })) + '부터 · ' + n + '건 · 통장에서 낸 세금', body, '<span>합계 ' + ctx.num(tot, 'won') + '</span>', { keep: 'taxpays' });
}
function excludedNote(M) { return ''; }
function whyDebts(ctx) {
if (!ctx.V || !ctx.V.reasons || !L.reasons) return '';
var M = ctx.M, now = M.debtNow(), ch = now.change.value, ref = Number(String(M.today).slice(0, 4));
var title = F.isNum(ch) ? (ch > 0 ? C.reasons.debtsUp : ch < 0 ? C.reasons.debtsDown : C.reasons.debtsFlat) : C.reasons.debtsFlat;
var notes = ctx.V.notes ? M.notesFor('debts', M.debtMonth, 'all') : [];
return _.reasonsPanel(ctx, title, L.reasons.debts(M), notes, { meta: U.esc(F.date(now.asOf || M.asOf, { refYear: ref })) + ' 기준', id: 'debts-why', scope: 'debts', memo: true });
}
L.screens.debts = {
title: function (ctx) { return T(ctx, 'debts'); },
html: function (ctx) {
var M = ctx.M, now = M.debtNow(), cfg = tableCfg(ctx);
var cc = chartCols(ctx), groups = visibleGroups(ctx, M.debtGroups()), pace = M.pace(6), data = lineData(ctx, cc || ['all_total']), unknown = M.unknownDebts(), shown = trimmed(data);
var over = groups.some(function (g) { return !g.noHistory && F.isNum(g.current.value) && F.isNum(g.start.value) && g.current.value > g.start.value; });
var future = shown.some(function (d) { return d.month > M.debtMonth; });
return _.titleRow(T(ctx, 'debts'), headline(ctx)) +
'<div class="grid debts-grid">' + whyDebts(ctx) +
(cc ? supplierChartPanel(ctx, cc, data, shown, future) : _.panel('c12 d-chart', '남은 돈, 달마다', U.esc(F.month(shown[0] && shown[0].month)) + '부터' + (future ? ' · 점선은 예측' : ''), '<div class="chart" id="debt-line"></div>' + lineTable(ctx, data, T(ctx, 'debtsTotal') + ', 달마다') + taxNote(ctx) +
(unknown.length && cfg.unknownNote ? '<p class="note">' + U.esc(L.josa(L.screens._unknownText(unknown), '은/는')) + ' 금액을 몰라서 선에 들어가지 않았어요.</p>' : ''))) +
_.panel('c12 d-list', '항목별', null, '<div class="track-head"><div class="track-legend" data-over="' + (over ? 1 : 0) + '"></div>' + (commonStartOf(groups) ? '<span class="track-base">기준 = ' + U.esc(F.date(commonStartOf(groups), { year: true })) + ' 잔액</span>' : '') + '</div>' + debtTable(ctx, groups)) +
taxPaysPanel(ctx) + '</div>';
},
mount: function (rootEl, ctx) {
var el = rootEl.querySelector('#debt-line');
var cc = chartCols(ctx);
if (el) drawLine(el, ctx, lineData(ctx, cc || ['all_total']), cc ? '거래처 외상' : T(ctx, 'debtsTotal'), cc || ['all_total']);
mountTracks(rootEl, ctx);
}
};
function mountTracks(rootEl) {
rootEl.querySelectorAll('.track-slot').forEach(function (slot) {
var cur = slot.getAttribute('data-cur'), base = slot.getAttribute('data-base'), name = slot.getAttribute('data-name');
var c = cur === '' ? null : Number(cur), b = base === '' ? null : Number(base);
window.Charts.track(slot, { value: c, base: b, scaleMax: Number(slot.getAttribute('data-max')) || null,
ariaLabel: name + ': 기준 ' + F.man(b) + ' 중 ' + F.man(c) + ' 남음' + (c != null && b != null && c > b ? ', 기준보다 ' + F.man(c - b) + ' 늘었음' : '') });
});
var lg = rootEl.querySelector('.track-legend');
if (lg) window.Charts.trackLegend(lg, { owed: '남은 돈', paid: '갚은 돈', over: lg.getAttribute('data-over') === '1' ? '기준보다 늘어난 돈' : null }, lg);
}
L.screens._debts = { excludedNote: excludedNote, taxNote: taxNote, taxPaysPanel: taxPaysPanel, bcSpans: bcSpans, chartCols: chartCols, tableCfg: tableCfg, visibleGroups: visibleGroups, whatIf: whatIf, mountWhatIf: mountWhatIf, lineData: lineData, drawLine: drawLine, lineTable: lineTable, trackRow: trackRow, mountTracks: mountTracks, debtTable: debtTable, points: points, trimmed: trimmed };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, S = L.Snapshot, _ = L.screens._, D = L.screens._debts;
function T(ctx, k) { return ctx && ctx.term ? ctx.term(k) : (C.terms && C.terms[k]) || k; }
function groupFor(ctx) { var g = ctx.M.findGroup(ctx.route.arg); return g && L.model.debtHidden(g, D.tableCfg(ctx)) ? null : g; }
function colsOf(g) { return g.debts.map(function (d) { return d.debt_id; }).filter(function (c) { return S.DEBT_COLUMNS.indexOf(c) >= 0; }); }
function paceOf(g) { return { n: 3, avg: g.avg3, payoff: g.payoff }; }
function linePanel(ctx, g, cls, title, extra) { cls = cls || 'c12';
var cols = colsOf(g);
if (!cols.length) return '';
var data = D.lineData(ctx, cols);
if (D.points(data) < 2) return '';
var future = D.trimmed(data).some(function (d) { return d.month > ctx.M.debtMonth; });
return _.panel(cls, title || '남은 돈, 달마다', future ? '점선은 예측' : '', '<div class="chart" id="dd-line" data-cols="' + U.esc(cols.join(',')) + '"></div>' + D.lineTable(ctx, data, g.label + ' 남은 돈, 달마다') + (extra || ''));
}
function storesOf(ctx, r) {
var out = [];
if (r.buy_2ho > 0 && r.buy_eungam > 0) out.push(ctx.storeName('all'));
else { if (r.buy_2ho > 0) out.push(ctx.storeName('2ho')); if (r.buy_eungam > 0) out.push(ctx.storeName('eungam')); }
if (r.buy_common > 0) out.push('공통');
return out.join(' · ') || F.DASH;
}
function supplierView(ctx, g) {
var M = ctx.M, sp = M.supplier(g.id), ref = Number(String(M.today).slice(0, 4));
if (!sp || !sp.rows.length) return '<div class="grid">' + _.panel('c12', '최근 명세표', null, U.emptyBlock('최근 120일 명세표가 없어요.')) + linePanel(ctx, g) + '</div>';
var p = sp.pathOf;
var weekRows = sp.weeks.map(function (w) {
return [U.esc(F.date(w.start, { refYear: ref })) + ' 주', ctx.num({ value: w.buy, v: w.buyV }, 'digits'), ctx.num({ value: w.paid, v: w.paidV }, 'digits'), ctx.num({ value: w.end, v: w.endV }, 'digits')];
});
var stmtRows = sp.statements.slice(0, 12).map(function (r) {
var check;
if (!F.isNum(r.statement_balance)) check = '<span class="muted">' + F.DASH + '</span>';
else if (r.statement_balance === r.balance) check = U.status('ok', '맞아요');
else if (sp.beforePay(r)) check = '<span class="muted" title="명세서 잔액 − 장부 잔액 = 그날 입금">입금 전 명세서</span>';
else check = U.statusHtml('warn', '차이 ' + ctx.num({ value: r.statement_balance - r.balance, v: p(r, 'statement_balance') + ' - ' + p(r, 'balance') }, 'digits', { sign: true }));
return '<tr><th scope="row" class="nowrap">' + U.esc(F.date(r.date, { refYear: ref })) + '</th><td class="nowrap">' + U.esc(storesOf(ctx, r)) + '</td><td class="n key" data-label="일계">' + ctx.num({ value: r.buy_total, v: p(r, 'buy_total') }, 'digits') + '</td>' +
'<td class="n" data-label="명세서 잔액">' + ctx.num({ value: r.statement_balance, v: p(r, 'statement_balance') }, 'digits') + '</td><td class="n hide-phone">' + ctx.num({ value: r.balance, v: p(r, 'balance') }, 'digits') + '</td><td class="stmt-check">' + check + '</td></tr>';
}).join('');
var stmtTable = '<div class="table-wrap"><table class="stack-table"><caption class="sr-only">최근 명세표</caption><thead><tr><th scope="col">날짜</th><th scope="col">가게</th><th class="n" scope="col">일계(원)</th><th class="n" scope="col">명세서 잔액(원)</th><th class="n hide-phone" scope="col">장부 잔액(원)</th><th scope="col">계산</th></tr></thead><tbody>' + stmtRows + '</tbody></table></div>';
var plain = !!(ctx.V && ctx.V.plain);
var stats = [
['매입 · ' + ctx.storeName('2ho'), sp.buy2ho], ['매입 · ' + ctx.storeName('eungam'), sp.buyEungam], ['매입 · 공통', sp.buyCommon], ['입금(장부)', sp.paid]
].concat((g.children || []).map(function (k) { return ['남은 돈 · ' + k.label, k.value]; }))
.filter(function (x) { return !plain || !/^매입/.test(x[0]) || (F.isNum(x[1].value) && x[1].value !== 0); });
var statStrip = '<div class="mini-stats" role="group" aria-label="최근 120일 가게별">' + stats.map(function (x) { return '<div class="ms"><span class="k">' + U.esc(x[0]) + '</span><span class="v">' + ctx.num(x[1], 'won') + '</span></div>'; }).join('') + '</div>';
var bankTo = M.freshness().bank.value;
var basis = '거래명세표 ' + ctx.num({ value: sp.sheets, v: 'ui:sheets' }, 'count', { word: '장' }) + ' · ' + U.esc(F.date(sp.last, { refYear: ref })) + '까지' +
(bankTo && sp.last > bankTo ? ' · 통장 자료는 ' + U.esc(F.date(bankTo, { refYear: ref })) + '까지예요(그 뒤 입금은 장부 기준)' : '');
var mis = sp.mismatches.length;
return '<div class="grid">' +
_.panel('c6', '들어온 물건과 보낸 돈', '최근 120일 · 주마다', '<div class="chart-head"><span></span><span class="dd-legend"></span></div><div class="chart" id="dd-flow"></div>' +
U.asTable(g.label + ' 주마다 매입과 입금', ['주', '명세표 매입(원)', '입금(원)', '주말 잔액(원)'], weekRows)) +
_.panel('c6', '남은 돈 (장부 잔액)', '주마다 · ' + U.esc(F.date(sp.last, { refYear: ref })) + '까지', '<div class="chart" id="dd-run"></div><p class="note">명세표 누계를 장부와 맞춰 본 잔액이에요.</p>') +
_.panel('c12', '최근 명세표', (sp.statements.length > 12 ? (plain ? '최근 12일치 · 전체 ' : '최근 12장 · 전체 ') : '') + ctx.num({ value: sp.statements.length, v: 'ui:stmtCount' }, 'count', { word: plain ? '일치' : '장' }) +
(mis ? ' · 차이 ' + ctx.num({ value: mis, v: 'ui:mismatch' }, 'count', { word: '번' }) : ''), statStrip + stmtTable, '<span class="muted">' + basis + '</span>') +
linePanel(ctx, g) +
'</div>';
}
function plainSame(ctx, t, done, days) {
return !!(ctx.V && ctx.V.plain) && !done && (t.status === '미납' || t.status === '기한전' || (days != null && days < 0));
}
function taxTable(ctx, rows, caption) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4));
return '<div class="table-wrap"><table class="stack-table"><caption class="sr-only">' + U.esc(caption) + '</caption><thead><tr><th scope="col">세목 · 귀속</th><th scope="col">가게</th><th class="n" scope="col">납부 기한</th><th class="n" scope="col">남은 날</th><th class="n hide-phone" scope="col">고지 금액(원)</th><th class="n hide-phone" scope="col">낸 돈(원)</th><th class="n" scope="col">남은 세금(원)</th><th scope="col">상태</th></tr></thead><tbody>' +
rows.map(function (t) {
var days = t.due_date ? L.model.daysBetween(M.today, t.due_date) : null, done = !(t.remaining > 0), path = function (c) { return 'tax[' + t.tax_id + '].' + c; };
return '<tr' + (done ? ' class="muted"' : '') + '><th scope="row">' + U.esc(t.tax_kind) + '<span class="sub">' + U.esc(t.period_label) + '</span></th><td>' + U.esc(t.store === 'all' ? '공통' : ctx.storeName(t.store)) + '</td>' +
'<td class="n" data-label="기한">' + ctx.num({ value: t.due_date, v: path('due_date') }, 'date', { refYear: ref }) + '</td><td class="n">' + (done ? '<span class="muted">' + F.DASH + '</span>' : ctx.num({ value: days, v: 'ui:days' }, 'days', { tone: days < 0 ? 'bad' : days <= 14 ? 'warn' : '' })) + '</td>' +
'<td class="n hide-phone">' + ctx.num({ value: t.amount_due, v: path('amount_due') }, 'digits') + '</td><td class="n hide-phone">' + ctx.num({ value: t.paid, v: path('paid') }, 'digits') + '</td>' +
'<td class="n key">' + ctx.num({ value: t.remaining, v: path('remaining') }, 'digits') + '</td><td>' + (plainSame(ctx, t, done, days) ? '' : _.taxPill(t, done ? null : days)) + '</td></tr>';
}).join('') + '</tbody></table></div>';
}
function taxFoot(ctx, rows) {
var open = rows.filter(function (t) { return t.remaining > 0; });
if (!open.length) return '';
var tot = { value: open.reduce(function (s, t) { return s + t.remaining; }, 0), v: open.map(function (t) { return 'tax[' + t.tax_id + '].remaining'; }).join(' + ') };
return '<span>남은 세금 합계 ' + ctx.num(tot, 'won') + ' · ' + ctx.num({ value: open.length, v: 'ui:taxOpen' }, 'count') + '</span>';
}
function taxView(ctx, g) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4)), stores = {};
g.debts.forEach(function (d) { stores[d.store] = true; });
var rows = (M.snap.tax || []).filter(function (t) { return stores[t.store] || stores.all; }).slice()
.sort(function (a, b) { return String(a.due_date).localeCompare(String(b.due_date)) || String(a.tax_id).localeCompare(String(b.tax_id)); });
var basis = M.snap.meta && M.snap.meta.tax_snapshot_date ? '홈택스 ' + U.esc(F.date(M.snap.meta.tax_snapshot_date, { refYear: ref })) + ' 조회' : '';
if (!rows.length) return '<div class="grid">' + _.panel('c12', '세금 고지', basis, U.emptyBlock('세금 고지가 없어요.')) + '</div>';
var ht = rows.filter(S.isHometax), other = rows.filter(function (t) { return !S.isHometax(t); });
var parts = '';
if (ht.length && other.length) {
parts += _.panel('c12', '홈택스 국세', basis + ' · ' + T(ctx, 'debtsTotal') + '에 들어가요', taxTable(ctx, ht, '홈택스 국세'), taxFoot(ctx, ht)) +
_.panel('c12', '고지서·납부서', '지방세·과태료 등 · ' + T(ctx, 'debtsTotal') + '에는 안 들어가요', taxTable(ctx, other, '고지서·납부서 세금'), taxFoot(ctx, other) +
'<span class="muted">엑셀 부채현황의 세금은 홈택스 조회 금액이에요.</span>');
} else parts += _.panel('c12', '세금 고지', basis, taxTable(ctx, rows, '세금 고지'), taxFoot(ctx, rows));
var tp = M.taxPeriods ? M.taxPeriods() : null, hist = tp && tp.filled.length;
var chart = D.taxPaysPanel ? D.taxPaysPanel(ctx) : '';
return '<div class="grid">' + parts + chart + (hist && ctx.V && ctx.V.details ? liabPanel(ctx, g, tp) : '') + '</div>';
}
function liabPanel(ctx, g, tp) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4)), stores = {};
g.debts.forEach(function (d) { stores[d.store] = true; });
var rows = tp.liab.filter(function (r) { return stores[r.store] || stores.all; }).sort(function (a, b) { return String(a.start).localeCompare(String(b.start)) || String(a.store).localeCompare(String(b.store)) || String(a.id).localeCompare(String(b.id)); });
if (!rows.length) return '';
var path = function (r, c) { return 'taxLiab[' + r.id + '].' + c; };
var asOf = tp.snapDate ? F.date(tp.snapDate, { refYear: ref }) : '지금';
function table(list, caption) {
return '<div class="table-wrap"><table class="stack-table"><caption class="sr-only">' + U.esc(caption) + '</caption><thead><tr><th scope="col">세목 · 귀속</th><th scope="col">가게</th><th class="n" scope="col">남기 시작한 달</th><th class="n hide-phone" scope="col">통장에서 낸 돈(원)</th><th class="n hide-phone" scope="col">마지막 낸 날</th><th class="n" scope="col">' + U.esc(asOf) + ' 남은 세금(원)</th></tr></thead><tbody>' +
list.map(function (r) {
var done = !(r.final > 0);
return '<tr' + (done ? ' class="muted"' : '') + '><th scope="row">' + U.esc(r.kind) + '<span class="sub">' + U.esc(r.period) + (r.assumed ? ' · 날짜 모르는 납부는 기한에 냄으로 봄' : '') + '</span></th><td>' + U.esc(ctx.storeName(r.store)) + '</td>' +
'<td class="n" data-label="시작">' + U.esc(F.month(r.start, { refYear: ref })) + '</td><td class="n hide-phone">' + ctx.num({ value: r.paid, v: path(r, 'paid') }, 'digits') + '</td>' +
'<td class="n hide-phone">' + (r.last_paid ? ctx.num({ value: r.last_paid, v: path(r, 'last_paid') }, 'date', { refYear: ref }) : '<span class="muted">' + F.DASH + '</span>') + '</td>' +
'<td class="n key">' + ctx.num({ value: r.final, v: path(r, 'final') }, 'digits') + '</td></tr>';
}).join('') + '</tbody></table></div>';
}
var open = rows.filter(function (r) { return r.final > 0; }), done = rows.filter(function (r) { return !(r.final > 0); });
var body = (open.length ? table(open, '남은 세금 기간별') : U.emptyBlock('남은 세금이 없어요.')) +
(done.length ? '<details class="as-table"><summary>다 낸 세금 ' + done.length + '건</summary>' + table(done, '다 낸 세금 기간별') + '</details>' : '');
var tot = { value: open.reduce(function (a, r) { return a + r.final; }, 0), v: open.map(function (r) { return path(r, 'final'); }).join(' + ') || null };
var foot = '<span>남은 세금 합계 ' + ctx.num(tot, 'won') + ' · 고지서 ' + ctx.num({ value: open.length, v: 'ui:taxOpen' }, 'count') + '</span>';
return _.panel('c12', '세금 기간별', '고지서 · 통장 납부 기록', '<p class="muted">고지서마다 고지(발행)일, 없으면 납부기한 달부터 통장에서 다 낸 달까지 남은 세금으로 셌어요.</p>' + body, foot);
}
var UTIL_MAIN = ['차이', '은행 없음', '빠짐?'], UTIL_INFO = ['기록 없음', '다른 계좌'];
function utilityTable(ctx, rows, caption) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4));
var path = function (u, c) { return 'utilities[' + u.month + '/' + u.place + '/' + u.item + '].' + c; };
return '<div class="table-wrap"><table class="stack-table"><caption class="sr-only">' + U.esc(caption) + '</caption><thead><tr><th scope="col">달</th><th scope="col">구분 · 항목</th><th class="n" scope="col">고지(원)</th><th class="n" scope="col">통장에서 낸 돈(원)</th><th class="n" scope="col">사장님 기록(원)</th><th scope="col">상태</th></tr></thead><tbody>' +
rows.map(function (u) {
var kind = u.status === '은행 없음' || u.status === '차이' ? 'neg' : u.status === '다른 계좌' || u.status === '기록 없음' ? '' : 'warn';
return '<tr><th scope="row">' + U.esc(F.month(u.month, { refYear: ref })) + '</th><td class="lead">' + U.esc(u.place) + ' · ' + U.esc(u.item) + '</td><td class="n" data-label="고지">' + ctx.num({ value: u.billed, v: path(u, 'billed') }, 'digits') + '</td>' +
'<td class="n" data-label="통장">' + ctx.num({ value: u.paid_bank, v: path(u, 'paid_bank') }, 'digits') + '</td><td class="n" data-label="기록">' + ctx.num({ value: u.owner_record, v: path(u, 'owner_record') }, 'digits') + '</td><td class="key">' + U.pill(u.status, kind) + '</td></tr>';
}).join('') + '</tbody></table></div>';
}
function utilityView(ctx, g) {
var M = ctx.M, hide = ctx.prefs.hidePersonal;
var all = (M.snap.utilities || []).filter(function (u) { return !(hide && u.place === '개인'); })
.sort(function (a, b) { return String(b.month).localeCompare(String(a.month)) || String(a.place).localeCompare(String(b.place)); });
var main = all.filter(function (u) { return UTIL_MAIN.indexOf(u.status) >= 0; }), info = all.filter(function (u) { return UTIL_INFO.indexOf(u.status) >= 0; });
var body = main.length ? utilityTable(ctx, main, '공과금 확인할 줄') : U.emptyBlock('차이 나거나 빠진 공과금이 없어요.');
if (info.length) body += '<details class="as-table"><summary>통장과 기록이 다른 곳에 있는 줄 ' + info.length + '개(기록 없음 · 다른 계좌)</summary>' + utilityTable(ctx, info, '기록 없음·다른 계좌 줄') + '</details>';
var kids = g.children && g.children.length > 1 ? '<div class="rows">' + g.children.map(function (k) {
return '<div class="row"><span class="grow">' + U.esc(k.label) + '</span><span class="amt">' + (k.unknown ? '<span class="muted">금액 모름 · 엑셀 부채현황에 적어 주세요</span>' : ctx.num(k.value, 'won') + (k.value.value === 0 ? ' <span class="muted">다 갚았어요</span>' : '')) + '</span></div>';
}).join('') + '</div>' : '';
var desc = (M.snap.fields || []).filter(function (f) { return f.table === 'web_debt_monthly' && f.field === 'utility_unpaid'; })[0];
var foot = '<span class="muted">미납 공과금은 엑셀 부채현황의 값이에요' + (desc && desc.description ? '(' + U.esc(desc.description) + ')' : '') + '.</span>';
var months = Array.from(new Set(all.map(function (u) { return u.month; }))).sort();
var meta = (months.length ? U.esc(F.month(months[0])) + '–' + U.esc(F.month(months[months.length - 1])) : '') + (hide ? ' · 개인 항목은 가렸어요' : '');
return '<div class="grid">' + (kids ? _.panel('c12', '나눠 보기', null, kids) : '') +
_.panel('c12', '공과금 확인할 줄', meta, body, foot) + linePanel(ctx, g) + '</div>';
}
function loanView(ctx, g) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4)), months = M.months('all').slice(-12);
var rows = months.map(function (m) { var x = M.metric(m, 'all', 'finance_out'); return [U.esc(F.month(m, { refYear: ref })), ctx.num(x, 'digits')]; });
var where = g.source || (g.kind === 'loan' ? '엑셀 대출 시트' : '엑셀 부채현황');
return '<div class="grid">' +
_.panel('c12', '원금을 몰라요', null, '<p>' + U.esc(where) + '에 지금 남은 원금을 적어 주세요(대출 서류 사진도 돼요). 적으면 다음 갱신 때 이 화면과 ' + U.esc(T(ctx, 'debtsTotal')) + '에 들어가요.</p>') +
_.panel('c12', '통장에서 나간 ' + U.esc(M.label('finance_out')), '최근 12개월 · 두 가게', '<div class="chart" id="dd-fin"></div>' +
U.asTable('통장에서 나간 ' + M.label('finance_out') + ', 달마다', ['달', M.label('finance_out') + '(원)'], rows) +
'<p class="note">대출 상환·이자·금융 비용이 섞여 있어요. 이 대출 하나만의 돈은 아니에요.</p>') + '</div>';
}
L.screens['debt-detail'] = {
title: function (ctx) { var g = groupFor(ctx); return g ? g.label : T(ctx, 'debts'); },
html: function (ctx) {
var M = ctx.M, g = groupFor(ctx), ref = Number(String(M.today).slice(0, 4));
var back = '<p class="crumb">' + _.cardLink(ctx.link('/debts'), T(ctx, 'debtsAll')) + '</p>';
if (!g) return back + _.titleRow('찾는 항목이 없어요', '주소의 항목 이름을 확인해 주세요.');
var since = L.screens._debtText.since(M, M.prevDebtMonth);
var sub = g.unknown ? '<span class="warn">금액을 몰라요.</span> ' + U.esc(g.source || (g.kind === 'loan' ? '엑셀 대출 시트' : '엑셀 부채현황')) + '에 적어 주세요.'
: U.esc(F.date(g.currentDate || M.debtAsOf, { refYear: ref })) + ' 기준 ' + ctx.num(g.current, 'man') + (g.current.value === 0 && !(g.unknownMembers && g.unknownMembers.length) ? ' · 다 갚았어요' : ' 남았어요') +
(F.isNum(g.change.value) ? ' · ' + since + ' ' + ctx.delta(g.change, 'man', 'down') : '');
var view = g.unknown ? loanView(ctx, g) : g.kind === 'supplier' ? supplierView(ctx, g) : g.kind === 'tax' ? taxView(ctx, g) : (g.kind === 'utility' || g.id === 'etc') ? utilityView(ctx, g) : '<div class="grid">' + linePanel(ctx, g) + '</div>';
var pillOn = g.status && g.status !== '늘어나는 중' && !(ctx.V && ctx.V.plain && g.status === '줄어드는 중');
return back + _.titleRow(g.label, sub, pillOn ? _.debtPill(g.status) : '') + view;
},
mount: function (rootEl, ctx) {
var M = ctx.M, g = groupFor(ctx); if (!g) return;
var line = rootEl.querySelector('#dd-line');
if (line) { var cols = line.getAttribute('data-cols').split(','); D.drawLine(line, ctx, D.lineData(ctx, cols), g.label + ' 남은 돈', cols); }
var sp = g.kind === 'supplier' ? M.supplier(g.id) : null;
var flow = rootEl.querySelector('#dd-flow');
if (flow && sp && sp.weeks.length) {
var bankTo = M.freshness().bank.value, after = sp.weeks.map(function (w, i) { return w.start > bankTo ? i : -1; }).filter(function (i) { return i >= 0; });
window.Charts.diverging(flow, {
labels: sp.weeks.map(function (w) { return F.date(w.start) + ' 주'; }), tickLabels: sp.weeks.map(function (w) { return F.dateShort(w.start); }),
up: sp.weeks.map(function (w) { return w.buy; }), down: sp.weeks.map(function (w) { return w.paid; }), above: '명세표 매입', below: '입금',
format: F.man, tickFormat: F.tick, height: 200, legend: rootEl.querySelector('.dd-legend'),
annotations: after.length ? [{ from: after[0], to: after[after.length - 1], label: '통장 자료 아직 없음', short: '통장 없음' }] : null,
ariaLabel: g.label + ' 주마다 명세표 매입(위)과 입금(아래), 최근 120일.'
});
}
var run = rootEl.querySelector('#dd-run');
if (run && sp && sp.weeks.length) {
window.Charts.line(run, {
labels: sp.weeks.map(function (w) { return F.date(w.start) + ' 주'; }), tickLabels: sp.weeks.map(function (w) { return F.dateShort(w.start); }),
series: [{ name: '장부 잔액', values: sp.weeks.map(function (w) { return w.end; }) }], step: true, format: F.man, tickFormat: F.tick, height: 200, endLabel: true,
ariaLabel: g.label + ' 주말마다 장부 잔액. 마지막 ' + F.man(sp.weeks[sp.weeks.length - 1].end) + '.'
});
}
var fin = rootEl.querySelector('#dd-fin');
if (fin) {
var ms = M.months('all').slice(-12), vals = ms.map(function (m) { return M.metric(m, 'all', 'finance_out').value; });
window.Charts.columns(fin, { labels: ms.map(function (m) { return F.month(m); }), tickLabels: ms.map(function (m) { return F.monthShort(m); }), values: vals, highlight: vals.length - 1,
format: F.man, tickFormat: F.tick, height: 180, ariaLabel: '최근 12개월 통장에서 나간 ' + M.label('finance_out') + ' 막대. ' + F.month(ms[ms.length - 1]) + ' ' + F.man(vals[vals.length - 1]) + '.' });
}
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
var expanded = {};
function kpiList(ctx) {
var ids = ctx && ctx.V && ctx.V.kpis, names = (ctx && ctx.V && ctx.V.kpiLabels) || {};
var list = ids && ids.length ? C.kpis.filter(function (k) { return ids.indexOf(k.id) >= 0; }) : C.kpis;
return list.map(function (k) { return names[k.id] ? Object.assign({}, k, { label: names[k.id] }) : k; });
}
function kpiDef(ctx, id) { var list = kpiList(ctx); return list.filter(function (k) { return k.id === id; })[0] || list.filter(function (k) { return k.id === 'op_profit'; })[0] || list[0]; }
function fmtOf(def) { return def.kind === 'ratio' ? { f: function (v) { return F.pct(v); }, tick: function (v) { return F.pct(v, 0); } } : { f: F.man, tick: F.tick }; }
function refYear(ctx) { return Number(String(ctx.M.today).slice(0, 4)); }
function monthsText(ms) {
if (ms.length === 1) return ms[0] + '월';
var run = ms.every(function (k, i) { return !i || k === ms[i - 1] + 1; });
return run ? ms[0] + '~' + ms[ms.length - 1] + '월' : ms.join('·') + '월';
}
function periodLabel(ctx) {
var f = ctx.f, M = ctx.M;
if (f.multi) return f.years.join('·') + '년' + (f.annual ? '' : ' ' + monthsText(f.months));
if (!f.annual) return F.month(f.month, { refYear: refYear(ctx) });
var ms = M.yearMonths(f.store, f.year);
if (!ms.length || ms.length === 12) return f.year + '년';
var a = Number(ms[0].slice(5)), b = Number(ms[ms.length - 1].slice(5));
return f.year + '년 ' + (ms.length === b - a + 1 ? (a === b ? a + '월' : a + '~' + b + '월') : ms.length + '달');
}
var TX_LINES = ['revenue', 'other_income', 'food', 'labor', 'rent_fixed', 'utilities', 'delivery_fees', 'taxes', 'opex', 'finance_out', 'owner_transfer', 'family_transfer', 'internal_net'];
function txOn(ctx, id) { return !!(ctx.V && ctx.V.details && ctx.txOk && ctx.txOk() && TX_LINES.indexOf(id) >= 0); }
function txBtn(ctx, id, text) { return '<button type="button" class="txline" data-tx-line="' + id + '" aria-haspopup="dialog" title="' + U.esc(text) + ' 내역 보기">' + U.esc(text) + '</button>'; }
function periodMonths(ctx) { var f = ctx.f; return f.period && f.period.length ? f.period : f.annual ? ctx.M.yearMonths(f.store, f.year) : [f.month]; }
function kpiSet(ctx) { var f = ctx.f; return f.multi ? ctx.M.kpisOver(f.store, f.period) : f.annual ? ctx.M.kpisYear(f.store, f.year) : ctx.M.kpis(f.store, f.month); }
function whole(ctx) { return ctx.f.annual || ctx.f.multi; }
function periodGroups(ctx) {
var f = ctx.f;
if (f.years.length > 1) return f.years.map(function (y) { var ms = f.period.filter(function (m) { return m.slice(0, 4) === String(y); }); return { key: String(y), label: y + '년' + (f.annual ? '' : ' ' + monthsText(f.months)), months: ms }; }).filter(function (g) { return g.months.length; });
return f.period.map(function (m) { return { key: m, label: Number(m.slice(5)) + '월', months: [m] }; });
}
function tableOf(ctx) { var f = ctx.f; return f.multi ? ctx.M.pnlPeriod(f.store, periodGroups(ctx), f.annual ? f.years : null) : ctx.M.pnlTable(f.store, f.year); }
function storeSeg(ctx) {
var f = ctx.f;
return '<span class="segmented store-seg" role="group" aria-label="가게(표)">' + ['all', '2ho', 'eungam'].map(function (s) {
return '<button type="button" data-store="' + s + '" aria-pressed="' + (f.store === s) + '">' + U.esc(ctx.storeName(s)) + '</button>';
}).join('') + '</span>';
}
function selLine(ctx) {
var f = ctx.f;
if (!ctx.V || !ctx.V.multiPeriod) return '';
var n = ctx.num({ value: f.period.length, v: 'ui:months' }, 'count', { word: '달' });
return '<p class="sel-line" role="status"><span>고른 기간 <b>' + U.esc(periodLabel(ctx)) + '</b> · ' + U.esc(ctx.storeName(f.store)) + ' · 자료 있는 ' + n + (f.period.length > 1 ? '의 합' : '') + '</span>' +
(f.multi ? '<button type="button" class="btn ghost sel-reset" data-period-reset>지우기</button>' : '<span class="muted sel-hint">연도·달을 여러 개 눌러 합쳐 볼 수 있어요</span>') + '</p>';
}
function yearOf(ctx) { return ctx.f.annual ? Number(ctx.f.year) : Number(String(ctx.f.month).slice(0, 4)); }
function seriesOf(ctx, sel) {
var M = ctx.M, f = ctx.f;
if (f.multi) return f.period.map(function (m) { var x = M.metric(m, f.store, sel.id); return { month: m, value: x.value, v: x.v, hasData: true }; });
return M.series(f.store, sel.id, yearOf(ctx) + '-12', 12);
}
function subOn(ctx) { return !!(ctx.V && ctx.V.subShare); }
function usable(x) { return !!(x && x.v && String(x.v).indexOf('ui:') !== 0); }
function shareOf(part, whole) {
return usable(part) && usable(whole) && F.isNum(part.value) && F.isNum(whole.value) && whole.value > 0
? { value: part.value / whole.value, v: '(' + part.v + ') / (' + whole.v + ')' } : null;
}
function shareHtml(ctx, part, whole) {
var sh = shareOf(part, whole);
if (!sh) return ctx.num(part, 'digits');
return '<span class="sh">' + ctx.num(sh, 'share') + '</span><span class="sh-amt">' + ctx.num(part, 'digits') + '</span>';
}
function shownItems(ctx, line) {
if (!subOn(ctx)) return line.items;
return line.items.filter(function (it) { return F.isNum(it.amount.value) && it.amount.value !== 0; })
.sort(function (a, b) { return (b.amount.value - a.amount.value) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0); });
}
function shownPct(r) { var x = r * 100; return Math.abs(x) < 1 ? 0 : (x < 0 ? -1 : 1) * Math.round(Math.abs(x)); }
function off100(shares) {
var have = shares.filter(function (x) { return x && F.isNum(x.value); });
return have.length > 1 && have.reduce(function (a, x) { return a + shownPct(x.value); }, 0) !== 100;
}
function shareNoteNeeded(ctx, T) {
var rev = T.revenue, kids = rev.children || [];
var groups = [kids.map(function (k) { return shareOf(k.total, rev.total); })];
rev.cells.forEach(function (c, i) { groups.push(kids.map(function (k) { return shareOf(k.cells[i], c); })); });
T.costs.forEach(function (c) { var w = wholeOf(ctx, c); groups.push(shownItems(ctx, c).map(function (it) { return shareOf(it.amount, w); })); });
return groups.some(off100);
}
var SHARE_NOTE = '항목 %는 반올림한 값이라 더하면 100%가 조금 안 되거나 넘을 수 있어요.';
function kpiTabs(ctx, sel) {
var f = ctx.f, K = kpiSet(ctx), since = f.multi ? '작년 같은 달보다 ' : f.annual ? (K.sameMonths && K.sameMonths.length === 12 ? '작년보다 ' : '작년 같은 기간보다 ') : '지난달보다 ';
var list = kpiList(ctx);
return '<div class="kpis' + (list.length < C.kpis.length ? ' kpis-' + list.length : '') + '" role="tablist" aria-label="보고 싶은 숫자" data-keep="kpis">' + list.map(function (k) {
var x = K[k.id], on = k.id === sel.id, isR = k.kind === 'ratio';
var value = ctx.num(x, isR ? 'pct' : 'man');
var d = x.delta && F.isNum(x.delta.value) ? since + (isR ? ctx.num(x.delta, 'pp', { tone: U.tone(x.delta.value, k.good) }) : ctx.delta(x.delta, 'man', k.good)) : '<span class="dash">' + F.DASH + '</span>';
var extra = k.id === 'op_profit' && K.accrual && F.isNum(K.accrual.value) ? '<span class="delta">명세표 기준 ' + ctx.num(K.accrual, 'man') + '</span>' : '';
return '<button type="button" class="kpi" role="tab" id="tab-' + k.id + '" data-kpi="' + k.id + '" aria-selected="' + on + '" aria-controls="pnl-chart-panel" tabindex="' + (on ? 0 : -1) + '">' +
'<span class="kpi-label">' + U.esc(k.label) + '</span><span class="kpi-value">' + value + '</span><span class="delta">' + d + '</span>' + extra + '</button>';
}).join('') + '</div>';
}
function cells(ctx, line, unit, selIdx, pick, marks) {
return line.cells.map(function (c, i) {
var pm = pick && pick[i];
return '<td class="n' + (i === selIdx ? ' sel' : '') + (pm ? ' pickable' : '') + '"' + (pm ? ' data-pick-month="' + pm + '"' : '') + '>' + ctx.num(c, unit || 'digits', { tone: unit === 'pct' && F.isNum(c.value) && c.value < 0 ? 'bad' : '' }) + (marks && marks[i] ? marks[i] : '') + '</td>';
}).join('');
}
function foodMarks(ctx, months) {
if (!ctx.M.adjusted || !ctx.M.foodBank) return null;
return months.map(function (m) { var l = ctx.M.foodBank(m); return l.length ? '<sup class="mk" title="명세표 없음 → 통장 기준: ' + U.esc(l.join('·')) + '">*</sup>' : ''; });
}
function wholeOf(ctx, line) {
if (!(ctx.M.adjusted && line.id === 'food')) return line.total;
var its = shownItems(ctx, line).filter(function (it) { return F.isNum(it.amount.value) && it.amount.v; });
return its.length ? { value: its.reduce(function (a, it) { return a + it.amount.value; }, 0), v: its.map(function (it) { return '(' + it.amount.v + ')'; }).join(' + ') } : line.total;
}
function itemCell(ctx, it, hide) { return hide && it.personal ? '<span class="muted">가려 둠</span>' : ctx.num(it.amount, 'digits'); }
function tcfg(ctx) { return (ctx.V && ctx.V.pnlTable) || {}; }
function rowLabel(ctx, id) { var o = tcfg(ctx).labels; return (o && o[id]) || ctx.M.label(id); }
function yearTable(ctx, T, selIdx) {
var label = function (id) { return rowLabel(ctx, id); }, hide = ctx.prefs.hidePersonal, share = tcfg(ctx).revShare !== false;
var pctCell = function (html) { return share ? '<td class="n">' + html + '</td>' : ''; };
var colNames = T.groups ? T.groups.map(function (g) { return g.label; }) : T.months.map(function (m, i) { return (i + 1) + '월'; }), ncol = colNames.length;
var pick = T.groups ? null : T.months.map(function (m, i) { return T.hasData && T.hasData[i] ? m : null; });
var head = '<thead><tr><th scope="col">항목</th>' + colNames.map(function (c, i) {
return '<th class="n' + (i === selIdx ? ' sel' : '') + '" scope="col">' + (pick && pick[i] ? '<button type="button" class="month-pick" data-pick-month="' + pick[i] + '" aria-pressed="' + (i === selIdx) + '" title="' + U.esc(c) + ' 보기">' + U.esc(c) + '</button>' : U.esc(c)) + '</th>';
}).join('') + '<th class="n" scope="col">합계</th>' + (share ? '<th class="n" scope="col">매출 대비</th>' : '') + '</tr></thead>';
var row = function (line, opts) {
opts = opts || {};
var tx = txOn(ctx, line.id);
var name = opts.toggle ? (tx ? '<button type="button" class="toggle caret" data-toggle="' + line.id + '" aria-expanded="' + !!expanded[line.id] + '" aria-label="' + U.esc(label(line.id)) + ' 항목 펼치기"></button>' + txBtn(ctx, line.id, label(line.id))
: '<button type="button" class="toggle" data-toggle="' + line.id + '" aria-expanded="' + !!expanded[line.id] + '">' + U.esc(label(line.id)) + '</button>') : tx ? txBtn(ctx, line.id, label(line.id)) : U.esc(label(line.id));
return '<tr class="' + (opts.cls || '') + '"><th scope="row">' + name + '</th>' + cells(ctx, line, null, selIdx, pick, line.id === 'food' && !T.groups ? foodMarks(ctx, T.months) : null) + '<td class="n">' + ctx.num(line.total, 'digits', { tone: line.id === 'op_profit' && line.total.value < 0 ? 'bad' : '' }) + '</td>' + pctCell(ctx.num(line.pct, 'pct')) + '</tr>';
};
var sub = subOn(ctx), parentOf = { revenue: T.revenue };
var kids = function (parent, list) { return list.map(function (k) {
var whole = parentOf[parent];
var mcells = sub && whole ? k.cells.map(function (c, i) { return '<td class="n sh-cell' + (i === selIdx ? ' sel' : '') + '">' + shareHtml(ctx, c, whole.cells[i]) + '</td>'; }).join('') : cells(ctx, k, null, selIdx);
var tcell = sub && whole ? '<td class="n sh-cell">' + shareHtml(ctx, k.total, whole.total) + '</td>' : '<td class="n">' + ctx.num(k.total, 'digits') + '</td>';
return '<tr class="item" data-parent="' + parent + '"' + (expanded[parent] ? '' : ' hidden') + '><th scope="row">' + U.esc(label(k.id)) + '</th>' + mcells + tcell + pctCell(ctx.num(k.pct, 'pct')) + '</tr>'; }).join(''); };
var items = function (line) {
var tot = line.total.value || 0;
return shownItems(ctx, line).map(function (it) {
var masked = hide && it.personal;
var name = U.esc(it.label) + (it.moved && it.from.length && it.from.join('') !== it.label ? '<span class="sub">' + U.esc(it.from.join(' · ')) + '</span>' : '');
return '<tr class="item' + (it.moved ? ' moved' : '') + '" data-parent="' + line.id + '"' + (expanded[line.id] ? '' : ' hidden') + '><th scope="row">' + name + '</th><td colspan="' + ncol + '">' + (masked ? '' : '<span class="share" data-w="' + (tot ? (it.amount.value / tot) * 100 : 0).toFixed(1) + '"></span><span class="sr-only">' + U.esc(label(line.id)) + ' 안에서 ' + F.pct(tot ? it.amount.value / tot : null) + '</span>') + '</td>' +
(sub && !masked ? '<td class="n sh-cell">' + shareHtml(ctx, it.amount, wholeOf(ctx, line)) + '</td>' : '<td class="n">' + itemCell(ctx, it, hide) + '</td>') + pctCell(masked ? '' : ctx.num(it.pct, 'pct')) + '</tr>';
}).join('');
};
var body = row(T.revenue, { toggle: true, cls: 'total' }) + kids('revenue', T.revenue.children) + row(T.other) +
T.costs.map(function (c) { return row(c, { toggle: shownItems(ctx, c).length > 0 }) + items(c); }).join('') +
row(T.opCost, { cls: 'total' }) + row(T.profit, { cls: 'total' }) +
'<tr><th scope="row">이익률</th>' + cells(ctx, T.margin, 'pct', selIdx, pick) + '<td class="n">' + ctx.num(T.margin.total, 'pct') + '</td>' + pctCell('<span class="dash">' + F.DASH + '</span>') + '</tr>';
return '<div class="pnl-wrap table-wrap"><table class="pnl-table' + (T.groups ? ' period' : '') + (sub ? ' sum-sticky' : '') + (share ? '' : ' no-share') + (tcfg(ctx).slimLabel ? ' slim-label' : '') + '"><caption class="sr-only">' + (T.groups ? U.esc(periodLabel(ctx)) + ' 손익(원)' : T.year + '년 월별 손익(원)') + '</caption>' + head + '<tbody>' + body + '</tbody></table></div>';
}
function monthRows(ctx, T) {
var f = ctx.f, M = ctx.M, s = f.store, label = function (id) { return rowLabel(ctx, id); }, sub = subOn(ctx), hide = ctx.prefs.hidePersonal;
var lines = [T.revenue, T.other].concat(T.costs, [T.opCost, T.profit]);
var i = T.months.indexOf(f.month), all = whole(ctx);
var revOf = all ? T.revenue.total : T.revenue.cells[i];
var hasCostItems = false;
var subRows = function (ln) {
if (!sub) return [];
if (ln.id === 'revenue') return (ln.children || []).map(function (k) { return { name: label(k.id), part: all ? k.total : k.cells[i], whole: all ? ln.total : ln.cells[i] }; });
if (!ln.items) return [];
var list = shownItems(ctx, ln);
if (list.length) hasCostItems = true;
var w = wholeOf(ctx, ln);
return all ? list.map(function (it) { return { name: it.label, part: it.amount, whole: w, masked: hide && it.personal }; }) : [];
};
var ms = M.months(s), at = ms.indexOf(f.month), prevM = !all && at > 0 ? ms[at - 1] : null, nextM = !all && at >= 0 && at < ms.length - 1 ? ms[at + 1] : null;
var arrow = function (m, ch, word) { return m ? '<button type="button" class="go-month" data-go-month="' + m + '" aria-label="' + U.esc(F.month(m, { refYear: refYear(ctx) })) + ' ' + word + '">' + ch + '</button>' : '<span class="go-month off" aria-hidden="true">' + ch + '</span>'; };
var head = '<div class="row rows-head"><span class="grow">항목</span><span class="amt">' + (all ? '' : arrow(prevM, '‹', '보기(앞 달)')) + '<span class="rows-head-label">' + U.esc(periodLabel(ctx)) + ' 금액(원)</span>' + (all ? '' : arrow(nextM, '›', '보기(다음 달)')) + '</span></div>';
var body = lines.map(function (ln) {
var c = all ? ln.total : ln.cells[i];
var share = ln.id === 'revenue' || !c ? null : { value: F.isNum(c.value) && revOf && revOf.value ? c.value / revOf.value : null, v: usable(c) && usable(revOf) ? '(' + c.v + ') / (' + revOf.v + ')' : null };
var kidsRows = subRows(ln), open = !!expanded[ln.id];
var title = kidsRows.length ? '<button type="button" class="toggle" data-toggle="' + ln.id + '" aria-expanded="' + open + '">' + U.esc(label(ln.id)) + '</button>'
: txOn(ctx, ln.id) ? txBtn(ctx, ln.id, label(ln.id)) : U.esc(label(ln.id));
var fb = ln.id === 'food' && M.adjusted && !all && M.foodBank ? M.foodBank(f.month) : [];
return '<div class="row' + (kidsRows.length ? ' has-sub' : '') + '"><div class="grow"><span class="title">' + title + '</span><span class="line2">' + (share ? '매출 대비 ' + ctx.num(share, 'pct') + (all ? '' : ' · ') : '') + (all ? '' : T.year + '년 ' + ctx.num(ln.total, 'man')) + (fb.length ? ' · 명세표 없음 → 통장 기준: ' + U.esc(fb.join('·')) : '') + '</span></div>' +
'<span class="amt">' + ctx.num(c, 'digits', { tone: ln.id === 'op_profit' && c && c.value < 0 ? 'bad' : '' }) + '</span></div>' +
kidsRows.map(function (k) {
return '<div class="row item sub-row" data-parent="' + ln.id + '"' + (open ? '' : ' hidden') + '><span class="grow title">' + U.esc(k.name) + '</span><span class="amt stack">' +
(k.masked ? '<span class="muted">가려 둠</span>' : shareHtml(ctx, k.part, k.whole)) + '</span></div>';
}).join('');
}).join('');
var hint = !sub ? '' : all ? '<p class="note">대분류를 누르면 안 항목이 그 대분류 중 몇 %인지 보여요.</p>'
: '<p class="note">' + U.esc(L.josa(label('revenue'), '을/를')) + ' 누르면 어디서 들어왔는지 %로 보여요.' + (hasCostItems ? ' 다른 대분류 안 항목(전기·가스 같은 것)은 \'연간\'에서 보여요. 달마다 항목 금액은 엑셀에 없어요.' : '') + '</p>';
return '<div class="month-rows rows">' + head + body + '<div class="row"><span class="grow title">이익률</span><span class="amt">' + ctx.num(all ? T.margin.total : T.margin.cells[i], 'pct') + '</span></div>' + hint + '</div>';
}
function mixParts(ctx) { var f = ctx.f, M = ctx.M; return f.multi ? M.revenueMixOver(f.store, f.period) : f.annual ? M.revenueMixOver(f.store, M.yearMonths(f.store, f.year)) : M.revenueMix(f.store, f.month); }
function mixPanel(ctx) {
var M = ctx.M, f = ctx.f, mix = mixParts(ctx);
if (!mix.length) return _.panel('c6 mix', '매출 구성', '', U.emptyBlock(C.states.blockEmpty));
var kp = kpiSet(ctx).revenue, desc = (M.snap.fields || []).filter(function (x) { return x.table === 'web_monthly' && x.field === 'revenue'; })[0];
var rows = mix.map(function (p, i) {
return '<tr><th scope="row"><span class="sw" data-i="' + i + '"></span>' + U.esc(M.label(p.id)) + '</th><td class="n">' + ctx.num({ value: p.value, v: p.v }, 'digits') + '</td><td class="n">' + ctx.num({ value: p.share, v: p.shareV }, 'pct') + '</td></tr>';
}).join('');
var note = desc && desc.description ? '<p class="note">' + U.esc(M.label('revenue')) + ': ' + U.esc(String(desc.description).replace(/[.。]?$/, '')) + '.</p>' : '';
var since = f.multi ? '작년 같은 달보다 ' : f.annual ? '작년 같은 기간보다 ' : '지난달보다 ';
return _.panel('c6 mix', '매출 구성', U.esc(periodLabel(ctx)) + ' · ' + U.esc(ctx.storeName(f.store)),
'<div class="lead">' + ctx.num({ value: kp.value, v: kp.v }, 'man', { cls: 'kpi-value' }) + (kp.delta && F.isNum(kp.delta.value) ? '<span class="delta">' + since + ctx.delta(kp.delta, 'man', 'up') + '</span>' : '') + '</div><div id="pnl-mix"></div><table class="legend-table"><caption class="sr-only">매출 구성</caption><thead><tr><th scope="col">어디서</th><th class="n" scope="col">매출(원)</th><th class="n" scope="col">비율</th></tr></thead><tbody>' + rows + '</tbody></table>' + note);
}
var OUT_PERSONAL = ['kiwoom', 'owner_transfer', 'family_transfer', 'personal_out', 'personal_tax'];
function outCfg(ctx) { return (ctx.V && ctx.V.outside) || {}; }
function useOf(fl, id) { return fl ? fl.uses.filter(function (u) { return u.id === id; })[0] || null : null; }
function supParts(ctx, flows) {
var M = ctx.M, ids = outCfg(ctx).supRows || [];
if (ctx.f.store !== 'all' || !ids.length || !M.foodDiff) return null;
var rows = ids.map(function (id) { var nm = _.supName(ctx, id); return { id: id, name: nm + ' 외상', xs: flows.map(function (fl) { return fl ? M.foodDiff(nm, fl.months) : null; }) }; });
var same = flows.every(function (fl, j) {
if (!fl) return true;
var u = useOf(fl, 'supplier');
return !!u && F.isNum(u.x.value) && Math.abs(rows.reduce(function (a, r) { return a + r.xs[j].value; }, 0) - u.x.value) < 0.5;
});
return same ? rows : null;
}
function outsidePanel(ctx) {
var M = ctx.M, f = ctx.f, hide = ctx.prefs.hidePersonal, dc = (L.viewConfig || {}).FLOW_DEBT_COLS || [];
if (!M.cashFlow) return '';
var y = yearOf(ctx), opt = flowOpts(ctx);
var colsL = f.multi ? [{ label: '고른 기간', months: f.period }] : f.annual ? [{ label: y + '년', months: M.yearMonths(f.store, y) }]
: [{ label: F.month(f.month), months: [f.month] }, { label: y + '년', months: M.yearMonths(f.store, y) }];
var flows = colsL.map(function (c) { return M.cashFlow(f.store, c.months, dc, opt); });
if (!flows.some(Boolean)) return _.panel('c6 out-panel', '손익 밖 지출', U.esc(ctx.storeName(f.store)), U.emptyBlock(C.states.blockEmpty));
var nz = function (x) { return !!(x && F.isNum(x.value) && Math.abs(x.value) >= 0.5); };
var pop = flowPopOn(ctx), admin = !!(ctx.V && ctx.V.details), T = C.flowLines;
var nameHtml = function (id, text) { var t = text || (T[id] || { name: id }).name; return pop ? '<button type="button" class="txline" data-flow-line="' + id + '" aria-haspopup="dialog" title="' + U.esc(t) + ' 내역 보기">' + U.esc(t) + '</button>' : U.esc(t); };
var cell = function (x, masked) { return '<td class="n">' + (masked ? '<span class="muted">가려 둠</span>' : x ? ctx.num(x, 'digits') : '<span class="dash">' + F.DASH + '</span>') + '</td>'; };
var ids = [], body = '', maskedAny = false, inTotal = [], supOn = false;
var line = function (name, xs, masked) { body += '<tr><th scope="row">' + name + '</th>' + xs.map(function (x) { return cell(x, masked); }).join('') + '</tr>'; inTotal.push(xs); };
flows.forEach(function (fl) { if (fl) fl.uses.forEach(function (u) { if (ids.indexOf(u.id) < 0) ids.push(u.id); }); });
ids.forEach(function (id) {
var xs = flows.map(function (fl) { var u = useOf(fl, id); return u ? u.x : null; });
if (id === 'supplier') {
var parts = supParts(ctx, flows);
if (parts) parts.forEach(function (p) { if (p.xs.some(nz)) { line(U.esc(p.name), p.xs, false); supOn = true; } });
else if (xs.some(nz)) { line(nameHtml('supplier', '거래처 외상'), xs, false); supOn = true; }
return;
}
if (!xs.some(nz)) return;
var masked = hide && OUT_PERSONAL.indexOf(id) >= 0;
if (masked) maskedAny = true;
line(masked ? U.esc((T[id] || { name: id }).name) : nameHtml(id), xs, masked);
if (id === 'loan' && admin) {
var ps = flows.map(function (fl) { var u = useOf(fl, 'loan'); return u && u.parts ? u.parts.personal : null; });
if (ps.some(nz)) body += '<tr class="sub-row"><th scope="row">' + nameHtml('loan_personal') + '</th>' + ps.map(function (x) { return cell(x, false); }).join('') + '</tr>';
}
});
var totalOf = function (fl, j) {
if (!fl) return null;
var xs = inTotal.map(function (r) { return r[j]; }).filter(function (x) { return x && F.isNum(x.value) && x.v && String(x.v).indexOf('ui:') !== 0; });
var s = xs.reduce(function (a, x) { return a + x.value; }, 0);
return xs.length && F.isNum(fl.usedTotal.value) && Math.abs(s - fl.usedTotal.value) < 0.5 ? { value: s, v: xs.map(function (x) { return '(' + x.v + ')'; }).join(' + ') } : fl.usedTotal;
};
body += '<tr class="total"><th scope="row">합계</th>' + flows.map(function (fl, j) { return cell(totalOf(fl, j), maskedAny); }).join('') + '</tr>';
var bankSame = flows.every(function (fl) { return !fl || (fl.bank && F.isNum(fl.diff.value) && Math.abs(fl.diff.value) < 0.5); });
var leftName = bankSame ? '통장에 남은 돈' : '잔액';
body += '<tr class="left"><th scope="row">' + leftName + '</th>' + flows.map(function (fl) { return cell(fl ? fl.left : null, maskedAny); }).join('') + '</tr>';
var head = '<thead><tr><th scope="col">항목</th>' + colsL.map(function (c) { return '<th class="n" scope="col">' + U.esc(c.label) + '(원)</th>'; }).join('') + '</tr></thead>';
var note = (M.adjusted ? '영업이익에 넣지 않고 나간 돈이에요(세금 포함) — 합계는 지출 칸의 지출과 같아요.'
: '영업이익(통장 기준)에 넣지 않고 나간 돈이에요. 통장 그대로 보기라 세금은 영업비용 안에 있고 거래처에 보낸 돈은 식재료비에 들어 있어서 세금·거래처 외상 줄이 없어요.') +
' 영업이익 = 이 표의 합계 + ' + leftName + '이에요.' +
(supOn ? ' 거래처 외상 줄은 명세표로 산 것과 통장으로 보낸 돈의 차이예요(더 보냈으면 숫자 · 덜 보냈으면 −, 명세표가 있는 달만). 외상 잔액이 실제로 얼마나 줄었는지는 부채·외상 화면에 있어요.' : '') +
(!bankSame && flows.some(function (fl) { return fl && fl.bank; }) ? ' 잔액은 그 기간 통장 잔액 변화와 달라요 — 월세·급여·가족 명의 지출을 그 달 몫으로 옮긴 차이 등(지출 칸 참고 줄).' : '') +
(f.store !== 'all' ? ' 기타에는 가게 사이 이체도 들어 있어요.' : '') + (maskedAny ? ' 개인 항목은 가렸어요.' : '');
var noteHtml = ctx.V && ctx.V.quietNotes ? '' : '<p class="note">' + U.esc(note) + '</p>';
return _.panel('c6 out-panel', '손익 밖 지출', U.esc((f.multi ? periodLabel(ctx) + ' · ' : '') + ctx.storeName(f.store)),
'<table class="out-table"><caption class="sr-only">손익 밖 지출(원)</caption>' + head + '<tbody>' + body + '</tbody></table>' + noteHtml);
}
function foodNote(ctx, T) {
if (!ctx.M.adjusted || !ctx.M.foodBank) return '';
var list = (T.groups ? T.months : T.months.filter(function (m, i) { return T.hasData && T.hasData[i]; })).map(function (m) { var l = ctx.M.foodBank(m); return l.length ? F.month(m, { refYear: refYear(ctx) }) + ' ' + l.join('·') : ''; }).filter(Boolean);
return list.length ? '<p class="note">* 식재료비: 명세표가 없어 통장에서 낸 돈으로 넣은 거래처 — ' + U.esc(list.join(' · ')) + '</p>' : '';
}
function tableNotes(ctx, T) {
if (ctx.V && ctx.V.quietNotes) return '';
if (!subOn(ctx)) return foodNote(ctx, T) + '<p class="note">' + U.esc(C.opexNote) + (txOn(ctx, 'food') ? ' 줄 이름을 누르면 그 기간의 통장 거래를 모두 볼 수 있어요.' : '') + '</p>';
var moved = T.costs.some(function (c) { return shownItems(ctx, c).some(function (it) { return it.moved; }); });
return foodNote(ctx, T) + '<p class="note pc-only">대분류 이름을 누르면 안 항목이 그 대분류 중 몇 %인지 보여요(합계 칸 = 한 해).' + (ctx.M.adjusted ? ' 식재료 안 항목 %는 통장에서 낸 돈 기준이에요.' : '') + '</p>' +
(moved ? '<p class="note">' + U.esc(C.opexNote) + '</p>' : '') + (shareNoteNeeded(ctx, T) ? '<p class="note">' + U.esc(SHARE_NOTE) + '</p>' : '');
}
function flowLabel(ctx, u, sup) {
var id = u.id, x = u.x, T = C.flowLines, neg = F.isNum(x.value) && x.value < 0, who = '거래처' + (sup ? '(' + sup + ')' : '');
if (id === 'supplier') return neg ? [T.supplier_less.name, T.supplier_less.sub + ' · ' + who + ', 명세표가 있는 달만'] : [T.supplier.name, T.supplier.sub + ' · ' + who + ', 명세표가 있는 달만'];
var l = T[id] || { name: id, sub: '' };
if (id === 'loan' && neg) return [l.name, '들어온 돈(보험 해지환급 등)이 낸 돈보다 많았어요'];
if (id === 'other_out') return [l.name, (ctx.f.store === 'all' ? '분류 안 된 돈 등' : '가게 사이 이체 · 다른 가게와 나눈 몫 · 분류 안 된 돈') + (neg ? ' — 들어온 돈이 더 많았어요' : '')];
return [l.name, l.sub || ''];
}
function extraSub(ctx, u) {
if (!(ctx.V && ctx.V.details) || !u.parts) return '';
var nz = function (x) { return x && F.isNum(x.value) && Math.abs(x.value) >= 0.5 && x.v; };
if (u.id === 'loan' && nz(u.parts.personal)) return ' · 그중 ' + U.esc(C.flowLines.loan_personal.name) + ' ' + ctx.num(u.parts.personal, 'man');
if (u.id === 'kiwoom') {
var a = [];
if (nz(u.parts.owner)) a.push('대표자 명의 ' + ctx.num(u.parts.owner, 'man'));
if (nz(u.parts.family)) a.push('가족 명의 ' + ctx.num(u.parts.family, 'man'));
return a.length ? ' · ' + a.join(' · ') : '';
}
return '';
}
function flowMonths(ctx) {
var M = ctx.M, f = ctx.f;
if (f.multi) return f.period.filter(function (m) { return M.hasData(m, f.store); });
var y = yearOf(ctx), out = [];
for (var k = 1; k <= 12; k++) out.push(y + '-' + (k < 10 ? '0' : '') + k);
return out;
}
function flowOpts(ctx) { return { mergePersonal: !!(ctx.V && ctx.V.plainFlow) }; }
function monthLefts(ctx, months) {
var cols = (L.viewConfig || {}).FLOW_DEBT_COLS || [];
return months.map(function (m) { var x = ctx.M.cashFlow(ctx.f.store, [m], cols, flowOpts(ctx)); return x && F.isNum(x.left.value) && x.left.v ? x.left : null; });
}
function flowPopOn(ctx) { return ctx.V && ctx.V.details ? !!(ctx.txOk && ctx.txOk()) : !!(ctx.V && ctx.V.flowPop && ctx.txoOk && ctx.txoOk()); }
function flowPanel(ctx) {
var M = ctx.M, f = ctx.f, VC = L.viewConfig || {}, cols = VC.FLOW_DEBT_COLS || [];
var fl = M.cashFlow ? M.cashFlow(f.store, periodMonths(ctx), cols, flowOpts(ctx)) : null;
if (!fl || !fl.uses) return '';
var pop = flowPopOn(ctx), admin = !!(ctx.V && ctx.V.details);
var neg = function (x) { return { value: F.isNum(x.value) ? -x.value : null, v: x.v ? '-(' + x.v + ')' : null }; };
var earned = fl.earned, base = F.isNum(earned.value) && earned.value > 0 && earned.v ? earned.value : null;
var row = function (name, sub, x, cls, extra) {
return '<div class="row' + (cls ? ' ' + cls : '') + '"><div class="grow"><span class="title">' + name + '</span>' + (sub ? '<span class="line2">' + sub + '</span>' : '') + (extra || '') + '</div>' +
'<span class="amt">' + ctx.num(x, 'digits', { sign: true }) + '</span></div>';
};
var nameOf = function (id, text) { return pop ? '<button type="button" class="txline" data-flow-line="' + id + '" aria-haspopup="dialog" title="' + U.esc(text) + ' 내역 보기">' + U.esc(text) + '</button>' : U.esc(text); };
var shareOfEarned = function (x) { return base && F.isNum(x.value) && x.value > 0 && x.v ? { value: x.value / base, v: '(' + x.v + ') / (' + earned.v + ')' } : null; };
var bar = function (sh) { return sh ? '<span class="flow-bar" aria-hidden="true"><span class="share" data-w="' + Math.min(100, sh.value * 100).toFixed(1) + '"></span></span>' : ''; };
var shown = fl.uses.filter(function (u) { return F.isNum(u.x.value) && Math.abs(u.x.value) >= 0.5; });
var adj = shown.filter(function (u) { return u.id === 'supplier' && u.x.value < 0; })[0] || null;
var spend = shown.filter(function (u) { return u !== adj; });
var supNames = cols.map(function (c) { return shortName(M, c); }).join('·');
var body = row(U.esc(M.label('op_profit')), U.esc(fl.adjusted ? '세금 내기 전 · 손익 칸 영업이익과 같아요' : '통장 기준'), earned, 'lead-row');
body += '<div class="row flow-sec"><span class="grow">지출 내역</span>' + (base ? '<span class="sec-note">이익 대비</span>' : '') + '</div>';
spend.forEach(function (u) {
var l = flowLabel(ctx, u, supNames), sh = shareOfEarned(u.x);
body += row(nameOf(u.id, l[0]), U.esc(l[1]) + extraSub(ctx, u) + (sh ? ' · <b class="pct">이익의 ' + ctx.num(sh, 'pct0') + '</b>' : ''), neg(u.x), 'use', bar(sh));
});
var spendTotal = (function () {
var have = spend.filter(function (u) { return F.isNum(u.x.value) && u.x.v; });
return { value: have.reduce(function (a, u) { return a + u.x.value; }, 0), v: have.map(function (u) { return '(' + u.x.v + ')'; }).join(' + ') || null };
})();
if (spend.length > 1) { var tsh = shareOfEarned(spendTotal); body += row('지출 합계', tsh ? '이익의 ' + ctx.num(tsh, 'pct0') : '', neg(spendTotal), 'sub-total'); }
if (adj) { var la = flowLabel(ctx, adj, supNames); body += row(nameOf('supplier', la[0]), U.esc(la[1]), neg(adj.x), 'adj'); }
var t = fl.left.value;
body += row('잔액', U.esc(M.label('op_profit') + ' − 지출' + (adj ? ' + 거래처 외상 남음' : '')) + (F.isNum(t) && t < 0 && fl.left.v ? ' · 이익보다 ' + ctx.num({ value: -t, v: '-(' + fl.left.v + ')' }, 'man') + ' 더 썼어요' : ''), fl.left, 'total');
var refLine = '';
if (admin && fl.bank && F.isNum(fl.diff.value)) {
var who = f.store === 'all' ? '두 통장' : ctx.storeName(f.store) + ' 통장', same = Math.abs(fl.diff.value) < 0.5;
var whyRef = '';
if (!same) {
var shf = fl.shift, shOk = F.isNum(shf.value) && Math.abs(shf.value - fl.diff.value) < 0.5;
whyRef = shOk ? ' — 차이 ' + ctx.num(fl.diff, 'digits', { sign: true }) + '은 월세·급여·가족 명의 지출을 그 달 몫으로 옮긴 차이예요'
: ' — 차이 ' + ctx.num(fl.diff, 'digits', { sign: true }) + (F.isNum(shf.value) && Math.abs(shf.value) >= 0.5 ? '(그 달 몫으로 옮긴 차이 ' + ctx.num(shf, 'digits', { sign: true }) + ' · 나머지는 엑셀 손익과 통장 분류가 다른 몫)' : '(엑셀 손익과 통장 분류가 다른 몫)');
}
refLine = '<p class="flow-ref muted">참고: 그 기간 ' + U.esc(who) + ' 잔액 변화 ' + ctx.num(fl.bank.change, 'digits', { sign: true }) + (same ? ' — 위 잔액과 같아요' : whyRef) + '.</p>';
}
var debt = '';
if (fl.debt) {
var dc = fl.debt.change.value, names = fl.debt.cols.map(function (c) { return shortName(M, c); }).join('·');
debt = '<p class="flow-debt">거래처 외상(' + U.esc(names) + ')은 같은 기간 ' + (dc > 0 ? ctx.num(fl.debt.change, 'digits') + ' 늘었어요' : dc < 0 ? ctx.num({ value: -dc, v: '-(' + fl.debt.change.v + ')' }, 'digits') + ' 줄었어요' : '그대로예요') +
'.</p><p class="note">통장 기준이라 외상을 갚은 돈은 이미 ' + U.esc(M.label('food')) + '에 들어 있어요.</p>';
}
var half = f.store !== 'all' && M.hasHalf([f.store], fl.months) ? '<p class="note">' + U.esc(C.halfWonNote) + '</p>' : '';
var fms = flowMonths(ctx), lefts = monthLefts(ctx, fms);
var tbl = U.asTable('달마다 잔액', ['달', '잔액(원)'], fms.map(function (m, i) { return [lefts[i] ? '<button type="button" class="txline" data-flow-month="' + m + '" aria-haspopup="dialog">' + U.esc(F.month(m)) + '</button>' : U.esc(F.month(m)), ctx.num(lefts[i] || { value: null, v: 'ui:none' }, 'digits', { sign: true })]; }));
var chart = _.chartBox('pnl-flow', 220, _.barLabels(ctx, lefts, 'short')) + tbl;
var lead = ctx.V && ctx.V.quietNotes ? '' : '<p class="muted flow-lead">달마다 잔액(영업이익 − 지출)이에요. 0 위 = 남은 달, 아래 빨강 = 이익보다 더 쓴 달. 막대를 누르면 그 달 어디에 썼는지 보여요. 거래처에 명세표보다 더 보낸 달은 \'외상 갚음\', 덜 보낸 달은 \'외상 남음\'으로 보여요.</p>';
var listOn = !(ctx.V && ctx.V.flowBarsOnly);
var span = !f.multi ? yearOf(ctx) + '년' : fms.length > 1 ? F.month(fms[0], { year: true }) + '~' + F.month(fms[fms.length - 1], { refYear: Number(fms[0].slice(0, 4)) }) : periodLabel(ctx);
return _.panel('c12 flow', '지출', U.esc(span) + ' · ' + U.esc(ctx.storeName(f.store)),
lead + chart + (listOn ? '<h3 class="set-sub">' + U.esc(periodLabel(ctx)) + ' 지출 내역</h3><div class="rows flow-rows">' + body + '</div>' + refLine + debt : '') + half, null, { keep: 'flow' });
}
function shortName(M, col) { return String(M.colName(col)).replace(/\s*\(.*\)\s*$/, ''); }
var HALF_TEXT = '식재료(주류 빼고)·배달대행비·운영비는 두 가게 반반';
function basisLine(ctx) {
var M = ctx.M, toggle = !!(ctx.V && ctx.V.bankToggle), half = M.splitHalf ? '<span class="basis-half">' + U.esc(HALF_TEXT) + '</span>' : '';
if (ctx.bankView) return '<p class="basis-line" role="status"><span>통장 그대로 보는 중이에요(확인용 — 세금 포함, 낸 날 기준).</span>' + half + '<button type="button" class="btn ghost basis-btn" data-basis="adj">월 맞춤으로 보기</button></p>';
if (!M.adjusted) return half ? '<p class="basis-line">' + half + '</p>' : '';
return '<p class="basis-line"><span>손익 기준: 임대료·고정비·인건비는 그 달 몫, 식재료는 명세표, 가족 명의 지출은 3개월 평균, 세금은 손익에서 빼고 아래 지출에</span>' + half + (toggle ? '<button type="button" class="btn ghost basis-btn" data-basis="bank">통장 그대로 보기</button>' : '') + '</p>';
}
function ratioNote(ctx, sel) {
var M = ctx.M;
if (sel.id === 'food_ratio') return '식재료 원가율 = 식재료비 ÷ 매출이에요.' + (M.adjusted ? ' 월 맞춤이라 식재료비가 거래명세표 기준(명세표가 없는 달·거래처는 통장 기준)이고, 원가율도 그 기준이에요.' : ' 식재료비는 통장에서 낸 돈 기준이에요.');
if (sel.id === 'labor_ratio') return '인건비율 = 인건비 ÷ 매출이에요.' + (M.adjusted ? ' 인건비는 그 달 몫이에요(다음 달 초에 준 급여도 그 달에).' : '');
var rev = ctx.V && ctx.V.kpiLabels && ctx.V.kpiLabels.revenue ? ctx.V.kpiLabels.revenue + '(통장에 들어온 매출)' : '매출';
if (sel.id === 'op_margin') return '이익률 = 영업이익 ÷ ' + rev + '이에요.' + (M.adjusted ? ' 영업이익은 세금 내기 전이에요.' : '');
if (sel.id === 'revenue' && ctx.V && ctx.V.kpiLabels && ctx.V.kpiLabels.revenue) return ctx.V.kpiLabels.revenue + ' = 카드사·배달앱 등이 수수료를 떼고 통장에 넣어 준 매출이에요(손익 표의 매출과 같아요).';
return '';
}
var BC_KPIS = ['revenue', 'op_profit', 'op_margin', 'food_ratio', 'labor_ratio'];
function bcInfo(ctx, sel, series) {
var M = ctx.M, f = ctx.f;
if (!M.bcGaps || BC_KPIS.indexOf(sel.id) < 0) return null;
var months = series.map(function (p) { return p.month; }), gaps = M.bcGaps(f.store, months);
if (!gaps.length) return null;
var spans = [], ref = refYear(ctx);
gaps.forEach(function (g) {
var idx = g.shown.map(function (m) { return months.indexOf(m); }).filter(function (i) { return i >= 0; }).sort(function (a, b) { return a - b; });
var run = null;
idx.forEach(function (i) { if (run && i === run.to + 1) run.to = i; else { run = { from: i, to: i, label: (f.store === 'all' ? ctx.storeName(g.store) + ' ' : '') + 'BC카드 입금 없음', short: 'BC 없음', fill: 'warn' }; spans.push(run); } });
});
var note = gaps.map(function (g) {
var a = Number(g.from.slice(5)), b = Number(g.to.slice(5)), y = g.from.slice(0, 4) === g.to.slice(0, 4);
var when = y ? (Number(g.from.slice(0, 4)) !== ref ? g.from.slice(0, 4) + '년 ' : '') + (a === b ? a + '월' : a + '~' + b + '월') : F.month(g.from, { refYear: ref }) + '~' + F.month(g.to, { refYear: ref });
return U.esc(ctx.storeName(g.store)) + ' BC카드 입금이 ' + U.esc(when) + '에 한 번도 없어요' + (F.isNum(g.usual.value) ? ' — 평소 한 달 약 ' + ctx.num(g.usual, 'man') + '(앞 ' + g.usualN + '달 평균)' : '') + '.';
}).join(' ') + ' 그래프의 주황 띠예요. 매출에 더하지 않았어요. 카드사에 확인해 보세요.';
return { spans: spans, note: note };
}
function whyPanel(ctx) {
if (!ctx.V || !ctx.V.reasons || !L.reasons) return '';
var f = ctx.f, M = ctx.M, list = f.multi ? L.reasons.pnlOver(M, f.store, f.period, periodLabel(ctx)) : f.annual ? L.reasons.pnlYear(M, f.store, f.year) : L.reasons.pnlMonth(M, f.store, f.month);
var notes = ctx.V.notes && !f.multi ? M.notesFor('pnl', f.annual ? String(f.year) : f.month, f.store) : [];
var op = kpiSet(ctx).op_profit, bad = F.isNum(op.value) && op.value < 0;
return _.reasonsPanel(ctx, bad ? C.reasons.pnlBad : C.reasons.pnlGood, list, notes, { meta: U.esc(periodLabel(ctx)) + ' · ' + U.esc(ctx.storeName(f.store)), id: 'pnl-why' });
}
L.screens.pnl = {
title: function () { return C.nav[2].label; },
html: function (ctx) {
var M = ctx.M, f = ctx.f, sel = kpiDef(ctx, ctx.route.params.get('k') || 'op_profit'), T = tableOf(ctx);
var sub = U.esc(periodLabel(ctx)) + ' · ' + U.esc(ctx.storeName(f.store)) + ' · ' + U.esc(M.adjusted ? '월 맞춤 기준' : C.basisCash);
var series = seriesOf(ctx, sel);
var tableRows = series.map(function (p) { return [U.esc(F.month(p.month)), ctx.num({ value: p.value, v: p.v }, sel.kind === 'ratio' ? 'pct' : 'digits')]; });
var selIdx = whole(ctx) ? -1 : T.months.indexOf(f.month);
var chartTitle = f.multi ? sel.label + ', 고른 달마다' : sel.label + ', ' + yearOf(ctx) + '년 달마다';
var tableTitle = f.multi ? periodLabel(ctx) + ' 손익' : f.year + '년 월별 손익';
var bc = bcInfo(ctx, sel, series);
var noItems = f.multi && !T.hasItems ? '<p class="note">고른 달만의 항목별 금액은 엑셀에 없어요(해마다만 있어요). 줄 이름을 누르면 그 달들의 통장 거래를 분류와 함께 볼 수 있어요.</p>' : '';
return _.titleRow(C.nav[2].label, sub) + _.periodFilters(ctx) + selLine(ctx) + basisLine(ctx) + kpiTabs(ctx, sel) +
'<div class="grid mt">' +
'<section class="panel c12" role="tabpanel" id="pnl-chart-panel" data-keep="chart" aria-labelledby="tab-' + sel.id + '"><header><h2>' + U.esc(chartTitle) + '</h2><span class="meta">' + U.esc(ctx.storeName(f.store)) + '</span></header>' +
_.chartBox('pnl-chart', 220, _.barLabels(ctx, series.map(function (p) { return p.hasData && F.isNum(p.value) ? { value: p.value, v: p.v } : null; }), sel.kind === 'ratio' ? 'pct0' : 'short')) +
(bc && !(ctx.V && ctx.V.quietNotes) ? '<p class="note bc-note"><span class="bc-sw" aria-hidden="true"></span>' + bc.note + '</p>' : '') + (ratioNote(ctx, sel) ? '<p class="note">' + U.esc(ratioNote(ctx, sel)) + '</p>' : '') +
U.asTable(chartTitle, ['달', sel.kind === 'ratio' ? sel.label : sel.label + '(원)'], tableRows) + '</section>' +
flowPanel(ctx) + mixPanel(ctx) + outsidePanel(ctx) +
_.panel('c12 pnl-table-panel', tableTitle, (M.adjusted ? '월 맞춤' : '통장 기준') + ' · 원', yearTable(ctx, T, selIdx) + monthRows(ctx, T) +
tableNotes(ctx, T) + noItems +
(f.store !== 'all' && M.hasHalf([f.store], T.months) ? '<p class="note">' + U.esc(C.halfWonNote) + '</p>' : ''), null, { id: 'pnl-table', keep: 'table', link: storeSeg(ctx) }) + '</div>';
},
mount: function (rootEl, ctx) {
var M = ctx.M, f = ctx.f, sel = kpiDef(ctx, ctx.route.params.get('k') || 'op_profit'), fm = fmtOf(sel);
var s = seriesOf(ctx, sel), multiYear = f.multi && f.years.length > 1;
var hi = whole(ctx) ? -1 : s.map(function (p) { return p.month; }).indexOf(f.month);
var el = rootEl.querySelector('#pnl-chart');
var bc = bcInfo(ctx, sel, s);
if (el) window.Charts.columns(el, {
labels: s.map(function (p) { return F.month(p.month); }), tickLabels: s.map(function (p) { return multiYear ? p.month.slice(2, 4) + '.' + Number(p.month.slice(5)) : F.monthShort(p.month); }),
values: s.map(function (p) { return p.value; }), highlight: hi >= 0 ? hi : null, format: fm.f, tickFormat: fm.tick, height: 220,
valueLabels: el.parentNode.querySelector('.bar-labels'), spans: bc ? bc.spans : null,
ariaLabel: ctx.storeName(f.store) + ' ' + sel.label + (f.multi ? ' ' + periodLabel(ctx) + ' 고른 달마다 막대.' : ' ' + yearOf(ctx) + '년 달마다 막대.' + (hi >= 0 ? ' ' + F.month(f.month) + ' ' + fm.f(s[hi].value) + '.' : '')) + (bc ? ' ' + bc.spans.map(function (x) { return x.label; }).join(', ') + '.' : ''),
onSelect: function (i, bar) { var m = s[i].month; if (M.hasData(m, f.store)) { if (ctx.keep) ctx.keep(el); ctx.setFilter({ y: Number(m.slice(0, 4)), m: Number(m.slice(5)) }); } }
});
var mix = rootEl.querySelector('#pnl-mix'), parts = mixParts(ctx);
if (mix && parts.length) {
var res = window.Charts.stack100(mix, parts.map(function (p) { return { label: M.label(p.id), value: p.value }; }), { format: F.man, ariaLabel: '매출 구성: ' + parts.map(function (p) { return M.label(p.id) + ' ' + F.pct(p.share); }).join(', ') });
rootEl.querySelectorAll('.mix .sw').forEach(function (sw) { sw.style.background = res.styles[Number(sw.getAttribute('data-i'))]; });
}
var tabs = Array.prototype.slice.call(rootEl.querySelectorAll('[role="tab"][data-kpi]'));
var choose = function (id) {
var params = {}; ctx.route.params.forEach(function (v, k) { params[k] = v; }); params.k = id === 'op_profit' ? null : id;
var q = new URLSearchParams(); Object.keys(params).forEach(function (k) { if (params[k] != null && params[k] !== '') q.set(k, params[k]); });
history.replaceState(null, '', location.pathname + location.search + L.router.build(ctx.route.path, q));
if (ctx.keep) ctx.keep(rootEl.querySelector('.kpis'));
ctx.rerender();
var now = document.querySelector('[role="tab"][data-kpi="' + id + '"]'); if (now) now.focus({ preventScroll: true });
};
tabs.forEach(function (t, i) {
t.addEventListener('click', function () { choose(t.getAttribute('data-kpi')); });
t.addEventListener('keydown', function (e) {
var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; choose(n.getAttribute('data-kpi'));
});
});
var wrap = rootEl.querySelector('.pnl-wrap'), stk = wrap && wrap.querySelector('table.sum-sticky');
if (stk && wrap.scrollWidth > wrap.clientWidth) {
var ths = stk.querySelectorAll('thead th'), selTh = stk.querySelector('thead th.sel');
if (selTh && ths.length > 2) {
var fitSel = function () {
if (!selTh.isConnected) return;
var gap = selTh.getBoundingClientRect().right + 16 - ths[ths.length - 2].getBoundingClientRect().left;
if (gap > 0) wrap.scrollLeft = wrap.scrollLeft + gap;
};
fitSel();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSel);
}
}
var fel = rootEl.querySelector('#pnl-flow');
if (fel && M.cashFlow && window.Charts) {
var fms = flowMonths(ctx), lefts = monthLefts(ctx, fms), many = fms.length && fms[0].slice(0, 4) !== fms[fms.length - 1].slice(0, 4);
window.Charts.columns(fel, {
labels: fms.map(function (m) { return F.month(m); }), tickLabels: fms.map(function (m) { return many && Number(m.slice(5)) === 1 ? m.slice(2, 4) + '.1' : F.monthShort(m); }),
values: lefts.map(function (x) { return x ? x.value : null; }), highlight: null, format: F.man, tickFormat: F.tick, height: 220,
valueLabels: fel.parentNode.querySelector('.bar-labels'), spread: true,
ariaLabel: ctx.storeName(f.store) + ' 달마다 잔액 막대. ' + fms.map(function (m, i) { return F.month(m) + ' ' + F.man(lefts[i] ? lefts[i].value : null); }).join(', ') + '.',
onSelect: function (i, bar) { if (L.pop && L.pop.flowMonth) L.pop.flowMonth(ctx, fms[i], bar); }
});
}
rootEl.querySelectorAll('[data-flow-month]').forEach(function (b) { b.addEventListener('click', function () { if (L.pop && L.pop.flowMonth) L.pop.flowMonth(ctx, b.getAttribute('data-flow-month'), b); }); });
rootEl.querySelectorAll('[data-flow-line]').forEach(function (b) {
b.addEventListener('click', function () { if (L.pop && L.pop.flow) L.pop.flow(ctx, b.getAttribute('data-flow-line'), b, periodMonths(ctx)); });
});
rootEl.querySelectorAll('[data-tx-line]').forEach(function (b) {
b.addEventListener('click', function () { if (L.pop) L.pop.tx(ctx, b.getAttribute('data-tx-line'), b, periodMonths(ctx)); });
});
rootEl.querySelectorAll('.toggle[data-toggle]').forEach(function (b) {
b.addEventListener('click', function () {
var id = b.getAttribute('data-toggle'), open = !expanded[id]; expanded[id] = open;
rootEl.querySelectorAll('.toggle[data-toggle="' + id + '"]').forEach(function (x) { x.setAttribute('aria-expanded', String(open)); });
rootEl.querySelectorAll('.item[data-parent="' + id + '"]').forEach(function (tr) { tr.hidden = !open; });
});
});
},
outsidePanel: outsidePanel, supParts: supParts
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._, VC = L.viewConfig || {};
function codeOf(M, place, list) { var c = M && M.placeCode ? M.placeCode(place) : null; return c || 'p' + (list.indexOf(place) + 1); }
function placeOf(M, code, list) { for (var i = 0; i < list.length; i++) if (codeOf(M, list[i], list) === code) return list[i]; return null; }
function refYear(ctx) { return Number(String(ctx.M.today).slice(0, 4)); }
function monthHead(m, i, months) {
var y = m.slice(0, 4), first = i === 0 || months[i - 1].slice(0, 4) !== y;
return Number(m.slice(5)) + '월' + (first ? '<span class="sub">' + y + '</span>' : '');
}
var KIND_TEXT = { paid: '통장과 맞음', part: '일부만 통장과 맞음', unpaid: '안 낸 것 같아요(미납 추정)', check: '통장에서 못 찾음', auto: '자동납부 — 통장에서 아직 못 찾음',
nophoto: '사진 없음 · 통장에서 낸 돈', bank: '통장에서 낸 돈', record: '사장님 기록(다른 계좌)', xlbill: '엑셀 고지 금액(사진 없음)', missing: '매달 있는데 안 보여요', none: '없음' };
function cellHtml(ctx, c) {
var cls = 'n uc ' + c.kind + (c.hold ? ' hold' : ''), t = [KIND_TEXT[c.kind] || ''];
if (c.n > 1) t.push('고지서 ' + c.n + '장');
if (c.hold) t.push('판독 보류');
if (c.diff && c.bank && c.photo) t.push('통장 ' + F.won(c.bank.value));
if (c.diff && !c.photo && c.record) t.push('사장님 기록 ' + F.won(c.record.value) + '과 달라요');
if (c.bill && F.isNum(c.bill.arrears) && c.bill.arrears) t.push('미납 ' + F.won(c.bill.arrears) + ' 포함 청구 ' + F.won(c.bill.billed));
var inner;
if (c.amount) {
var n = ctx.num(c.amount, 'digits');
if (c.kind === 'paid') inner = '<mark class="hl">' + n + '</mark>';
else if (c.kind === 'part') inner = '<mark class="hl part">' + n + '</mark><span class="mk">일부</span>';
else if (c.kind === 'unpaid') inner = n + '<span class="mk bad" aria-hidden="true">!</span>';
else if (c.kind === 'check') inner = n + '<span class="mk q" aria-hidden="true">?</span>';
else if (c.kind === 'auto') inner = n + '<span class="mk auto">자동</span>';
else inner = n;
if (c.hold && c.kind !== 'paid') inner += '<span class="mk hold">보류</span>';
if (c.diff && !c.photo) inner += '<span class="mk" aria-hidden="true">≠</span>';
inner += '<span class="sr-only"> ' + U.esc(t.join(' · ')) + '</span>';
} else if (c.kind === 'missing') inner = '<span class="mk q" aria-hidden="true">?</span><span class="sr-only">빠짐</span>';
else inner = '<span class="dash" aria-hidden="true">' + F.DASH + '</span><span class="sr-only">없음</span>';
return '<td class="' + cls + '"' + (c.kind !== 'none' ? ' title="' + U.esc(t.filter(Boolean).join(' · ')) + '"' : '') + '>' + inner + '</td>';
}
function placeTable(ctx, G) {
var head = '<thead><tr><th scope="col">항목</th>' + G.months.map(function (m, i) { return '<th class="n" scope="col">' + monthHead(m, i, G.months) + '</th>'; }).join('') + '</tr></thead>';
var body = G.items.map(function (it) {
return '<tr><th scope="row">' + U.esc(it.item) + '</th>' + it.cells.map(function (c) { return cellHtml(ctx, c); }).join('') + '</tr>';
}).join('');
return '<div class="table-wrap util-wrap"><table class="util-table"><caption class="sr-only">' + U.esc(G.place) + ' 공과금, 청구월 기준(원)</caption>' + head + '<tbody>' + body + '</tbody></table></div>';
}
function legend(info) {
var item = function (sample, cls, text, tag) { return '<span class="lg-item"><' + (tag || 'span') + ' class="lg ' + cls + '" aria-hidden="true">' + sample + '</' + (tag || 'span') + '>' + U.esc(text) + '</span>'; };
if (!info.hasBills) return '<div class="util-legend" role="note" aria-label="칸 모양 설명">' + item('금액', 'bank', '통장에서 나감') + item('금액', 'record', '사장님 기록(다른 계좌)') + item('금액', 'xlbill', '고지서만') + item('?', 'q', '매달 있는데 안 보여요') + '</div>';
return '<div class="util-legend" role="note" aria-label="칸 모양 설명">' + item('금액', 'hl', '통장에서 낸 것과 맞은 고지서(형광)', 'mark') + item('일부', 'mk', '고지서 몇 장만 맞음') +
item('?', 'q', '통장에서 못 찾음') + item('!', 'bad', '안 낸 것 같아요(미납 추정)') + item('자동', 'mk auto', '자동납부인데 통장에서 못 찾음') + item('보류', 'mk hold', '사진 판독 보류') +
item('금액', 'nophoto', '흐린 글자 = 사진 없음(통장에서 낸 돈 · 사장님 기록)') + '</div>';
}
var KIND_PILL = { unpaid: ['안 낸 것 같아요', 'neg'], check: ['통장에서 못 찾음', 'warn'], auto: ['자동납부 · 통장에 없음', ''], part: ['일부만 맞음', ''] };
function ymText(ctx, m) { return F.month(m, { refYear: refYear(ctx) }); }
function spanText(ctx, a, b) {
if (a === b) return ymText(ctx, a);
if (a.slice(0, 4) !== b.slice(0, 4)) return F.month(a, { year: true }) + '~' + F.month(b, { year: true });
return (Number(a.slice(0, 4)) !== refYear(ctx) ? a.slice(0, 4) + '년 ' : '') + Number(a.slice(5)) + '~' + Number(b.slice(5)) + '월';
}
function IB(ctx) { return ctx.inbox && ctx.inbox.on() ? ctx.inbox : null; }
function groupKey(g, ref) { return 'util|' + (ref ? 'r' : 'g') + '|' + g.place + '|' + g.item + '|' + g.list.map(function (e) { return e.month; }).sort().join(','); }
function laterKey(e) { return 'util|l|' + e.place + '|' + e.item + '|' + e.month; }
function noteKey(ctx, n) { return 'note|' + n.id + '|' + (ctx.inbox ? ctx.inbox.keyHash(String(n.text || '')) : ''); }
function ibBits(ctx, key, meta) { var ib = IB(ctx); return ib ? ib.controls(key, meta) + ib.extras(key) : ''; }
function groupRow(ctx, g, isRef) {
var e = g.latest, ref = refYear(ctx), p = KIND_PILL[g.kind] || ['', ''];
var ks = Object.keys(g.kinds), kinds = ks.length === 1 ? '이런 고지서 ' + g.kinds[ks[0]] + '장' : ks.sort().map(function (k) { return (KIND_PILL[k] ? KIND_PILL[k][0] : k) + ' ' + g.kinds[k] + '장'; }).join(' · ');
var span = spanText(ctx, g.first, g.last), key = groupKey(g, isRef);
var label = g.place + ' · ' + g.item + ' · ' + ymText(ctx, e.month) + '분' + (e.amount && F.isNum(e.amount.value) ? ' ' + F.won(e.amount.value) : '') + (p[0] ? ' · ' + p[0] : '') + (g.list.length > 1 ? ' · ' + kinds + '(' + span + ')' : '');
return '<div class="row issue-row" data-kind="' + U.esc(g.kind) + '" data-ib-item="' + U.esc(key) + '"><div class="grow"><span class="title">' + U.esc(g.place) + ' · ' + U.esc(g.item) + ' ' + U.pill(p[0], p[1]) + '</span>' +
'<span class="line2">' + U.esc(ymText(ctx, e.month)) + '분' + (e.due ? ' · 납기 ' + ctx.num({ value: e.due, v: e.dueV }, 'date', { refYear: ref }) : '') + (e.auto ? ' · 자동납부' : '') + (e.hold ? ' · 판독 보류' : '') +
(g.list.length > 1 ? ' · ' + U.esc(kinds) + '(' + U.esc(span) + ')' : '') + '</span>' + ibBits(ctx, key, { scope: 'util', kind: 'issue', label: label }) + '</div>' +
'<span class="amt">' + (e.amount ? ctx.num(e.amount, 'won') : '<span class="dash">' + F.DASH + '</span>') + '</span></div>';
}
function laterRow(ctx, e, asOf) {
var ref = refYear(ctx), p = KIND_PILL[e.kind] || ['', ''], key = laterKey(e);
var label = e.place + ' · ' + e.item + ' · ' + ymText(ctx, e.month) + '분' + (e.amount && F.isNum(e.amount.value) ? ' ' + F.won(e.amount.value) : '') + (e.due ? ' · 납기 ' + F.date(e.due, { refYear: ref }) : '') + ' · 통장 자료 뒤라 다음 통장 반영 때 확인';
return '<div class="row issue-row later" data-ib-item="' + U.esc(key) + '"><div class="grow"><span class="title">' + U.esc(e.place) + ' · ' + U.esc(e.item) + ' <span class="muted">' + U.esc(ymText(ctx, e.month)) + '분</span></span>' +
'<span class="line2">' + (e.due ? '납기 ' + ctx.num({ value: e.due, v: e.dueV }, 'date', { refYear: ref }) + (e.days != null && !e.auto ? ' · ' + ctx.num({ value: e.days, v: 'ui:days' }, 'days', { tone: e.days < 0 ? 'bad' : e.days <= 7 ? 'warn' : '' }) : '') : '납기 모름') +
' · ' + (e.auto ? '자동납부' : '직접 내기') + (e.hold ? ' · 판독 보류' : '') + ' · 통장 자료(' + U.esc(F.date(asOf, { refYear: ref })) + ') 뒤라 다음 통장 반영 때 확인' + '</span>' + ibBits(ctx, key, { scope: 'util', kind: 'issue', label: label }) + '</div>' +
'<span class="amt">' + (e.amount ? ctx.num(e.amount, 'won') : '<span class="dash">' + F.DASH + '</span>') + '</span></div>';
}
function noteItems(ctx, list) {
return '<ul class="notes-list util-notes">' + list.map(function (n) {
var key = noteKey(ctx, n);
return '<li class="note-item" data-kind="' + U.esc(n.kind || 'info') + '" data-ib-item="' + U.esc(key) + '">' + U.esc(n.text) + ibBits(ctx, key, { scope: 'util', kind: 'note', label: n.text }) + '</li>';
}).join('') + '</ul>';
}
function issuesPanel(ctx, info, place, hide) {
var M = ctx.M, I = M.utilIssues(), N = ctx.V && ctx.V.notes ? M.utilNotes() : { main: [], ref: [] }, ref = refYear(ctx), ib = IB(ctx);
var inPlace = function (x) { return !place || x.place === place; };
var live = function (key) { return !ib || ib.shown(key); };
var open = I.open.filter(inPlace).filter(function (g) { return live(groupKey(g)); }), later = I.later.filter(inPlace).filter(function (e) { return live(laterKey(e)); });
var refG = I.ref.filter(function (g) { return inPlace(g) && !(hide && g.place === '개인') && live(groupKey(g, true)); });
N = { main: N.main.filter(function (n) { return live(noteKey(ctx, n)); }), ref: N.ref.filter(function (n) { return live(noteKey(ctx, n)); }) };
var tabsHtml = ib ? ib.tabs('util', open.length + later.length + N.main.length + ib.memos('util').length) : '';
if (ib && ib.tabOf('util') === 'done') return _.panel('c12 util-issues', '아직 안 낸 것·특이사항', '', ib.message() + ib.donePanel('util'), null, { keep: 'issues', link: tabsHtml });
var body = ib ? ib.message() : '';
if (!info.hasBills) body += U.emptyBlock(C.util.noBills);
else {
body += '<h3 class="set-sub first">통장에서 못 찾은 가게 고지서</h3>' + (open.length ? '<div class="rows issue-list">' + open.map(function (g) { return groupRow(ctx, g); }).join('') + '</div>'
: '<p class="muted">' + U.esc(place ? place + '에는 없어요.' : '없어요. 가게 고지서는 모두 통장에서 낸 것과 맞아요.') + '</p>');
if (later.length) body += '<h3 class="set-sub">통장 자료(' + U.esc(F.date(I.bankAsOf, { refYear: ref })) + ') 뒤에 낼 것</h3><div class="rows issue-list">' + later.map(function (e) { return laterRow(ctx, e, I.bankAsOf); }).join('') + '</div>';
}
if (N.main.length) body += '<h3 class="set-sub">' + U.esc(C.reasons.notes) + '</h3>' + noteItems(ctx, N.main);
if (refG.length || N.ref.length) {
var n = refG.length + N.ref.length;
body += '<details class="as-table util-ref"><summary>참고 — 가게 비용이 아닌 것(집 2·3층 등) ' + n + '가지</summary>' +
(refG.length ? '<div class="rows issue-list">' + refG.map(function (g) { return groupRow(ctx, g, true); }).join('') + '</div>' : '') + (N.ref.length ? noteItems(ctx, N.ref) : '') + '</details>';
}
if (ib) body += ib.memoBox('util');
var foot = '<span class="muted">' + U.esc('통장 자료가 ' + F.date(info.bankAsOf, { refYear: ref }) + '까지라 그 뒤에 낸 돈은 아직 몰라요.') +
(info.billsLast ? ' 고지서 사진은 ' + U.esc(F.date(info.billsLast, { refYear: ref })) + ' 것까지 들어와 있어요.' : '') +
(F.isNum(info.skipped) && info.skipped ? ' 중복·안내문·견적·가게와 상관없는 곳 사진 ' + info.skipped + '장은 뺐어요.' : '') + '</span>';
return _.panel('c12 util-issues', '아직 안 낸 것·특이사항', info.hasBills ? '고지서 사진 · 통장 · 메모' : '', body, foot, { keep: 'issues', link: tabsHtml });
}
function bankOnlyPanel(ctx, list, hide) {
var rows = list.filter(function (x) { return !(hide && x.place === '개인'); });
if (!rows.length) return '';
return '<details class="as-table c12 util-bankonly"><summary>사진 없이 통장에서만 나간 것(엑셀 공과금 시트) ' + rows.length + '가지</summary><div class="rows">' + rows.map(function (x) {
return '<div class="row"><div class="grow"><span class="title">' + U.esc(x.place) + ' · ' + U.esc(x.item) + '</span><span class="line2">' + x.n + '달 · ' + U.esc(spanText(ctx, x.first, x.last)) + '</span></div><span class="amt">' + ctx.num(x.total, 'won') + '</span></div>';
}).join('') + '</div></details>';
}
L.screens.util = {
title: function () { return C.nav[5].label; },
html: function (ctx) {
var M = ctx.M, info = M.util(), ref = refYear(ctx), hide = ctx.prefs.hidePersonal;
var places = M.utilPlaces().filter(function (p) { return !(hide && p === '개인'); });
var all = M.utilPlaces();
var want = ctx.route.params.get('place'), place = want ? placeOf(ctx.M, want, all) : null;
if (place && places.indexOf(place) < 0) place = null;
var sub = U.esc(info.hasBills ? '보낸 고지서 사진 기준' : C.util.sub) + ' · 통장 ' + U.esc(F.date(info.bankAsOf, { refYear: ref })) + '까지' + (info.billsLast ? ' · 고지서 ' + U.esc(F.date(info.billsLast, { refYear: ref })) + '까지' : '');
var seg = places.length > 1 ? '<div class="filters" role="group" aria-label="구분 고르기" data-keep="filters"><div class="segmented" role="group" aria-label="구분">' +
'<button type="button" data-place="all" aria-pressed="' + !place + '">전체</button>' + places.map(function (p) {
return '<button type="button" data-place="' + U.esc(codeOf(ctx.M, p, all)) + '" aria-pressed="' + (place === p) + '">' + U.esc(p) + '</button>';
}).join('') + '</div></div>' : '';
var shown = place ? [place] : places;
var grids = shown.map(function (p) {
var G = M.utilGrid(p);
return _.panel('c12 util-place', p, '청구월 기준 · 최근 달이 왼쪽 · 원', placeTable(ctx, G));
}).join('');
return _.titleRow(C.nav[5].label, sub) + seg +
'<div class="grid">' + issuesPanel(ctx, info, place, hide) +
(shown.length ? '<div class="c12">' + legend(info) + '</div>' + grids : _.panel('c12', '공과금', '', U.emptyBlock(C.states.blockEmpty))) +
(place ? '' : bankOnlyPanel(ctx, M.utilBankOnly(), hide)) +
'<p class="c12 note util-note">' + U.esc(info.hasBills ? '칸 금액은 고지서 사진의 그 달 몫(당월)이에요. 사진이 없는 달은 엑셀 공과금 시트의 통장 금액을 흐리게 보여요. 폰에서는 표를 옆으로 밀면 지난 달이 보여요.'
: '통장에서 나간 돈은 낸 날로 청구월을 정해요(엑셀 공과금 시트와 같아요). 폰에서는 표를 옆으로 밀면 지난 달이 보여요.') + (hide ? ' 개인 구분은 가렸어요.' : '') + '</p></div>';
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, TX = L.tx;
var cur = null;
var LIMIT = 200;
function refYear(ctx) { return Number(String(ctx.M.today).slice(0, 4)); }
function periodText(ctx, months) {
if (!months || !months.length) return '';
var ref = refYear(ctx);
if (months.length === 1) return F.month(months[0], { refYear: ref });
var ys = Array.from(new Set(months.map(function (m) { return m.slice(0, 4); })));
if (ys.length === 1) {
var a = Number(months[0].slice(5)), b = Number(months[months.length - 1].slice(5));
return ys[0] + '년 ' + (months.length === b - a + 1 ? a + '~' + b + '월' : months.length + '달');
}
return ys.join('·') + '년 ' + months.length + '달';
}
function lineLabel(ctx, line) { return line ? ctx.M.label(line) : '모든 줄'; }
function storeText(ctx, split) { return split === 'h' ? '반반' : split === 'a' ? ctx.storeName('2ho') : ctx.storeName('eungam'); }
function clsOf(r) { return r.cls === TX.LOAN_P_NAME ? r.cls : r.major + ' › ' + r.item + (r.detail ? ' · ' + r.detail : ''); }
function won(ctx, v, tone) { return ctx.num({ value: v, v: 'ui:pop' }, 'digits', tone ? { tone: tone } : undefined); }
function man(ctx, v, opts) { return ctx.num({ value: v, v: 'ui:pop' }, 'man', opts); }
function close() {
if (!cur) return;
var a = cur.anchor;
if (cur.layer.parentNode) cur.layer.parentNode.removeChild(cur.layer);
document.removeEventListener('keydown', onKey, true);
cur = null;
if (a && a.isConnected && a.focus) a.focus({ preventScroll: true });
}
function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
var FIT = { min: 180, max: 420 };
function px(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
function fitHeight(p, chartEl) {
var pop = p && p.layer ? p.layer.querySelector('.pop') : null, body = p ? p.body : null;
if (!pop || !body || !chartEl || !chartEl.isConnected) return FIT.min;
var cs = getComputedStyle(pop), bs = getComputedStyle(body);
var maxH = px(cs.maxHeight) || ((window.innerHeight || 0) - 32);
var used = px(cs.borderTopWidth) + px(cs.borderBottomWidth) + px(cs.paddingTop) + px(cs.paddingBottom) + px(bs.paddingTop) + px(bs.paddingBottom);
Array.prototype.forEach.call(pop.children, function (c) { if (c !== body) used += c.getBoundingClientRect().height; });
Array.prototype.forEach.call(body.children, function (c) {
var m = getComputedStyle(c);
used += px(m.marginTop) + px(m.marginBottom) + (c === chartEl ? 0 : c.getBoundingClientRect().height);
});
return Math.round(Math.max(FIT.min, Math.min(FIT.max, maxH - used - 2)));
}
function open(anchor, title, sub) {
close();
var layer = document.createElement('div');
layer.className = 'pop-layer';
layer.innerHTML = '<div class="pop-back" data-pop-close></div>' +
'<section class="pop" role="dialog" aria-modal="false" aria-labelledby="pop-title">' +
'<header class="pop-head"><div class="pop-titles"><h2 id="pop-title">' + U.esc(title) + '</h2>' + (sub ? '<p class="pop-sub">' + sub + '</p>' : '') + '</div>' +
'<button type="button" class="pop-x" data-pop-close aria-label="닫기">' + U.icon('x') + '</button></header>' +
'<div class="pop-body"><p class="muted pop-loading" role="status">내역을 불러오고 있어요…</p></div></section>';
(document.querySelector('.app') || document.body).appendChild(layer);
layer.addEventListener('click', function (e) { if (e.target.closest('[data-pop-close]')) { e.preventDefault(); close(); } });
document.addEventListener('keydown', onKey, true);
cur = { layer: layer, anchor: anchor, body: layer.querySelector('.pop-body') };
var x = layer.querySelector('.pop-x'); if (x) x.focus({ preventScroll: true });
return cur;
}
function setTitle(title, sub) {
if (!cur) return;
cur.layer.querySelector('#pop-title').textContent = title;
var s = cur.layer.querySelector('.pop-sub'); if (s) s.innerHTML = sub || '';
}
function load(ctx, months) {
if (!ctx.loadTx) return Promise.resolve([]);
return ctx.loadTx(months).catch(function () { return []; });
}
function emptyNote(text) { return '<p class="muted pop-empty">' + U.esc(text) + '</p>'; }
function tx(ctx, line, anchor, months) {
var M = ctx.M, store = ctx.f.store;
var st = { line: line, mode: 'group', sort: 'amount', q: '', limit: LIMIT, contents: null };
var head = function () { return lineLabel(ctx, st.line) + ' 내역'; };
var subText = function () { return U.esc(periodText(ctx, months)) + ' · ' + U.esc(ctx.storeName(store)) + ' · 통장 기재내용 그대로'; };
var p = open(anchor, head(), subText());
var listEl = null;
function controls() {
var seg = function (attr, items, on) {
return '<div class="segmented" role="group">' + items.map(function (it) { return '<button type="button" data-' + attr + '="' + it[0] + '" aria-pressed="' + (on === it[0]) + '">' + U.esc(it[1]) + '</button>'; }).join('') + '</div>';
};
var lines = ['<option value=""' + (!st.line ? ' selected' : '') + '>모든 줄(손익 안·밖)</option>'].concat(TX.LINES.map(function (l) {
return '<option value="' + l + '"' + (st.line === l ? ' selected' : '') + '>' + U.esc(M.label(l)) + '</option>';
})).join('');
return '<div class="pop-tools">' +
'<label class="select"><span class="sr-only">줄</span><select data-pt-line>' + lines + '</select></label>' +
seg('pt-mode', [['group', '거래처별'], ['each', '한 건씩']], st.mode) + seg('pt-sort', [['amount', '금액 큰 순'], ['date', '날짜 순']], st.sort) +
'<label class="pop-search"><span class="sr-only">이름 찾기</span><input type="search" data-pt-q placeholder="이름 · 분류 찾기" value="' + U.esc(st.q) + '" autocomplete="off"></label>' +
'</div><div class="pop-list" aria-live="polite"></div>';
}
function cls(ctx2, r) {
return U.esc(clsOf(r)) + ' · <span class="' + (r.inside ? 'pl-in' : 'pl-out') + '">' + (r.inside ? '손익 안' : '손익 밖') + '</span>';
}
function renderList() {
if (!listEl) return;
var rows = TX.rows(st.contents, { store: store, line: st.line, q: st.q });
var t = TX.total(rows);
var fl = st.line ? null : TX.flow(rows);
var sum = '<p class="pop-sum"><b>' + F.count(t.count) + '</b> · ' + (fl ? '들어온 돈 ' + won(ctx, fl.inflow) + ' · 나간 돈 ' + won(ctx, fl.outflow) : '합계 ' + won(ctx, t.amount));
if (st.line && !st.q) {
var cols = st.line === 'opex' ? ['opex', 'review'] : [st.line], pl = (M.sumOverBank || M.sumOver)(store, months, cols), adjV = M.adjusted ? M.sumOver(store, months, cols) : null;
if (F.isNum(pl.value)) sum += Math.abs(pl.value - t.amount) <= 1 ? ' <span class="good">· ' + (M.adjusted ? '통장 기준 손익과 같아요' : '손익표와 같아요') + '</span>' : ' <span class="warn">· ' + (M.adjusted ? '통장 기준 손익 ' : '손익표 ') + won(ctx, pl.value) + '과 ' + won(ctx, t.amount - pl.value) + ' 달라요</span>';
if (adjV && F.isNum(adjV.value) && Math.abs(adjV.value - pl.value) > 1) sum += '<br><span class="muted">손익표(월 맞춤)는 ' + won(ctx, adjV.value) + '이에요 — 그 달 몫으로 옮기거나 명세표·3개월 평균을 써서 통장과 달라요.</span>';
}
sum += '</p>';
var body;
if (!rows.length) body = emptyNote(st.q ? '찾는 이름이 없어요.' : '이 기간에는 거래가 없어요.');
else if (st.mode === 'group') {
var gs = TX.groupByName(rows, st.sort);
body = '<ol class="tx-list">' + gs.slice(0, st.limit).map(function (g) {
var keys = Object.keys(g.classes), stores = Object.keys(g.splits).map(function (s) { return storeText(ctx, s); }).join('·');
var clsText = keys.length === 1 ? U.esc(keys[0]) : '<span class="warn">분류 ' + keys.length + '가지</span>: ' + keys.map(function (k) { return U.esc(k) + ' ' + g.classes[k] + '건'; }).join(' · ');
var io = g.outside && g.inside ? ' · <span class="warn">손익 안·밖 섞임</span>' : g.outside ? ' · <span class="pl-out">손익 밖</span>' : '';
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(g.name) + '</span><span class="tx-amt">' + won(ctx, g.amount) + '</span></div>' +
'<div class="tx-sub">' + F.count(g.count) + ' · ' + clsText + io + ' · ' + U.esc(stores) + '</div></li>';
}).join('') + '</ol>' + (gs.length > st.limit ? '<button type="button" class="btn ghost pop-more" data-pt-more>' + (gs.length - st.limit) + '곳 더 보기</button>' : '');
} else {
var list = TX.sortRows(rows, st.sort);
body = '<ol class="tx-list">' + list.slice(0, st.limit).map(function (r) {
var opp = (r.amount < 0) ? ' <span class="pill warn">' + (r.raw > 0 ? '입금' : '출금') + '</span>' : '';
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(r.name) + opp + '</span><span class="tx-amt">' + won(ctx, r.amount) + '</span></div>' +
'<div class="tx-sub">' + U.esc(F.date(r.date, { refYear: refYear(ctx) })) + ' · ' + cls(ctx, r) + ' · ' + U.esc(storeText(ctx, r.split)) + '</div></li>';
}).join('') + '</ol>' + (list.length > st.limit ? '<button type="button" class="btn ghost pop-more" data-pt-more>' + (list.length - st.limit) + '건 더 보기</button>' : '');
}
listEl.innerHTML = sum + body;
}
load(ctx, months).then(function (contents) {
if (!cur || cur !== p) return;
if (!contents.length) { p.body.innerHTML = emptyNote('이 기간의 내역 자료가 아직 없어요(통장 정본이 있는 달만 있어요).'); return; }
st.contents = contents;
p.body.innerHTML = controls();
listEl = p.body.querySelector('.pop-list');
renderList();
p.body.addEventListener('click', function (e) {
var b = e.target.closest('[data-pt-mode],[data-pt-sort],[data-pt-more]');
if (!b) return;
if (b.hasAttribute('data-pt-mode')) st.mode = b.getAttribute('data-pt-mode');
else if (b.hasAttribute('data-pt-sort')) st.sort = b.getAttribute('data-pt-sort');
else if (b.hasAttribute('data-pt-more')) st.limit += LIMIT;
p.body.querySelectorAll('[data-pt-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-pt-mode') === st.mode)); });
p.body.querySelectorAll('[data-pt-sort]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-pt-sort') === st.sort)); });
renderList();
});
p.body.addEventListener('input', function (e) { if (e.target.matches('[data-pt-q]')) { st.q = e.target.value; st.limit = LIMIT; renderList(); } });
p.body.addEventListener('change', function (e) {
if (e.target.matches('[data-pt-line]')) { st.line = e.target.value || null; st.limit = LIMIT; setTitle(head(), subText()); renderList(); }
});
}).catch(function (e) { if (cur === p) p.body.innerHTML = emptyNote('내역을 못 불러왔어요. ' + (e && e.userMessage ? e.userMessage : '')); });
return p;
}
function table(head, rows) {
return '<div class="table-wrap"><table class="pop-table"><thead><tr>' + head.map(function (h, i) { return '<th scope="col"' + (i ? ' class="n"' : '') + '>' + U.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td class="n">' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
}
function drillPl(ctx, d, p) {
var M = ctx.M, store = ctx.f.store, A = d.A || [], B = d.B || [];
var la = periodText(ctx, A), lb = periodText(ctx, B);
setTitle(M.label(d.line) + (B.length ? ' · ' + la + '과 ' + lb : ' · ' + la), U.esc(ctx.storeName(store)) + ' · 차이 큰 거래처 순 · 통장 기재내용 그대로');
load(ctx, A.concat(B)).then(function (contents) {
if (cur !== p) return;
if (!contents.length) { p.body.innerHTML = emptyNote('이 기간의 내역 자료가 아직 없어요.'); return; }
var inA = function (c) { return A.indexOf(c.txm.m) >= 0; }, inB = function (c) { return B.indexOf(c.txm.m) >= 0; };
var ra = TX.rows(contents.filter(inA), { store: store, line: d.line }), rb = TX.rows(contents.filter(inB), { store: store, line: d.line });
var html = '';
if (B.length) {
var dir = d.dir || 0, diffs = TX.diffByName(ra, rb);
if (dir) diffs = diffs.filter(function (g) { return g.d * dir > 0; }).concat(diffs.filter(function (g) { return !(g.d * dir > 0); }));
html += '<h3 class="pop-h">달라진 거래처</h3>' + table(['거래처', la, lb, '차이'], diffs.slice(0, 10).map(function (g) {
return [U.esc(g.name), won(ctx, g.a), won(ctx, g.b), ctx.num({ value: g.d, v: 'ui:pop' }, 'digits', { sign: true, tone: g.d * (dir || 1) > 0 ? '' : 'muted' })];
}));
}
var big = TX.sortRows(ra, 'amount').slice(0, 8);
html += '<h3 class="pop-h">큰 거래 · ' + U.esc(la) + '</h3>' + (big.length ? '<ol class="tx-list">' + big.map(function (r) {
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(r.name) + '</span><span class="tx-amt">' + won(ctx, r.amount) + '</span></div>' +
'<div class="tx-sub">' + U.esc(F.date(r.date, { refYear: refYear(ctx) })) + ' · ' + U.esc(clsOf(r)) + ' · ' + U.esc(storeText(ctx, r.split)) + '</div></li>';
}).join('') + '</ol>' : emptyNote('거래가 없어요.'));
html += '<p class="pop-foot"><button type="button" class="btn" data-pop-tx="' + U.esc(d.line) + '">' + U.esc(M.label(d.line)) + ' 내역 전부 보기</button></p>';
p.body.innerHTML = html;
var b = p.body.querySelector('[data-pop-tx]');
if (b) b.addEventListener('click', function () { tx(ctx, d.line, p.anchor, A); });
});
}
function drillLines(ctx, d, p) {
var M = ctx.M, store = ctx.f.store, A = d.A || [];
setTitle('손익 줄 · ' + periodText(ctx, A), U.esc(ctx.storeName(store)) + ' · 줄을 누르면 그 내역');
var rows = [['revenue', ['revenue']], ['other_income', ['other_income']]].concat(M.SHOWN_COSTS.map(function (c) { return [c.id, c.cols]; }));
var rev = M.sumOver(store, A, ['revenue']);
p.body.innerHTML = '<ol class="tx-list">' + rows.map(function (x) {
var v = M.sumOver(store, A, x[1]);
if (!F.isNum(v.value) || !v.value) return '';
return '<li class="tx-row"><button type="button" class="tx-main as-btn" data-pop-tx="' + x[0] + '"><span class="tx-name">' + U.esc(M.label(x[0])) + '</span><span class="tx-amt">' + won(ctx, v.value) + '</span></button>' +
(x[0] !== 'revenue' && rev.value ? '<div class="tx-sub">매출의 ' + F.pct(v.value / rev.value) + '</div>' : '') + '</li>';
}).join('') + '</ol>';
p.body.querySelectorAll('[data-pop-tx]').forEach(function (b) { b.addEventListener('click', function () { tx(ctx, b.getAttribute('data-pop-tx'), p.anchor, A); }); });
}
function drillSuppliers(ctx, d, p) {
var M = ctx.M, rows = (M.snap.supplierRecent || []).filter(function (r) { return String(r.date).slice(0, 7) === d.month; });
var name = function (id) { var x = (M.snap.debts || []).filter(function (g) { return g.debt_id === id; })[0]; return x ? x.name : id; };
setTitle('거래처 명세표 · ' + periodText(ctx, [d.month]), '산 것(명세표)과 보낸 돈, 거래처마다');
var by = {}, order = [];
rows.forEach(function (r) { var g = by[r.supplier]; if (!g) { g = by[r.supplier] = { id: r.supplier, buy: 0, paid: 0 }; order.push(g); } g.buy += r.buy_total || 0; g.paid += r.paid || 0; });
var big = rows.filter(function (r) { return (r.buy_total || 0) > 0 || (r.paid || 0) > 0; }).sort(function (a, b) { return Math.max(b.buy_total || 0, b.paid || 0) - Math.max(a.buy_total || 0, a.paid || 0); }).slice(0, 8);
p.body.innerHTML = (order.length ? table(['거래처', '산 것', '보낸 돈', '외상 변화'], order.map(function (g) { return [U.esc(name(g.id)), won(ctx, g.buy), won(ctx, g.paid), ctx.num({ value: g.buy - g.paid, v: 'ui:pop' }, 'digits', { sign: true })]; })) : emptyNote('이 달 명세표가 없어요.')) +
(big.length ? '<h3 class="pop-h">큰 날</h3><ol class="tx-list">' + big.map(function (r) {
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(name(r.supplier)) + '</span><span class="tx-amt">' + (r.paid ? '보냄 ' + won(ctx, r.paid) : '산 것 ' + won(ctx, r.buy_total)) + '</span></div><div class="tx-sub">' + U.esc(F.date(r.date, { refYear: refYear(ctx) })) + (r.paid && r.buy_total ? ' · 산 것 ' + won(ctx, r.buy_total) : '') + '</div></li>';
}).join('') + '</ol>' : '');
}
function drillDebtCols(ctx, d, p) {
var M = ctx.M;
setTitle('항목마다 변화 · ' + periodText(ctx, [d.prev]) + ' 말 → ' + periodText(ctx, [d.month]), '같은 항목끼리 · 큰 변화 순');
var rows = M.LEAF.map(function (c) { var a = M.debtCell(d.month, c), b = M.debtCell(d.prev, c); return { c: c, a: a.value, b: b.value, d: F.isNum(a.value) && F.isNum(b.value) ? a.value - b.value : null }; })
.filter(function (x) { return F.isNum(x.a) || F.isNum(x.b); }).sort(function (x, y) { return Math.abs(y.d || 0) - Math.abs(x.d || 0); });
p.body.innerHTML = table(['항목', '지금', '그때', '변화'], rows.map(function (x) { return [U.esc(M.colName(x.c)), won(ctx, x.a), won(ctx, x.b), F.isNum(x.d) ? ctx.num({ value: x.d, v: 'ui:pop' }, 'digits', { sign: true }) : '<span class="muted">처음</span>']; }));
}
function drillPace(ctx, d, p) {
var M = ctx.M;
setTitle('달마다 남은 돈', '최근 ' + (d.months.length - 1) + '개월');
p.body.innerHTML = table(['달', '남은 돈', '지난달보다'], d.months.map(function (m, i) {
var v = M.debtTotal(m).value, pv = i ? M.debtTotal(d.months[i - 1]).value : null;
return [U.esc(periodText(ctx, [m])), won(ctx, v), F.isNum(v) && F.isNum(pv) ? ctx.num({ value: v - pv, v: 'ui:pop' }, 'digits', { sign: true }) : '<span class="muted">—</span>'];
}));
}
function drillMonths(ctx, d, p) {
var M = ctx.M, stores = ctx.f.store === 'all' ? ['2ho', 'eungam'] : [ctx.f.store];
setTitle('달마다 영업이익 · ' + periodText(ctx, d.A), '적자인 달은 빨강 · 달을 누르면 그 달 비용 줄');
p.body.innerHTML = table(['달'].concat(stores.map(function (s) { return ctx.storeName(s); })), d.A.map(function (m) {
return ['<button type="button" class="as-link" data-pop-month="' + m + '">' + U.esc(periodText(ctx, [m])) + '</button>'].concat(stores.map(function (s) { var r = M.row(m, s), v = r && r.has_data ? r.op_profit : null; return won(ctx, v, F.isNum(v) && v < 0 ? 'bad' : ''); }));
}));
p.body.querySelectorAll('[data-pop-month]').forEach(function (b) { b.addEventListener('click', function () { drill(ctx, { kind: 'lines', A: [b.getAttribute('data-pop-month')] }, p.anchor); }); });
}
function drill(ctx, d, anchor) {
if (!d) return null;
var p = open(anchor, '실제 예시', '');
try {
if (d.kind === 'pl' && d.line) drillPl(ctx, d, p);
else if (d.kind === 'lines') drillLines(ctx, d, p);
else if (d.kind === 'suppliers') drillSuppliers(ctx, d, p);
else if (d.kind === 'debtCols') drillDebtCols(ctx, d, p);
else if (d.kind === 'pace') drillPace(ctx, d, p);
else if (d.kind === 'months') drillMonths(ctx, d, p);
else p.body.innerHTML = emptyNote('보여 줄 예시가 없어요.');
} catch (e) { console.error(e); p.body.innerHTML = emptyNote('예시를 만들다 문제가 생겼어요.'); }
return p;
}
function lineName(id) { if (id === 'supplier') return '거래처 외상(식재료)'; var t = C.flowLines && C.flowLines[id]; return t ? t.name : id; }
function flowOpts(ctx) { return { mergePersonal: !!(ctx.V && ctx.V.plainFlow) }; }
function flow(ctx, line, anchor, months) {
var M = ctx.M, store = ctx.f.store, admin = !!(ctx.V && ctx.V.details);
var VC = L.viewConfig || {}, fl = M.cashFlow ? M.cashFlow(store, months, VC.FLOW_DEBT_COLS || [], flowOpts(ctx)) : null;
var all = [];
(fl ? fl.uses : []).forEach(function (u) {
all.push(u);
if (u.id === 'loan' && u.parts && u.parts.personal && F.isNum(u.parts.personal.value)) all.push({ id: 'loan_personal', x: u.parts.personal });
});
var uses = all.filter(function (u) { return F.isNum(u.x.value) && Math.abs(u.x.value) >= 0.5; });
var useOf = function (id) { return all.filter(function (u) { return u.id === id; })[0] || null; };
var st = { line: line, mode: admin ? 'group' : 'class', sort: 'amount', q: '', limit: LIMIT, contents: null };
var head = function () { return lineName(st.line) + ' 내역'; };
var subText = function () { return U.esc(periodText(ctx, months)) + ' · ' + U.esc(ctx.storeName(store)) + ' · ' + (admin ? '통장 기재내용 그대로' : '사람 이름은 가렸어요'); };
var p = open(anchor, head(), subText());
var listEl = null;
function controls() {
var seg = function (attr, items, on) {
return '<div class="segmented" role="group">' + items.map(function (it) { return '<button type="button" data-' + attr + '="' + it[0] + '" aria-pressed="' + (on === it[0]) + '">' + U.esc(it[1]) + '</button>'; }).join('') + '</div>';
};
var opts = (uses.length ? uses : [{ id: st.line }]).map(function (u) { return '<option value="' + u.id + '"' + (st.line === u.id ? ' selected' : '') + '>' + U.esc(lineName(u.id)) + '</option>'; }).join('');
return '<div class="pop-tools">' +
'<label class="select"><span class="sr-only">줄</span><select data-pt-line>' + opts + '</select></label>' +
seg('pt-mode', admin ? [['group', '거래처별'], ['class', '분류별'], ['each', '한 건씩']] : [['class', '분류별'], ['each', '한 건씩']], st.mode) + seg('pt-sort', [['amount', '금액 큰 순'], ['date', '날짜 순']], st.sort) +
'<label class="pop-search"><span class="sr-only">찾기</span><input type="search" data-pt-q placeholder="' + (admin ? '이름 · 분류 찾기' : '분류 · 내용 찾기') + '" value="' + U.esc(st.q) + '" autocomplete="off"></label>' +
'</div><div class="pop-list" aria-live="polite"></div>';
}
function keepOf(id) { return id === 'supplier' && M.foodBasisOf ? function (r) { return M.foodBasisOf(r.month, r.sup) === 'S'; } : null; }
function sumLine(rows) {
var out = TX.outTotal(rows), u = useOf(st.line), want = u ? u.x : null;
var s = '<p class="pop-sum"><b>' + F.count(rows.length) + '</b> · 나간 돈 ' + won(ctx, out);
if (st.q || !want || !F.isNum(want.value)) return s + '</p>';
if (st.line === 'supplier') {
var buy = out - want.value;
return s + '</p><p class="pop-sum">그 기간 명세표 매입 ' + won(ctx, buy) + ' · 거래처에 낸 돈 ' + won(ctx, out) + ' → ' + (want.value >= 0 ? '명세표보다 더 낸 돈 ' : '아직 안 낸 돈 ') + won(ctx, Math.abs(want.value)) + '<br><span class="muted">명세표가 없는 달(통장 기준)의 지급은 빼고 셌어요.</span></p>';
}
var extra = 0, note = '';
if (st.line === 'other_out' && u.parts && F.isNum(u.parts.xfer.value) && u.parts.xfer.value) { extra = -u.parts.xfer.value; note = ' · 다른 가게와 나눈 몫 ' + won(ctx, extra) + '(거래 한 건으로는 안 보여요)'; }
var tot = out + extra;
return s + note + (Math.abs(tot - want.value) <= 1 ? ' <span class="good">· 표와 같아요</span>' : ' <span class="warn">· 표와 ' + won(ctx, tot - want.value) + ' 달라요</span>') + '</p>';
}
function renderList() {
if (!listEl) return;
var rows = TX.rows(st.contents, { store: store, flow: st.line, q: st.q, keep: keepOf(st.line) });
var body;
if (!rows.length) body = emptyNote(st.q ? '찾는 것이 없어요.' : '이 기간에는 거래가 없어요.');
else if (st.mode === 'group' || st.mode === 'class') {
var gs = st.mode === 'group' ? TX.groupByName(rows, st.sort) : TX.groupByClass(rows, st.sort);
body = '<ol class="tx-list">' + gs.slice(0, st.limit).map(function (g) {
var out = 0; rows.forEach(function (r) { if ((st.mode === 'group' ? r.name : r.what) === g.name) out += r.out; });
var sub = st.mode === 'group' ? Object.keys(g.classes).join(' · ') : '';
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(g.name) + '</span><span class="tx-amt">' + won(ctx, out) + '</span></div>' +
'<div class="tx-sub">' + F.count(g.count) + ' · ' + U.esc(F.date(g.first, { refYear: refYear(ctx) })) + (g.last !== g.first ? '~' + U.esc(F.date(g.last, { refYear: refYear(ctx) })) : '') + (sub ? ' · ' + U.esc(sub) : '') + '</div></li>';
}).join('') + '</ol>' + (gs.length > st.limit ? '<button type="button" class="btn ghost pop-more" data-pt-more>' + (gs.length - st.limit) + '가지 더 보기</button>' : '');
} else {
var list = TX.sortRows(rows, st.sort);
body = '<ol class="tx-list">' + list.slice(0, st.limit).map(function (r) {
return '<li class="tx-row"><div class="tx-main"><span class="tx-name">' + U.esc(r.name) + '</span><span class="tx-amt">' + won(ctx, r.out) + '</span></div>' +
'<div class="tx-sub">' + U.esc(F.date(r.date, { refYear: refYear(ctx) })) + ' · ' + U.esc(r.what) + ' · ' + U.esc(storeText(ctx, r.split)) + '</div></li>';
}).join('') + '</ol>' + (list.length > st.limit ? '<button type="button" class="btn ghost pop-more" data-pt-more>' + (list.length - st.limit) + '건 더 보기</button>' : '');
}
listEl.innerHTML = sumLine(rows) + body;
}
var load2 = admin ? ctx.loadTx : ctx.loadTxo;
var loader = load2 ? load2(months).catch(function () { return []; }) : Promise.resolve([]);
loader.then(function (contents) {
if (!cur || cur !== p) return;
if (!contents.length) { p.body.innerHTML = emptyNote('이 기간의 내역 자료가 아직 없어요(다음 대시보드 갱신 때 들어와요).'); return; }
st.contents = contents;
p.body.innerHTML = controls();
listEl = p.body.querySelector('.pop-list');
renderList();
p.body.addEventListener('click', function (e) {
var b = e.target.closest('[data-pt-mode],[data-pt-sort],[data-pt-more]');
if (!b) return;
if (b.hasAttribute('data-pt-mode')) st.mode = b.getAttribute('data-pt-mode');
else if (b.hasAttribute('data-pt-sort')) st.sort = b.getAttribute('data-pt-sort');
else if (b.hasAttribute('data-pt-more')) st.limit += LIMIT;
p.body.querySelectorAll('[data-pt-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-pt-mode') === st.mode)); });
p.body.querySelectorAll('[data-pt-sort]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-pt-sort') === st.sort)); });
renderList();
});
p.body.addEventListener('input', function (e) { if (e.target.matches('[data-pt-q]')) { st.q = e.target.value; st.limit = LIMIT; renderList(); } });
p.body.addEventListener('change', function (e) { if (e.target.matches('[data-pt-line]')) { st.line = e.target.value; st.limit = LIMIT; setTitle(head(), subText()); renderList(); } });
});
return p;
}
function flowKey(u) { return u.id === 'supplier' && F.isNum(u.x.value) && u.x.value < 0 ? 'supplier_less' : u.id; }
function barOf(u) { var t = C.flowLines && C.flowLines[flowKey(u)]; return t && t.bar ? t.bar : [lineName(u.id)]; }
function useName(u) { var t = C.flowLines && C.flowLines[flowKey(u)]; return t ? t.name : lineName(u.id); }
function popExtra(ctx, u) {
if (!(ctx.V && ctx.V.details) || !u.parts) return '';
var nz = function (x) { return x && F.isNum(x.value) && Math.abs(x.value) >= 0.5; };
if (u.id === 'loan' && nz(u.parts.personal)) return '그중 ' + U.esc(lineName('loan_personal')) + ' ' + F.man(u.parts.personal.value);
if (u.id === 'kiwoom') { var a = []; if (nz(u.parts.owner)) a.push('대표자 명의 ' + F.man(u.parts.owner.value)); if (nz(u.parts.family)) a.push('가족 명의 ' + F.man(u.parts.family.value)); return a.join(' · '); }
return '';
}
function flowMonth(ctx, month, anchor) {
var M = ctx.M, store = ctx.f.store, VC = L.viewConfig || {};
var fl = M.cashFlow ? M.cashFlow(store, [month], VC.FLOW_DEBT_COLS || [], flowOpts(ctx)) : null;
var p = open(anchor, periodText(ctx, [month]) + ' 지출', U.esc(ctx.storeName(store)) + ' · 영업이익 − 지출 = 잔액');
if (!fl || !F.isNum(fl.earned.value)) { p.body.innerHTML = emptyNote('이 달 자료가 없어요.'); return; }
var canTx = ctx.V && ctx.V.details ? !!(ctx.txOk && ctx.txOk()) : !!(ctx.V && ctx.V.flowPop && ctx.txoOk && ctx.txoOk());
var uses = fl.uses.filter(function (u) { return F.isNum(u.x.value) && Math.abs(u.x.value) >= 0.5; });
var base = fl.earned.value > 0 ? fl.earned.value : null;
var row = function (name, v, cls, sub) { return '<div class="row' + (cls ? ' ' + cls : '') + '"><div class="grow"><span class="title">' + name + '</span>' + (sub ? '<span class="line2">' + sub + '</span>' : '') + '</div><span class="amt">' + ctx.num({ value: v, v: 'ui:pop' }, 'digits', { sign: true }) + '</span></div>'; };
var items = [{ lines: ['영업', '이익'], value: fl.earned.value, kind: 'earned', tip: '영업이익', text: F.short(fl.earned.value) }];
var rows = row('영업이익', fl.earned.value, 'lead-row', fl.adjusted ? '세금 내기 전 · 손익 칸 영업이익과 같아요' : '통장 기준');
uses.forEach(function (u) {
var name = useName(u), v = -u.x.value;
items.push({ lines: barOf(u), value: v, kind: v < 0 ? 'use' : 'adj', tip: name, text: F.short(v), select: canTx, line: u.id });
rows += row(canTx ? '<button type="button" class="txline" data-pop-flow="' + u.id + '" aria-haspopup="dialog">' + U.esc(name) + '</button>' : U.esc(name), v, 'use', [base && u.x.value > 0 ? '이익의 ' + Math.round((u.x.value / base) * 100) + '%' : '', u.id === 'supplier' && u.x.value < 0 ? '통장에 남은 돈(외상)' : '', popExtra(ctx, u)].filter(Boolean).join(' · '));
});
items.push({ lines: ['잔액'], value: fl.left.value, kind: 'left', tip: '잔액', text: F.short(fl.left.value) });
rows += row('잔액', fl.left.value, 'total', F.isNum(fl.left.value) && fl.left.value < 0 ? '이익보다 ' + F.man(-fl.left.value) + ' 더 썼어요' : '');
p.body.innerHTML = '<div class="chart pop-flow-chart" id="pop-flow-chart"></div><div class="rows flow-rows pop-flow-rows">' + rows + '</div>' +
(canTx ? '<p class="muted pop-flow-hint">빨간 막대나 줄 이름을 누르면 그 달 거래를 볼 수 있어요.</p>' : '');
var el = p.body.querySelector('#pop-flow-chart');
if (el && window.Charts && window.Charts.flowBars) window.Charts.flowBars(el, {
items: items, format: F.man, tickFormat: F.tick, height: function () { return fitHeight(p, el); },
onSelect: canTx ? function (i) { var it = items[i]; if (it && it.line) flow(ctx, it.line, anchor, [month]); } : null,
ariaLabel: periodText(ctx, [month]) + ' 지출 막대. ' + items.map(function (it) { return it.tip + ' ' + F.man(it.value); }).join(', ') + '.'
});
p.body.querySelectorAll('[data-pop-flow]').forEach(function (b) { b.addEventListener('click', function () { flow(ctx, b.getAttribute('data-pop-flow'), anchor, [month]); }); });
}
L.pop = { open: open, close: close, tx: tx, drill: drill, flow: flow, flowMonth: flowMonth, periodText: periodText, isOpen: function () { return !!cur; } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
function todoHtml(ctx) {
var M = ctx.M, ref = Number(String(M.today).slice(0, 4)), items = M.reviewItems('전체'), types = M.reviewTypes(), total = M.reviewCount();
var list = items.length ? '<div class="rows review-list">' + items.map(function (r) {
var qid = (/(Q-[A-Z0-9-]+)\s*$/.exec(String(r.title_masked || '')) || [])[1], q = qid && M.reviewTextOf ? M.reviewTextOf(qid) : null;
return '<div class="row"><div class="grow"><span class="title">' + U.esc(q && q.text ? q.text : _.clipped(r.title_masked)) + '</span>' +
(q && q.answer ? '<span class="q-answer">답: ' + U.esc(q.answer) + '</span>' : '') +
'<span class="line2">' + U.esc(_.clipped(r.title_masked)) + (/급함/.test(r.note || '') ? ' · 급함' : '') + '</span></div>' +
'<span class="amt">' + ctx.num({ value: r.amount, v: 'reviewItems[' + r.rank + '].amount' }, 'won') + '</span></div>';
}).join('') + '</div>' : U.emptyBlock('지금은 사장님이 하실 일이 없어요. ' + F.date(M.asOf, { refYear: ref }) + '까지 모두 정리됐어요.');
var shownTypes = types.filter(function (t) { return t.count > 0; });
var checks = shownTypes.length ? '<details class="as-table review-checks"><summary>장부 점검 표시 ' + ctx.num(total, 'count') + ' — 제가 정리해요(답하실 것 없어요)</summary><div class="table-wrap"><table><thead><tr><th scope="col">유형</th><th class="n" scope="col">개수</th><th class="n" scope="col">금액</th></tr></thead><tbody>' +
shownTypes.map(function (t) {
return '<tr><th scope="row">' + U.esc(t.type) + ' <span class="muted">' + U.esc(t.label || '') + '</span></th><td class="n">' + ctx.num({ value: t.count, v: 'review[' + t.type + '].count' }, 'count', { word: '' }) + '</td><td class="n">' + ctx.num({ value: t.amount, v: 'review[' + t.type + '].amount' }, 'man') + '</td></tr>';
}).join('') + '</tbody></table></div></details>' : '';
return _.titleRow(C.nav[3].label, '사장님이 채우거나 맞춰 주실 것 ' + ctx.num({ value: items.length, v: 'ui:todo' }, 'count') + ' · 답은 채팅으로 주시면 반영해요') +
'<div class="grid">' + _.panel('c12', '할 일', '', list + checks) + '</div>';
}
L.screens.review = {
title: function () { return C.nav[3].label; },
html: function (ctx) {
if (ctx.V && ctx.V.reviewTodo) return todoHtml(ctx);
var M = ctx.M, type = ctx.route.params.get('type') || '전체', ref = Number(String(M.today).slice(0, 4));
var types = M.reviewTypes(), total = M.reviewCount(), items = M.reviewItems(type);
var sub = total.value
? ctx.num(total, 'count') + ' · 금액 큰 순 · 답은 채팅으로 주시면 다음 갱신 때 반영돼요'
: '확인할 것이 없어요.';
var chips = '<div class="chips types" role="group" aria-label="유형">' +
'<button type="button" class="chip" data-type="전체" aria-pressed="' + (type === '전체') + '">전체<span class="n">' + ctx.num(total, 'count', { word: '' }) + '</span></button>' +
types.filter(function (t) { return t.count > 0; }).map(function (t) {
return '<button type="button" class="chip" data-type="' + U.esc(t.type) + '" aria-pressed="' + (type === t.type) + '" title="' + U.esc(t.label || '') + '">' + U.esc(t.type) + '<span class="n">' + ctx.num({ value: t.count, v: 'review[' + t.type + '].count' }, 'count', { word: '' }) + '</span></button>';
}).join('') + '</div>';
var shown = type === '전체' ? total.value : (types.filter(function (t) { return t.type === type; })[0] || {}).count;
var list = items.length ? '<div class="rows review-list">' + items.map(function (r) {
var qid = (/(Q-[A-Z0-9-]+)\s*$/.exec(String(r.title_masked || '')) || [])[1], q = qid && M.reviewTextOf ? M.reviewTextOf(qid) : null;
return '<div class="row"><div class="grow"><span class="title">' + U.esc(_.clipped(r.title_masked)) + '</span>' +
(q && q.text ? '<span class="q-text">' + U.esc(q.text) + '</span>' + (q.answer ? '<span class="q-answer">답: ' + U.esc(q.answer) + '</span>' : '') : '') +
'<span class="line2">' + U.esc(r.type) + (q && q.text ? ' · 채팅으로 답해 주시면 돼요' + (/급함/.test(r.note || '') ? ' · 급함' : '') : (r.location ? ' · ' + U.esc(r.location) : '') + (r.note ? ' · ' + U.esc(r.note) : '')) + '</span></div>' +
'<span class="amt">' + ctx.num({ value: r.amount, v: 'reviewItems[' + r.rank + '].amount' }, 'won') + '</span></div>';
}).join('') + '</div>' : U.emptyBlock(type === '전체' ? '확인할 것이 없어요. ' + F.date(M.asOf, { refYear: ref }) + '까지 모두 정리됐어요.' : '이 유형은 확인할 것이 없어요.');
var more = F.isNum(shown) && shown > items.length ? '<p class="note">금액이 큰 ' + ctx.num({ value: items.length, v: 'ui:shown' }, 'count') + '만 보여요. 나머지는 엑셀 ‘확인할 것’ 시트에 있어요.</p>' : '';
var typeMeta = type === '전체' ? '' : U.esc((types.filter(function (t) { return t.type === type; })[0] || {}).label || '');
return _.titleRow(C.nav[3].label, sub) + '<div class="filters">' + chips + '</div>' +
'<div class="grid">' + _.panel('c12', type === '전체' ? '전체' : type, typeMeta, list + more) + '</div>';
},
mount: function (rootEl, ctx) {
rootEl.querySelectorAll('[data-type]').forEach(function (b) {
b.addEventListener('click', function () {
var t = b.getAttribute('data-type'), params = {};
ctx.route.params.forEach(function (v, k) { params[k] = v; });
params.type = t === '전체' ? null : t;
var q = new URLSearchParams(); Object.keys(params).forEach(function (k) { if (params[k] != null && params[k] !== '') q.set(k, params[k]); });
history.replaceState(null, '', location.pathname + location.search + L.router.build(ctx.route.path, q));
ctx.rerender();
});
});
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
function section(title, desc, panelHtml) {
return '<div class="set-row"><div class="label"><h2>' + U.esc(title) + '</h2>' + (desc ? '<p>' + desc + '</p>' : '') + '</div><div class="set-panel">' + panelHtml + '</div></div>';
}
function kv(k, vHtml) { return '<div class="kv"><span class="k">' + U.esc(k) + '</span><span class="v">' + vHtml + '</span></div>'; }
function dateCell(ctx, key, ref) { return ctx.num({ value: ctx.snap.meta ? ctx.snap.meta[key] : null, v: 'meta.' + key }, 'date', { refYear: ref }) + '<span class="muted">까지</span>'; }
L.screens.data = {
title: function () { return C.nav[4].label; },
html: function (ctx) {
var M = ctx.M, meta = ctx.snap.meta || {}, ref = Number(String(M.today).slice(0, 4)), v = ctx.validation, src = ctx.snap.source || {};
var nameOf = function (id) { var d = (ctx.snap.debts || []).filter(function (x) { return x.debt_id === id; })[0]; return d ? d.name : id; };
var ms = M.months('all');
var periods = kv('통장 · ' + ctx.storeName('2ho'), dateCell(ctx, 'bank_last_2ho', ref)) + kv('통장 · ' + ctx.storeName('eungam'), dateCell(ctx, 'bank_last_eungam', ref)) +
kv('명세표 · ' + nameOf('nain'), dateCell(ctx, 'stmt_last_nain', ref)) + kv('명세표 · ' + nameOf('taejo'), dateCell(ctx, 'stmt_last_taejo', ref)) +
kv('명세표 · ' + nameOf('hyunjin'), dateCell(ctx, 'stmt_last_hyunjin', ref)) + kv('고지서', dateCell(ctx, 'bills_last', ref)) +
kv('세금(홈택스 조회)', ctx.num({ value: meta.tax_snapshot_date, v: 'meta.tax_snapshot_date' }, 'date', { refYear: ref })) +
kv('사진', ctx.num({ value: meta.photos_processed, v: 'meta.photos_processed' }, 'count', { word: '장' }) + ' 정리 · ' + ctx.num({ value: meta.photos_pending, v: 'meta.photos_pending' }, 'count', { word: '장' }) + ' 남음') +
kv('손익 자료가 있는 달', ms.length ? U.esc(F.month(ms[0])) + ' – ' + U.esc(F.month(ms[ms.length - 1])) + ' · ' + ctx.num({ value: ms.length, v: 'ui:monthCount' }, 'count', { word: '개월' }) : F.DASH);
var ck = M.checks();
var checkRow = function (c) {
var kind = c.status === 'ok' ? 'ok' : c.status === 'fail' ? 'fail' : c.status === 'warn' ? 'warn' : 'none';
var val = F.isNum(c.value) ? ctx.num({ value: c.value, v: 'checks[' + c.check_id + '].value' }, Math.abs(c.value) >= 10000 ? 'won' : 'count', { word: '' }) : U.esc(c.value == null ? '' : c.value);
return '<div class="kv"><span class="k">' + U.status(kind, c.label) + '</span><span class="v">' + (kind === 'ok' ? '' : kind === 'none' ? '<span class="muted">아직 안 함</span>' : val) + '</span></div>';
};
var checks = ck.bad.map(checkRow).join('') + ck.none.map(checkRow).join('') +
(ck.ok.length ? (ck.bad.length || ck.none.length ? '<details class="as-table checks-ok"><summary>맞는 점검 ' + ck.ok.length + '개 보기</summary><div class="ok-list">' + ck.ok.map(checkRow).join('') + '</div></details>' : ck.ok.map(checkRow).join('')) : '');
var notes = (v.notes || []).map(function (n) { return '<div class="kv"><span class="k">' + U.status('none', n.message) + '</span></div>'; }).join('');
var browser = v.errors.length || v.warnings.length
? v.errors.concat(v.warnings).slice(0, 12).map(function (e, i) { return '<div class="kv"><span class="k">' + U.status(i < v.errors.length ? 'fail' : 'warn', e.message) + '</span><span class="v muted">' + U.esc(e.where || '') + '</span></div>'; }).join('') + notes
: '<div class="kv"><span class="k">' + U.status('ok', '두 가게 합 · 손익 · 부채 · 세금 · 확인할 것을 화면에서 다시 계산했어요. 모두 맞아요.') + '</span></div>' + notes;
var mode = ctx.adapter ? ctx.adapter.kind : 'file', a = ctx.adapter || {};
var conn = kv('연결 방식', U.esc((C.sources[mode] || mode) + (mode === 'file' && src.synthetic ? ' · 예시' : ''))) + kv('장부 파일', U.esc(src.workbook || F.DASH)) +
(mode === 'artifact' ? '<p class="note">Claude에게 ‘대시보드 갱신’이라고 말하면 엑셀을 확인한 뒤 새 자료를 올려요.</p>' : '') +
(mode === 'file' ? (src.synthetic ? '<p class="note">개발용 예시 자료를 읽고 있어요. 숫자는 모두 가짜예요.</p>' : '<p class="note">이 컴퓨터에 있는 자료 파일을 시험으로 읽고 있어요. 휴대폰에서는 Claude 앱의 화면을 봐 주세요.</p>') : '') +
(mode === 'graph' ? kv('계정', U.esc(a.accountLabel ? a.accountLabel() : F.DASH)) + kv('파일 위치', U.esc(a.fileLabel ? a.fileLabel() : F.DASH)) +
'<div class="row-actions">' + (a.webUrl && a.webUrl() ? '<a class="btn" href="' + U.esc(a.webUrl()) + '" target="_blank" rel="noopener">' + U.icon('external') + '엑셀에서 열기</a> ' : '') +
'<button type="button" class="btn" data-action="find-file">파일 다시 고르기</button> <button type="button" class="btn ghost" data-action="signout">로그아웃</button></div><div id="file-picker"></div>' +
'<p class="note">이 앱은 OneDrive의 장부 파일 하나만 읽어요. 고치거나 지우지 않아요.</p>' : '');
var seg = function (pref, opts) {
return '<div class="segmented" role="group" aria-label="' + U.esc(opts.label) + '">' + opts.items.map(function (it) {
return '<button type="button" data-pref="' + pref + '" data-value="' + it[0] + '" aria-pressed="' + (String(ctx.prefs[pref]) === it[0]) + '">' + U.esc(it[1]) + '</button>';
}).join('') + '</div>';
};
var settings = '<div class="switch-row"><label for="pref-hide"><span class="t">개인 항목 가리기</span><span class="d">가게에서 화면을 열 때 대표자·가족 이체, 손익의 개인(유흥·심야 카드사용) 금액, 개인 공과금을 숨겨요.</span></label>' +
'<input id="pref-hide" class="switch" type="checkbox" data-pref="hidePersonal"' + (ctx.prefs.hidePersonal ? ' checked' : '') + '></div>' +
'<div class="switch-row"><span><span class="t">큰 숫자 단위</span><span class="d">억·만은 반올림해서 보여 주고, 원은 그대로 보여 줘요. 표는 늘 원 단위예요.</span></span>' + seg('units', { label: '큰 숫자 단위', items: [['man', '억·만'], ['won', '원']] }) + '</div>' +
'<div class="switch-row"><span><span class="t">화면 밝기</span><span class="d">자동은 휴대폰 설정을 따라요.</span></span>' + seg('theme', { label: '화면 밝기', items: [['auto', '자동'], ['light', '밝게'], ['dark', '어둡게']] }) + '</div>';
return _.titleRow(C.nav[4].label, '엑셀과 화면이 같은 자료인지 여기서 확인해요.') +
'<div class="settings">' +
section('자료 기간', '출처마다 어디까지 들어왔는지예요.', periods) +
section('점검', '엑셀이 한 점검과, 이 화면이 숫자를 다시 계산해 맞춰 본 결과예요.', '<h3 class="set-sub first">엑셀 점검 ' + ck.counted + '개 중 ' + ck.ok.length + '개 맞아요</h3>' + checks + '<h3 class="set-sub">화면에서 다시 계산</h3>' + browser) +
section('데이터 지문', '엑셀 쪽 지문과 같으면 같은 자료예요. 한 글자라도 다르면 다른 자료예요.', '<p class="fingerprint">' + U.esc(F.fingerprint(ctx.fingerprint)) + '</p><p class="muted">' + U.esc(meta.refreshed_at ? '갱신 ' + F.date(String(meta.refreshed_at).slice(0, 10), { refYear: ref }) + ' ' + F.time(meta.refreshed_at) : '') + '</p>') +
section('연결', '자료를 어디서 받아 오는지예요.', conn) +
section('설정', '이 기기에서만 기억해요.', settings) +
section('이 기기에서 저장된 자료 지우기', '이 휴대폰·태블릿에 남은 장부 자료와 설정을 지워요. 엑셀 파일과 원본 자료는 그대로예요.', '<div id="clear-box"><button type="button" class="btn danger" data-action="clear-cache">이 기기 자료 지우기</button></div>') +
'</div>';
},
mount: function (rootEl, ctx) {
var a = ctx.adapter, btn = rootEl.querySelector('[data-action="find-file"]'), box = rootEl.querySelector('#file-picker');
if (!btn || !box || !a || !a.listCandidates) return;
btn.addEventListener('click', function () {
box.innerHTML = '<p class="muted">OneDrive에서 찾고 있어요.</p>';
a.listCandidates().then(function (list) {
box.innerHTML = list.length ? '<div class="rows">' + list.map(function (it) {
return '<div class="row"><div class="grow"><span class="title">' + U.esc(it.name) + '</span><span class="line2">' + U.esc(it.path || '') + '</span></div><button type="button" class="btn" data-pick="' + U.esc(it.id) + '">고르기</button></div>';
}).join('') + '</div>' : U.emptyBlock('통합장부 파일을 찾지 못했어요.');
box.querySelectorAll('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { a.chooseFile(b.getAttribute('data-pick')); L.app.reload(); }); });
}).catch(function (e) { box.innerHTML = U.blockError('파일 목록을 못 받았어요. ' + (e && e.userMessage ? e.userMessage : ''), false); });
});
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
var NAME = _.supName;
var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
var SRC = { L: '사장님 장부(거래처 내용)', S: '명세표 사진', D: '직접 입력' };
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function dow(d) { return new Date(Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)))).getUTCDay(); }
function daysIn(m) { return new Date(Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0)).getUTCDate(); }
function isNum(x) { return typeof x === 'number' && isFinite(x); }
function cellNum(ctx, value, v) { return ctx.num({ value: value, v: v }, Math.abs(value) < 100000 ? 'digits' : 'short'); }
function plain(ctx) { return !!(ctx.V && ctx.V.supPlain); }
function dayBuy(r, base, pl) {
var vals = [], vs = [];
if (r.buy) { vals.push(r.buy); vs.push(base + 'buy'); }
if (pl && r.adj) { vals.push(r.adj); vs.push(base + 'adj'); }
return vals.length ? { value: vals.reduce(function (a, b) { return a + b; }, 0), v: vs.join(' + ') } : null;
}
function monthBuy(mo, pl) {
if (!pl || !isNum(mo.adj.value) || !mo.adj.value) return mo.buy;
return { value: (isNum(mo.buy.value) ? mo.buy.value : 0) + mo.adj.value, v: [mo.buy.v, mo.adj.v].filter(Boolean).join(' + ') };
}
function chartOn(ctx) { return !!(ctx.V && ctx.V.supChart); }
function yearly(ctx) { return ctx.route.params.get('chart') === 'y'; }
var SWIPE = { min: 48, ratio: 1.5 };
function swipeDir(dx, dy, opts) {
var o = opts || {}, min = isNum(o.min) ? o.min : SWIPE.min, ratio = isNum(o.ratio) ? o.ratio : SWIPE.ratio;
if (!isNum(dx) || !isNum(dy)) return 0;
if (Math.abs(dx) < min || Math.abs(dx) <= ratio * Math.abs(dy)) return 0;
return dx < 0 ? 1 : -1;
}
function stepMonth(s, dir) { var i = s.months.indexOf(s.month), j = i + dir; return dir && i >= 0 && j >= 0 && j < s.months.length ? s.months[j] : null; }
function knownSpan(ctx, s) { var o = ctx.M.supOpen(s.id) || {}; return { from: isNum(o.bal) ? o.date : o.first_date || null, to: o.last_date || null }; }
function inSpan(sp, key) { var n = key.length; return (!sp.from || key >= sp.from.slice(0, n)) && (!sp.to || key <= sp.to.slice(0, n)); }
function backStart(end, r) { return end - (r.buy || 0) - (r.adj || 0) - (r.fix || 0) + (r.paid || 0); }
function flowData(ctx, s) {
var pl = plain(ctx), out = [], k, m, mo, sp = knownSpan(ctx, s);
if (yearly(ctx)) {
var y = s.month.slice(0, 4);
for (k = 1; k <= 12; k++) {
m = y + '-' + pad2(k); mo = s.months.indexOf(m) >= 0 ? ctx.M.supMonth(s.id, m) : null;
var end = null, start = null;
if (mo && isNum(mo.end.value)) {
end = mo.end;
start = isNum(mo.start.value) ? mo.start.value : backStart(end.value, { buy: mo.buy.value, adj: mo.adj.value, fix: mo.fix.value, paid: mo.paid.value });
} else if (!mo && inSpan(sp, m)) { var b = ctx.M.supBalAt(s.id, m); if (isNum(b.value)) { end = b; start = b.value; } }
out.push({ key: m, label: F.month(m, { year: true }), tick: k + '월', buy: mo ? monthBuy(mo, pl) : null, paid: mo && mo.nPaid ? mo.paid : null, has: !!mo, start: start, end: end });
}
return out;
}
var byDay = {}, level = isNum(s.mo.start.value) ? s.mo.start.value : null;
s.mo.rows.forEach(function (r) { byDay[Number(r.date.slice(8, 10))] = r; });
for (k = 1; k <= daysIn(s.month); k++) {
var r = byDay[k], date = s.month + '-' + pad2(k), base = 'supDaily[' + s.id + '/' + date + '].', st = level, en = null;
if (r && isNum(r.bal)) { en = { value: r.bal, v: base + 'bal' }; if (st == null) st = backStart(r.bal, r); }
else if (r && st != null) en = { value: st + (r.buy || 0) + (r.adj || 0) + (r.fix || 0) - (r.paid || 0), v: null };
else if (!r && st != null && inSpan(sp, date)) en = { value: st, v: null };
if (en) level = en.value;
out.push({ key: date, label: F.date(date, { refYear: 0 }) + ' (' + WEEK[dow(date)] + ')', tick: k + '일', buy: r ? dayBuy(r, base, pl) : null,
paid: r && isNum(r.paid) && r.paid ? { value: r.paid, v: base + 'paid' } : null, has: !!r, start: en ? st : null, end: en });
}
return out;
}
function yearSum(ctx, s, y, f) {
var vals = ctx.M.supDays(s.id).filter(function (r) { return r.date.slice(0, 4) === y && isNum(r[f]); }).map(function (r) { return r[f]; });
return vals.length ? { value: vals.reduce(function (a, b) { return a + b; }, 0), v: 'sum(supDaily[' + s.id + '/' + y + '-*].' + f + ')' } : { value: null, v: null };
}
function flowSums(ctx, s, ref) {
if (!yearly(ctx)) return { period: F.month(s.month, { refYear: ref }), buy: monthBuy(s.mo, plain(ctx)), paid: s.mo.nPaid ? s.mo.paid : null };
var y = s.month.slice(0, 4), paid = yearSum(ctx, s, y, 'paid');
return { period: y + '년', buy: monthBuy({ buy: yearSum(ctx, s, y, 'buy'), adj: yearSum(ctx, s, y, 'adj') }, plain(ctx)), paid: isNum(paid.value) && paid.value ? paid : null };
}
function some(x) { return !!(x && isNum(x.value) && x.value); }
function flowHi(ctx, s) { return yearly(ctx) ? Number(s.month.slice(5)) - 1 : s.sel ? Number(s.sel.date.slice(8, 10)) - 1 : null; }
var MARKS = [{ name: '매입', mark: 'dot', tone: '--ink', f: 'buy' }, { name: '입금', mark: 'diamond', tone: '--chart-1', f: 'paid' }];
function chartData(ctx, s0) {
var s = s0 || state(ctx);
if (!s.mo) return null;
var yr = yearly(ctx), data = flowData(ctx, s), hi = flowHi(ctx, s);
var at = data.map(function (d, i) { return i; }).filter(function (i) { return yr ? hi == null || (i - hi) % 2 === 0 : i === 0 || (i + 1) % 5 === 0; });
if (!yr && hi != null) at = at.filter(function (i) { return Math.abs(i - hi) > 2; }).concat([hi]).sort(function (a, b) { return a - b; });
return {
keys: data.map(function (d) { return d.key; }), labels: data.map(function (d) { return d.label; }), ticks: data.map(function (d) { return d.tick; }), at: at, hi: hi,
units: data.map(function (d) {
if (!d.end || !isNum(d.start)) return null;
var buy = some(d.buy) ? d.buy.value : 0, paid = some(d.paid) ? d.paid.value : 0;
return { start: d.start, buy: buy, paid: paid, gap: d.end.value - (d.start + buy - paid), end: d.end.value };
}),
marks: MARKS.map(function (m) { return { name: m.name, mark: m.mark, tone: m.tone }; })
};
}
function keyMark(mark) {
return '<svg class="key-mark ' + mark + '" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">' +
(mark === 'diamond' ? '<path d="M6 0.4L11.6 6 6 11.6 0.4 6Z"/>' : '<circle cx="6" cy="6" r="4.5"/>') + '</svg>';
}
function flowPanel(ctx, s, ref) {
var yr = yearly(ctx), data = flowData(ctx, s), sums = flowSums(ctx, s, ref);
var amt = function (x) { return some(x) ? ctx.num(x, 'man') : '<span class="muted">없어요</span>'; };
var cell = function (x) { return some(x) ? ctx.num(x, 'digits') : '<span class="dash">' + F.DASH + '</span>'; };
var seg = '<span class="segmented sup-span" role="group" aria-label="그래프 기간">' + [['m', '월간'], ['y', '연간']].map(function (it) {
return '<button type="button" data-sup-span="' + it[0] + '" aria-pressed="' + ((it[0] === 'y') === yr) + '">' + it[1] + '</button>';
}).join('') + '</span>';
var rows = data.filter(function (d) { return d.has; }).map(function (d) { return [U.esc(yr ? F.month(d.key, { refYear: ref }) : d.label), cell(d.buy), cell(d.paid), d.end && d.end.v ? ctx.num(d.end, 'digits') : '<span class="dash">' + F.DASH + '</span>']; });
var moves = data.some(function (d) { return d.end && (some(d.buy) || some(d.paid)); });
var key = function (i, html) { return '<span class="key">' + keyMark(MARKS[i].mark) + MARKS[i].name + ' ' + html + '</span>'; };
var body = '<p class="chart-lead sup-flow-lead"><b>' + U.esc(sums.period) + '</b> ' + key(0, amt(sums.buy)) + ' · ' + key(1, amt(sums.paid)) + '</p>' +
(moves ? _.chartBox('sup-flow', 240) : U.emptyBlock('이 ' + (yr ? '해' : '달') + '는 매입·입금이 없어요.')) +
U.asTable(NAME(ctx, s.id) + ' ' + sums.period + (yr ? ' 달마다' : ' 날마다') + ' 매입 입금', [yr ? '달' : '날', '매입(원)', '입금(원)', '끝 외상(원)'], rows);
return _.panel('c4 sup-flow', '매입 입금', '', body, null, { keep: 'sup-flow', link: seg });
}
function drawFlow(el, ctx, s) {
var yr = yearly(ctx), cd = chartData(ctx, s), sums = flowSums(ctx, s, 0);
var say = function (x) { return some(x) ? F.man(x.value) : '없음'; };
var known = cd.units.filter(Boolean), a = known[0], b = known[known.length - 1];
window.Charts.levels(el, {
labels: cd.labels, tickLabels: cd.ticks, units: cd.units, names: { buy: MARKS[0].name, paid: MARKS[1].name, end: '끝 외상' }, buyTone: MARKS[0].tone, paidTone: MARKS[1].tone,
format: F.man, tickFormat: F.tick, height: 240, xAt: cd.at, hi: cd.hi, empty: '없음',
ariaLabel: NAME(ctx, s.id) + ' ' + sums.period + (yr ? ' 달마다' : ' 날마다') + ' 외상 잔액 계단 그래프' + (a ? ': ' + F.man(a.start) + '에서 ' + L.josa(F.man(b.end), '으로/로') : '') +
'. 매입(먹색, 올라가는 선) ' + say(sums.buy) + ', 입금(파랑, 내려가는 선) ' + say(sums.paid) + '.'
});
}
function swipeOn(cal, ctx, s) {
var t0 = null;
cal.addEventListener('touchstart', function (e) { var t = e.touches && e.touches.length === 1 ? e.touches[0] : null; t0 = t ? { x: t.clientX, y: t.clientY } : null; }, { passive: true });
cal.addEventListener('touchcancel', function () { t0 = null; }, { passive: true });
cal.addEventListener('touchend', function (e) {
var a = t0, t = e.changedTouches && e.changedTouches[0];
t0 = null;
if (!a || !t || (e.touches && e.touches.length)) return;
var dir = swipeDir(t.clientX - a.x, t.clientY - a.y), m = dir ? stepMonth(s, dir) : null;
if (!m) return;
if (e.cancelable) e.preventDefault();
if (ctx.keep) ctx.keep(cal);
go(ctx, { y: m.slice(0, 4), m: m.slice(5), day: null });
}, { passive: false });
}
function state(ctx) {
var hide = (ctx.V && ctx.V.supHide) || [], M = ctx.M, p = ctx.route.params, ids = (M.supIds ? M.supIds() : []).filter(function (id) { return hide.indexOf(id) < 0; });
var id = ids.indexOf(p.get('sup')) >= 0 ? p.get('sup') : ids[0] || null;
var months = id ? M.supMonths(id) : [];
var want = p.get('y') && p.get('m') ? p.get('y') + '-' + pad2(Number(p.get('m'))) : null;
var month = want && months.indexOf(want) >= 0 ? want : months[months.length - 1] || null;
var mo = id && month ? M.supMonth(id, month) : null;
var dayN = Number(p.get('day')), rows = mo ? mo.rows : [];
var sel = rows.filter(function (r) { return Number(r.date.slice(8, 10)) === dayN; })[0] || rows[rows.length - 1] || null;
return { ids: ids, id: id, months: months, month: month, mo: mo, sel: sel };
}
function go(ctx, patch) {
var params = {};
ctx.route.params.forEach(function (v, k) { params[k] = v; });
Object.keys(patch).forEach(function (k) { params[k] = patch[k]; });
var q = new URLSearchParams(); Object.keys(params).forEach(function (k) { if (params[k] != null && params[k] !== '') q.set(k, params[k]); });
history.replaceState(null, '', location.pathname + location.search + L.router.build(ctx.route.path, q));
ctx.rerender();
}
function supChips(ctx, s) {
return '<div class="chips sup-chips" role="group" aria-label="거래처">' + s.ids.map(function (id) {
var o = ctx.M.supOpen(id);
return '<button type="button" class="chip" data-sup="' + id + '" aria-pressed="' + (id === s.id) + '">' + U.esc(NAME(ctx, id)) +
'<span class="n">' + ctx.num({ value: o.last_bal, v: 'supOpen[' + id + '].last_bal' }, 'short') + '</span></button>';
}).join('') + '</div>';
}
function monthNav(ctx, s, ref) {
var i = s.months.indexOf(s.month), prev = i > 0 ? s.months[i - 1] : null, next = i >= 0 && i < s.months.length - 1 ? s.months[i + 1] : null;
var btn = function (m, label, dir) { return '<button type="button" class="btn icon-btn" data-sup-month="' + (m || '') + '"' + (m ? '' : ' disabled') + ' aria-label="' + label + '"><span class="arrow ' + dir + '" aria-hidden="true">' + (dir === 'l' ? '‹' : '›') + '</span></button>'; };
var opts = s.months.slice().reverse().map(function (m) { return '<option value="' + m + '"' + (m === s.month ? ' selected' : '') + '>' + U.esc(F.month(m, { refYear: 0 })) + '</option>'; }).join('');
return '<div class="sup-month" role="group" aria-label="달 고르기">' + btn(prev, '앞 달', 'l') +
'<label class="select"><span class="sr-only">달</span><select data-sup-select>' + opts + '</select></label>' + btn(next, '다음 달', 'r') + '</div>';
}
function tiles(ctx, s) {
var mo = s.mo, id = s.id, split = isNum(mo.b2.value) || isNum(mo.be.value);
var buySub = split ? U.esc(ctx.storeName('2ho')) + ' ' + ctx.num(mo.b2, 'man') + ' · ' + U.esc(ctx.storeName('eungam')) + ' ' + ctx.num(mo.be, 'man') + (isNum(mo.bc.value) ? ' · 공통 ' + ctx.num(mo.bc, 'man') : '') : mo.nBuy + '일 · 두 가게 함께';
var pl = plain(ctx), buyX = monthBuy(mo, pl);
var adj = !pl && isNum(mo.adj.value) && mo.adj.value ? '<span class="delta">사진 없는 기간 몫 ' + ctx.num(mo.adj, 'man') + ' 더함</span>' : '';
var d = isNum(mo.end.value) && isNum(mo.start.value) ? mo.end.value - mo.start.value : null;
var dTxt = d == null ? '' : '<span class="delta ' + (d > 0 ? 'bad' : d < 0 ? 'good' : '') + '">지난달 끝보다 ' +
ctx.num({ value: d, v: mo.end.v + ' - ' + mo.start.v }, 'man', { sign: true }) + '</span>';
if (!pl && mo.fix && isNum(mo.fix.value) && mo.fix.value) dTxt += '<span class="delta">그중 정정 ' + ctx.num(mo.fix, 'man', { sign: true }) + '</span>';
return '<div class="kpis sup-kpis">' +
'<div class="kpi"><span class="kpi-label">이 달 청구</span><span class="kpi-value">' + ctx.num(buyX, 'man') + '</span><span class="delta">' + buySub + '</span>' + adj + '</div>' +
'<div class="kpi"><span class="kpi-label">이 달 입금</span><span class="kpi-value">' + (mo.nPaid ? ctx.num(mo.paid, 'man') : '없어요') + '</span>' +
(mo.nPaid ? '<span class="delta">' + mo.nPaid + '번</span>' : '') + '</div>' +
'<div class="kpi"><span class="kpi-label">달 끝 남은 외상</span><span class="kpi-value">' + ctx.num(mo.end, 'man') + '</span>' + dTxt + '</div></div>';
}
function nextDay(d) { var t = new Date(Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)) + 1)); return t.toISOString().slice(0, 10); }
function gapNote(ctx, s, ref) {
var lo = s.month + '-01', hi = s.month + '-' + pad2(daysIn(s.month));
var gs = ctx.M.supGaps(s.id).filter(function (g) { return g.to >= lo && nextDay(g.from) <= hi; });
if (!gs.length) return '';
return '<p class="note sup-gap-note">' + gs.map(function (g) {
return '명세표 사진이 없는 날 ' + U.esc(F.dateShort(nextDay(g.from))) + '~' + U.esc(F.dateShort(g.to)) + ': 그 기간 청구 ' + ctx.num({ value: g.amount, v: 'supGaps[' + s.id + '/' + g.from + '].amount' }, 'man') + '은 ' + U.esc(F.date(g.to, { refYear: ref })) + '에 한 번에 넣었어요(그 전 날 잔액은 그만큼 낮게 보여요)';
}).join(' · ') + (s.id === 'hyunjin' ? ' — ' + U.esc(NAME(ctx, s.id)) + ' 거래처원장을 받아 주시면 날마다 채울 수 있어요.' : '') + '</p>';
}
function calendar(ctx, s) {
var m = s.month, n = daysIn(m), first = dow(m + '-01'), byDay = {}, gaps = ctx.M.supGaps(s.id), pl = plain(ctx);
var inGap = function (date) { return gaps.some(function (g) { return date > g.from && date <= g.to; }); };
s.mo.rows.forEach(function (r) { byDay[Number(r.date.slice(8, 10))] = r; });
var cells = '';
for (var k = 0; k < first; k++) cells += '<span class="cal-cell blank" aria-hidden="true"></span>';
for (var d = 1; d <= n; d++) {
var r = byDay[d], date = m + '-' + pad2(d), base = 'supDaily[' + s.id + '/' + date + '].';
var wd = (first + d - 1) % 7, cls = 'cal-cell' + (wd === 0 ? ' sun' : '') + (!pl && inGap(date) && !(r && r.src === 'S') ? ' gap' : '') + (r && r.paid ? ' paid' : '') + (s.sel && s.sel.date === date ? ' sel' : '');
if (!r) { cells += '<span class="' + cls + ' none"><span class="cal-d">' + d + '</span></span>'; continue; }
var bx = dayBuy(r, base, pl);
cells += '<button type="button" class="' + cls + '" data-sup-day="' + d + '" aria-pressed="' + (s.sel && s.sel.date === date) + '" aria-label="' + U.esc(F.date(date, { refYear: 0 })) + '">' +
'<span class="cal-d">' + d + '</span>' +
(bx ? '<span class="cal-buy">' + cellNum(ctx, bx.value, bx.v) + '</span>' : '') +
(!pl && r.adj ? '<span class="cal-adj">+' + cellNum(ctx, r.adj, base + 'adj') + '</span>' : '') +
(!pl && r.fix ? '<span class="cal-fix">정정 ' + cellNum(ctx, r.fix, base + 'fix') + '</span>' : '') +
(r.paid ? '<span class="cal-paid">입금 ' + cellNum(ctx, r.paid, base + 'paid') + '</span>' : '') + '</button>';
}
var fixOn = !pl && s.mo.rows.some(function (r) { return isNum(r.fix) && r.fix; });
return '<div class="cal" role="group" aria-label="' + U.esc(F.month(m, { refYear: 0 })) + ' 달력"' + (ctx.V && ctx.V.supSwipe ? ' data-swipe="month"' : '') + '>' +
WEEK.map(function (w, i) { return '<span class="cal-w' + (i === 0 ? ' sun' : '') + '" aria-hidden="true">' + w + '</span>'; }).join('') + cells + '</div>' +
'<p class="cal-legend"><span class="lg buy">숫자 = 그날 청구(명세표)</span><span class="lg paid">파란 칸 = 입금한 날</span>' +
(!pl && gaps.some(function (g) { return g.to >= m + '-01' && g.from < m + '-' + pad2(n); }) ? '<span class="lg gap">빗금 = 명세표 사진이 없는 날(+금액 = 앞뒤 잔액으로 구간 몫을 한 번에 넣은 날)</span>' : '') +
(fixOn ? '<span class="lg fix">정정 = 장부 잔액을 명세표·통장에 맞춘 금액(매입 아니에요)</span>' : '') + '</p>';
}
function dayDetail(ctx, s, ref) {
var r = s.sel; if (!r) return '';
var pl = plain(ctx);
var base = 'supDaily[' + s.id + '/' + r.date + '].', line = function (label, f, opts) {
return isNum(r[f]) && r[f] ? '<div class="row"><span class="grow">' + U.esc(label) + '</span><span class="amt">' + ctx.num({ value: r[f], v: base + f }, 'won', opts) + '</span></div>' : '';
};
var sumLine = function (label, fs) {
var on = fs.filter(function (f) { return isNum(r[f]) && r[f]; }); if (!on.length) return '';
return '<div class="row"><span class="grow">' + U.esc(label) + '</span><span class="amt">' + ctx.num({ value: on.reduce(function (a, f) { return a + r[f]; }, 0), v: on.map(function (f) { return base + f; }).join(' + ') }, 'won') + '</span></div>';
};
var stmt = !pl && isNum(r.stmt) && isNum(r.bal) ? (r.stmt === r.bal ? '<span class="muted">명세표 잔액과 같아요</span>' :
'<span class="warn">명세표 잔액 ' + ctx.num({ value: r.stmt, v: base + 'stmt' }, 'won') + ' — ' + (r.paid && Math.abs(r.stmt - r.bal - r.paid) < 1 ? '그날 입금이 명세표에 아직 안 찍혔어요(다음 장에서 맞아요)' : '차이 ' + ctx.num({ value: r.stmt - r.bal, v: base + 'stmt - ' + base + 'bal' }, 'won', { sign: true })) + '</span>') : '';
var notes = [];
if (!pl && r.src && SRC[r.src]) notes.push('청구 출처: ' + SRC[r.src]);
if (!pl && r.flag && r.flag.indexOf('G') >= 0) notes.push('명세표 사진이 없는 기간이라 날마다 청구는 모르고, 앞뒤 잔액으로 구간 몫을 마지막 날에 한 번에 넣었어요');
if (!pl && isNum(r.fix) && r.fix) notes.push('정정은 장부 잔액을 명세표·통장에 맞춘 금액이에요(매입 아니에요)');
if (r.flag && r.flag.indexOf('U') >= 0) notes.push('이 날 입금은 아직 통장 자료(' + (ctx.M.supMeta && ctx.M.supMeta.bank_last ? F.date(ctx.M.supMeta.bank_last, { refYear: ref }) : '') + '까지)에 없어 명세표에 적힌 것이에요 — 통장이 들어오면 맞춰 봐요');
var lines = line(ctx.storeName('2ho') + ' 매입', 'b2') + line(ctx.storeName('eungam') + ' 매입', 'be') + (pl ? sumLine(s.id === 'nain' ? '공통 매입' : '매입(두 가게 함께)', ['bc', 'adj']) : line(s.id === 'nain' ? '공통 매입' : '매입(두 가게 함께)', 'bc')) +
(pl ? '' : line('사진 없는 기간 몫', 'adj') + line('정정', 'fix', { sign: true })) + line('입금', 'paid');
var body = (chartOn(ctx) ? (lines ? '<div class="rows sup-day">' + lines + '</div>' : U.emptyBlock('이 날은 매입·입금이 없어요.'))
: '<div class="rows sup-day">' + lines + '<div class="row total"><span class="grow">그날 끝 남은 외상</span><span class="amt">' + ctx.num({ value: r.bal, v: base + 'bal' }, 'won') + '</span></div></div>') +
(stmt ? '<p class="note">' + stmt + '</p>' : '') + (notes.length ? '<p class="note muted">' + notes.map(U.esc).join(' · ') + '</p>' : '');
return _.panel('c4 sup-detail', F.date(r.date, { refYear: ref }) + ' (' + WEEK[dow(r.date)] + ')', U.esc(NAME(ctx, s.id)), body);
}
function paidList(ctx, s, ref) {
var rows = s.mo.rows.filter(function (r) { return r.paid; });
var body = rows.length ? '<div class="rows">' + rows.map(function (r) {
var base = 'supDaily[' + s.id + '/' + r.date + '].';
return '<button type="button" class="row as-btn" data-sup-day="' + Number(r.date.slice(8, 10)) + '"><span class="grow"><span class="title">' + U.esc(F.date(r.date, { refYear: ref })) +
(r.flag && r.flag.indexOf('U') >= 0 ? ' ' + U.pill('통장 오기 전', 'warn') : '') + '</span><span class="line2">그 뒤 남은 외상 ' + ctx.num({ value: r.bal, v: base + 'bal' }, 'man') + '</span></span>' +
'<span class="amt">' + ctx.num({ value: r.paid, v: base + 'paid' }, 'won') + '</span></button>';
}).join('') + '</div>' : U.emptyBlock('이 달은 입금한 날이 없어요.');
return _.panel('c4 sup-paid', '입금한 날', rows.length ? rows.length + '번' : '', body);
}
function yearTable(ctx, s, ref) {
var ms = s.months.slice(-12).reverse();
var head = ['달', '청구', '입금', '달 끝 외상'];
var rows = ms.map(function (m) {
var mo = ctx.M.supMonth(s.id, m);
return ['<button type="button" class="link-btn" data-sup-month="' + m + '"' + (m === s.month ? ' aria-current="true"' : '') + '>' + U.esc(F.month(m, { refYear: ref })) + '</button>',
ctx.num(monthBuy(mo, plain(ctx)), 'short'), mo.nPaid ? ctx.num(mo.paid, 'short') : '<span class="muted">없음</span>', ctx.num(mo.end, 'man')];
});
var table = '<div class="table-wrap"><table class="sup-months"><thead><tr>' + head.map(function (h, i) { return '<th' + (i ? ' class="n"' : '') + ' scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td class="n">' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
return _.panel('c12 sup-year', '달마다', '최근 ' + ms.length + '달 · 달을 누르면 그 달 달력', table);
}
L.screens.sup = {
title: function () { return '거래처 외상'; },
html: function (ctx) {
var s = state(ctx), ref = Number(String(ctx.M.today).slice(0, 4)), meta = ctx.M.supMeta;
if (!s.id || !s.mo) return _.titleRow('거래처 외상', '') + '<div class="grid">' + _.panel('c12', '거래처 외상', '', U.emptyBlock('거래처 날마다 자료가 아직 없어요. 다음 대시보드 갱신 때 들어와요.')) + '</div>';
var sub = '날마다 청구된 돈과 입금한 날' + (meta && meta.to ? ' · 명세표 ' + U.esc(F.date(meta.to, { refYear: ref })) + '까지' : '') + (meta && meta.bank_last ? ' · 통장 ' + U.esc(F.date(meta.bank_last, { refYear: ref })) + '까지' : '');
return _.titleRow('거래처 외상', sub) +
'<div class="filters sup-filters" data-keep="filters">' + supChips(ctx, s) + monthNav(ctx, s, ref) + '</div>' +
tiles(ctx, s) + (plain(ctx) ? '' : gapNote(ctx, s, ref)) +
'<div class="grid">' + _.panel('c8 sup-cal', F.month(s.month, { refYear: ref }) + ' 달력', U.esc(NAME(ctx, s.id)), calendar(ctx, s), null, { keep: 'sup-cal' }) +
'<div class="c4 col-stack">' + dayDetail(ctx, s, ref) + (chartOn(ctx) ? flowPanel(ctx, s, ref) : paidList(ctx, s, ref)) + '</div>' + yearTable(ctx, s, ref) + '</div>';
},
mount: function (rootEl, ctx) {
rootEl.querySelectorAll('[data-sup]').forEach(function (b) { b.addEventListener('click', function () { go(ctx, { sup: b.getAttribute('data-sup'), y: null, m: null, day: null }); }); });
rootEl.querySelectorAll('[data-sup-month]').forEach(function (b) {
b.addEventListener('click', function () { var m = b.getAttribute('data-sup-month'); if (!/^\d{4}-\d{2}$/.test(m)) return; go(ctx, { y: m.slice(0, 4), m: m.slice(5), day: null }); });
});
var sel = rootEl.querySelector('[data-sup-select]');
if (sel) sel.addEventListener('change', function () { var m = sel.value; if (/^\d{4}-\d{2}$/.test(m)) go(ctx, { y: m.slice(0, 4), m: m.slice(5), day: null }); });
rootEl.querySelectorAll('[data-sup-day]').forEach(function (b) { b.addEventListener('click', function () { go(ctx, { day: b.getAttribute('data-sup-day') }); }); });
var s = state(ctx);
if (!s.mo) return;
if (chartOn(ctx)) {
rootEl.querySelectorAll('[data-sup-span]').forEach(function (b) {
b.addEventListener('click', function () { if (ctx.keep) ctx.keep(b); go(ctx, { chart: b.getAttribute('data-sup-span') === 'y' ? 'y' : null }); });
});
var el = rootEl.querySelector('#sup-flow');
if (el && window.Charts && window.Charts.levels) drawFlow(el, ctx, s);
}
var cal = ctx.V && ctx.V.supSwipe ? rootEl.querySelector('.cal[data-swipe]') : null;
if (cal && s.months.length > 1) swipeOn(cal, ctx, s);
},
swipeDir: swipeDir, chartData: chartData
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, _ = L.screens._;
var NAME = _.supName;
var UNIT = { kg: 'kg당', '개': '1개당', '번': '한 번에' };
var CARDS = 6;
function isNum(x) { return typeof x === 'number' && isFinite(x); }
function trend(r) { return !isNum(r.first_price) || !isNum(r.last_price) ? 'flat' : r.last_price > r.first_price ? 'up' : r.last_price < r.first_price ? 'down' : 'flat'; }
function pickId(ctx) {
var ids = ['nain', 'taejo', 'hyunjin', 'bethel'].filter(function (id) { return ctx.M.itemList && ctx.M.itemList(id).length; });
var want = ctx.route.params.get('sup');
return { ids: ids, id: ids.indexOf(want) >= 0 ? want : ids[0] || null };
}
function key(r) { return 'itemSummary[' + r.supplier + '/' + r.item + ']'; }
function spark(rows) {
var vals = rows.map(function (m) { return m.avg; }).filter(isNum);
if (!vals.length) return '';
var w = 120, h = 28, lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), span = hi - lo || 1;
var pts = vals.map(function (v, i) { return [vals.length === 1 ? w / 2 : (i * (w - 8)) / (vals.length - 1) + 4, hi === lo ? h / 2 : h - 4 - ((v - lo) / span) * (h - 8)]; });
var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
var last = pts[pts.length - 1];
return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" focusable="false"><path d="' + d + '"/>' +
'<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.5"/></svg>';
}
function change(ctx, r, opts) {
var t = trend(r), k = key(r);
if (t === 'flat') return '<span class="pc-chg flat">' + (r.n > 1 ? '그대로' : '한 번만 삼') + '</span>';
return '<span class="pc-chg ' + (t === 'up' ? 'bad' : 'good') + '">' + (t === 'up' ? '▲ ' : '▼ ') +
ctx.num({ value: Math.abs(r.last_price - r.first_price), v: t === 'up' ? k + '.last_price - ' + k + '.first_price' : k + '.first_price - ' + k + '.last_price' }, 'won') +
(opts && opts.short ? '' : ' (' + ctx.num({ value: (r.last_price - r.first_price) / r.first_price, v: '(' + k + '.last_price - ' + k + '.first_price) / ' + k + '.first_price' }, 'pct', { sign: true }) + ')') + '</span>';
}
function card(ctx, r, ref) {
var k = key(r), months = ctx.M.itemMonthly(r.supplier, r.item);
var qty = r.unit === 'kg' ? (Math.round(r.qty * 10) / 10).toLocaleString('ko-KR') + 'kg' : r.unit === '번' ? r.n + '번' : r.qty.toLocaleString('ko-KR') + '개';
var range = r.min_price !== r.max_price ? '<span>최저 ' + ctx.num({ value: r.min_price, v: k + '.min_price' }, 'won') + ' · 최고 ' + ctx.num({ value: r.max_price, v: k + '.max_price' }, 'won') + '</span>' : '';
var monthsTxt = months.length > 1 ? '<span class="pc-months">' + months.map(function (m) {
return '<span>' + U.esc(F.monthShort(m.month)) + ' ' + ctx.num({ value: m.avg, v: 'itemMonthly[' + r.supplier + '/' + r.item + '/' + m.month + '].avg' }, 'digits') + '</span>';
}).join('') + '</span>' : '';
return '<article class="price-card" data-trend="' + trend(r) + '">' +
'<div class="pc-head"><span class="pc-name">' + U.esc(r.item) + '</span><span class="pc-unit">' + U.esc(UNIT[r.unit] || '') + '</span></div>' +
'<div class="pc-now">' + ctx.num({ value: r.last_price, v: k + '.last_price' }, 'won') + change(ctx, r) + '</div>' +
'<div class="pc-trend">' + spark(months) + '<span class="pc-from">처음 ' + U.esc(F.date(r.first_date, { refYear: ref })) + ' ' + ctx.num({ value: r.first_price, v: k + '.first_price' }, 'won') + '<br>마지막 ' +
U.esc(F.date(r.last_date, { refYear: ref })) + '</span></div>' + monthsTxt +
'<div class="pc-foot">' + range + '<span>산 양 ' + U.esc(qty) + ' · ' + ctx.num({ value: r.amount, v: k + '.amount' }, 'man') + '</span>' + (r.sure === 'D' ? '<span class="muted">계산으로 낸 값</span>' : '') + '</div></article>';
}
function others(ctx, list, ref) {
if (!list.length) return '';
var head = ['품목', '최근 단가', '처음보다', '줄 수'];
var rows = list.map(function (r) {
return [U.esc(r.item) + (r.sure === 'U' ? ' <span class="muted">(이름 확실하지 않음)</span>' : '') + ' <span class="muted">' + U.esc(UNIT[r.unit] || '') + '</span>',
ctx.num({ value: r.last_price, v: key(r) + '.last_price' }, 'won'), change(ctx, r, { short: true }), String(r.n)];
});
return '<details class="as-table price-others"><summary>그 외 품목 ' + list.length + '개</summary><div class="table-wrap"><table><thead><tr>' +
head.map(function (h, i) { return '<th' + (i ? ' class="n"' : '') + ' scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td class="n">' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') +
'</tbody></table></div></details>';
}
function sourceNote(id, meta) {
if (!meta) return '';
var t = id === 'nain' ? '명세표에 적힌 kg당 단가예요(명세표 ' + meta.nain_docs + '장 · ' + meta.nain_lines + '줄).'
: id === 'taejo' ? '손글씨 명세표라 두 번 따로 읽어 금액·수량이 같은 줄만 썼어요(' + meta.taejo_lines + '/' + meta.taejo_lines_all + '줄). 1개당 = 금액 ÷ 수량.'
: id === 'hyunjin' ? '명세표에 적힌 kg당 단가예요(명세표 ' + meta.hyunjin_docs + '장 · ' + meta.hyunjin_lines + '줄). 같은 살치살도 상표·냉장/냉동이 다르면 따로 보여요.'
: '영수증 품목 요약으로 계산했어요. 무순은 1개당, 소금·비닐·봉투는 한 번에 산 값(같이 산 무순 값을 뺀 나머지)이에요.';
return '<p class="note muted">' + U.esc(t) + '</p>';
}
L.screens.price = {
title: function () { return '품목 단가'; },
html: function (ctx) {
var s = pickId(ctx), ref = Number(String(ctx.M.today).slice(0, 4)), meta = ctx.M.itemMeta;
if (!s.id) return _.titleRow('품목 단가', '') + '<div class="grid">' + _.panel('c12', '품목 단가', '', U.emptyBlock('명세표 품목 자료가 아직 없어요. 다음 대시보드 갱신 때 들어와요.')) + '</div>';
var list = ctx.M.itemList(s.id), main = list.filter(function (r) { return r.sure !== 'U' && r.n >= 3; }).slice(0, CARDS);
var rest = list.filter(function (r) { return main.indexOf(r) < 0; });
var counted = list.filter(function (r) { return r.sure !== 'U' && r.n >= 2; });
var up = counted.filter(function (r) { return trend(r) === 'up'; }), down = counted.filter(function (r) { return trend(r) === 'down'; });
var from = list.reduce(function (a, r) { return !a || r.first_date < a ? r.first_date : a; }, ''), to = list.reduce(function (a, r) { return r.last_date > a ? r.last_date : a; }, '');
var sum = (up.length ? '오른 품목 ' + up.length + '개(' + up.slice(0, 3).map(function (r) { return U.esc(r.item); }).join(', ') + (up.length > 3 ? ' …' : '') + ')' : '오른 품목 없음') + ' · ' +
(down.length ? '내린 품목 ' + down.length + '개(' + down.slice(0, 3).map(function (r) { return U.esc(r.item); }).join(', ') + (down.length > 3 ? ' …' : '') + ')' : '내린 품목 없음') +
' · 그대로 ' + (counted.length - up.length - down.length) + '개';
var chips = '<div class="chips sup-chips" role="group" aria-label="거래처">' + s.ids.map(function (id) {
return '<button type="button" class="chip" data-price-sup="' + id + '" aria-pressed="' + (id === s.id) + '">' + U.esc(NAME(ctx, id)) + '<span class="n">' + ctx.M.itemList(id).length + '</span></button>';
}).join('') + '</div>';
return _.titleRow('품목 단가', '명세표에 적힌 값이 처음보다 얼마나 바뀌었나' + (meta && meta.from ? ' · ' + U.esc(F.date(meta.from, { refYear: 0 })) + '~' + U.esc(F.date(meta.to, { refYear: ref })) : '')) +
'<div class="filters" data-keep="filters">' + chips + '</div>' +
'<div class="grid">' + _.panel('c12 price-panel', NAME(ctx, s.id) + ' 품목', U.esc(F.date(from, { refYear: ref }) + '~' + F.date(to, { refYear: ref })),
'<p class="price-sum">' + sum + '</p><div class="price-cards">' + main.map(function (r) { return card(ctx, r, ref); }).join('') + '</div>' +
others(ctx, rest, ref) + sourceNote(s.id, meta), null, { keep: 'price' }) + '</div>';
},
mount: function (rootEl, ctx) {
rootEl.querySelectorAll('[data-price-sup]').forEach(function (b) {
b.addEventListener('click', function () {
var params = {}; ctx.route.params.forEach(function (v, k) { params[k] = v; }); params.sup = b.getAttribute('data-price-sup');
var q = new URLSearchParams(); Object.keys(params).forEach(function (k) { if (params[k]) q.set(k, params[k]); });
history.replaceState(null, '', location.pathname + location.search + L.router.build(ctx.route.path, q));
ctx.rerender();
});
});
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function (root) {
var L = root.Ledger, U = L.ui, F = L.fmt, C = L.copy, _ = L.screens._;
function lockSection(ctx) {
var Lk = L.lock, K = C.lock;
if (!Lk || !K || !ctx.lock) return '';
var sup = Lk.support(), on = Lk.isOn(), ui = ctx.lock, body;
var msg = ui.msg && ui.msg.text ? '<p class="lock-msg' + (ui.msg.bad ? ' bad' : '') + '" role="status">' + U.esc(ui.msg.text) + '</p>' : '';
if (sup === 'no') body = '<p class="muted lock-na">' + U.esc(on ? K.naOn : K.na) + '</p>' + (on ? '<div class="row-actions"><button type="button" class="btn" data-action="lock-off">' + U.esc(K.turnOff) + '</button></div>' : '') + msg;
else if (sup !== 'yes') body = '<p class="muted">' + U.esc(K.checking) + '</p>';
else body = '<div class="switch-row"><label for="lock-toggle"><span class="t">' + U.esc(K.name) + '</span><span class="d">' + U.esc(on ? K.onDesc : K.offDesc) + '</span></label>' +
'<input id="lock-toggle" class="switch" type="checkbox" role="switch" data-lock-toggle' + (on ? ' checked' : '') + (ui.busy ? ' disabled' : '') + '></div>' + msg;
return section(K.title, K.desc, body);
}
function section(title, desc, panelHtml) {
return '<div class="set-row"><div class="label"><h2>' + U.esc(title) + '</h2>' + (desc ? '<p>' + U.esc(desc) + '</p>' : '') + '</div><div class="set-panel">' + panelHtml + '</div></div>';
}
function kv(k, vHtml) { return '<div class="kv"><span class="k">' + U.esc(k) + '</span><span class="v">' + vHtml + '</span></div>'; }
function when(iso) {
var d = iso ? new Date(String(iso)) : null;
if (!d || isNaN(d)) return F.DASH;
var p = function (n) { return (n < 10 ? '0' : '') + n; };
return U.esc(F.date(d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()), { refYear: new Date().getFullYear() }) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()));
}
L.screens.link = {
title: function () { return C.graph.settings; },
html: function (ctx) {
var G = C.graph, a = ctx.adapter || {}, info = a.sourceInfo ? a.sourceInfo() : {};
var where = info.kind === 'own' ? G.sourceOwn : info.kind === 'share' ? G.sourceShare : F.DASH;
var conn = kv(G.account, U.esc((a.accountLabel && a.accountLabel()) || F.DASH)) + kv(G.source, U.esc(where)) +
kv(G.saved, when(info.modified)) + kv(G.fingerprint, '<span class="fp-small">' + U.esc(F.fingerprint(ctx.fingerprint)) + '</span>');
var linkBtns = info.stored
? '<button type="button" class="btn" data-action="link-change">' + U.esc(G.linkChange) + '</button> <button type="button" class="btn ghost" data-action="link-clear">' + U.esc(G.linkClear) + '</button>'
: '<button type="button" class="btn" data-action="link-change">' + U.esc(G.linkAdd) + '</button>';
var home = ctx.V && ctx.V.home ? ctx.V.home : 'pnl';
return _.titleRow(G.settings, U.esc(G.settingsSub)) +
'<div class="settings">' +
section(G.connTitle, G.connDesc, conn) +
section(G.linkTitle, info.stored ? G.linkStored : info.kind === 'own' ? G.linkNone : G.firstBody, '<div class="row-actions">' + linkBtns + '</div><div id="link-box"></div><div id="link-clear-box"></div>') +
lockSection(ctx) +
section(G.signoutTitle, G.signoutDesc, '<div class="row-actions"><button type="button" class="btn" data-action="signout">' + U.esc(G.signout) + '</button></div>') +
'</div><p class="link-back"><a class="card-link" href="' + U.esc(ctx.link('/' + (home === 'overview' ? '' : home))) + '">' + U.esc(G.back) + '</a></p>';
}
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
(function () {
'use strict';
var L = window.Ledger, S = L.Snapshot, F = L.fmt, C = L.copy, U = L.ui, VC = L.viewConfig || {};
var qs = new URLSearchParams(location.search);
var BUILD = window.__LEDGER_BUILD__ || { mode: 'dev' };
var DEV = BUILD.mode === 'dev';
var forced = DEV ? qs.get('state') : null;
var STORES = ['all', '2ho', 'eungam'];
var VIEWS = VC.VIEWS || { admin: { nav: ['overview', 'debts', 'pnl', 'review', 'data'], home: 'overview', reasons: false, notes: false } };
var VIEW = BUILD.view || (DEV && qs.get('view')) || 'admin';
if (!VIEWS[VIEW]) VIEW = 'admin';
var V = VIEWS[VIEW];
function graphOn() { return !!(st && st.adapter && st.adapter.kind === 'graph'); }
function allowed(screen) { return screen === 'notfound' || (screen === 'link' ? graphOn() && !!(L.screens && L.screens.link) : screen === 'debt-detail' ? V.nav.indexOf('debts') >= 0 : V.nav.indexOf(screen) >= 0); }
function effective(route) {
if (allowed(route.screen)) return route;
return { path: V.home === 'overview' ? '/' : '/' + V.home, params: route.params, screen: V.home, arg: null, redirected: route.screen };
}
var st = {
status: 'loading', reason: null, adapter: null, snap: null, model: null, validation: null, fingerprint: null,
loadError: null, route: null, lastScreen: null, prefs: loadPrefs(), unwatch: null, drills: [], ctx: null
};
function loadTx(months) {
var a = st.adapter;
if (!a || !a.loadLazy) return Promise.resolve([]);
return Promise.all((months || []).map(function (m) { return Promise.resolve(a.loadLazy('tx~' + m)).catch(function () { return null; }); }))
.then(function (list) { return list.filter(Boolean); });
}
function loadTxo(months) {
var a = st.adapter;
if (!a || !a.loadLazy) return Promise.resolve([]);
return Promise.all((months || []).map(function (m) { return Promise.resolve(a.loadLazy('txo~' + m)).catch(function () { return null; }); }))
.then(function (list) { return list.filter(Boolean); });
}
function txoOk() { var a = st.adapter; if (!a || !a.loadLazy) return false; var lp = a.lazyParts ? a.lazyParts() : null; return lp == null ? true : lp.some(function (x) { return /^txo~/.test(x.name); }); }
function txOk() { var a = st.adapter; if (!a || !a.loadLazy) return false; var lp = a.lazyParts ? a.lazyParts() : null; return lp == null ? true : lp.some(function (x) { return /^tx~/.test(x.name); }); }
function loadPrefs() {
var base = { units: 'man', hidePersonal: false, theme: 'auto', filters: null };
try { var p = JSON.parse(localStorage.getItem('ledger.prefs') || 'null'); return p ? Object.assign(base, p) : base; } catch (e) { return base; }
}
function savePrefs() { try { localStorage.setItem('ledger.prefs', JSON.stringify(st.prefs)); } catch (e) { } }
function applyTheme() {
var t = st.prefs.theme;
if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
else document.documentElement.removeAttribute('data-theme');
}
var R = L.router;
function parseHash() { return effective(R.parse(location.hash || '#' + V.home)); }
var hashFor = R.build;
function navId(screen) { return screen === 'debt-detail' ? 'debts' : screen; }
function filters(route) { return R.resolveFilters(st.model, route.params, st.prefs.filters, { multi: !!V.multiPeriod }); }
function setFilter(patch) {
var r = st.route, f = filters(r);
var cur = f.multi ? R.periodParams(f.years, f.annual ? [] : f.months) : { y: f.year, m: f.annual ? 0 : Number(f.month.slice(5)) };
var next = { store: f.store, y: cur.y, m: cur.m };
Object.keys(patch).forEach(function (k) { next[k] = patch[k]; });
if (f.multi && typeof patch.m === 'number' && patch.y == null) next.y = f.year;
if (patch.y && patch.m == null && next.m !== 0 && typeof next.y === 'number' && typeof next.m === 'number') next.m = R.monthForYear(st.model, next.store, next.y, next.m);
st.prefs.filters = { store: next.store, y: next.y, m: next.m }; savePrefs();
var params = {}; r.params.forEach(function (v, k) { params[k] = v; });
params.store = next.store === 'all' ? null : next.store; params.y = next.y; params.m = typeof next.m === 'number' ? (next.m < 10 ? '0' + next.m : String(next.m)) : String(next.m);
history.replaceState(null, '', location.pathname + location.search + hashFor(r.path, params));
render();
}
function togglePeriod(kind, v) {
var f = filters(st.route), ys = f.years.slice(), ms = f.annual ? [] : f.months.slice(), i;
if (kind === 'y') { i = ys.indexOf(v); if (i >= 0) { if (ys.length > 1) ys.splice(i, 1); } else ys.push(v); ys.sort(function (a, b) { return a - b; }); }
else if (v === 0) ms = [];
else { i = ms.indexOf(v); if (i >= 0) ms.splice(i, 1); else ms.push(v); ms.sort(function (a, b) { return a - b; }); }
var pp = R.periodParams(ys, ms);
setFilter({ y: pp.y, m: pp.m });
}
function setParam(key, value) {
var r = st.route, params = {};
r.params.forEach(function (v, k) { params[k] = v; });
params[key] = value == null || value === '' ? null : value;
history.replaceState(null, '', location.pathname + location.search + hashFor(r.path, params));
render();
}
function link(path, extra) {
var params = {};
if (st.route) st.route.params.forEach(function (v, k) { if (k === 'store' || k === 'y' || k === 'm') params[k] = v; });
Object.keys(extra || {}).forEach(function (k) { params[k] = extra[k]; });
return hashFor(path, params);
}
function brandName() {
var wb = st.snap && st.snap.source && st.snap.source.workbook;
if (!wb) return C.appFallback;
var n = String(wb).replace(/\.(xlsx|xlsm|json)$/i, '').replace(/[_\s-]*통합장부.*$/, '').trim();
return n || C.appFallback;
}
var MARK = '<svg class="mark" viewBox="0 0 22 22" aria-hidden="true" focusable="false"><path d="M3.5 10.2c2.6-3.7 12.4-3.7 15 0z" fill="currentColor"/><rect x="3.75" y="11" width="14.5" height="6.25" rx="3.1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
var ICON_ACCT = '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="5.5" r="2.75"/><path d="M2.75 13.75c.9-2.6 2.9-3.9 5.25-3.9s4.35 1.3 5.25 3.9"/></svg>';
function acctLink(cls) {
if (!graphOn() || st.status !== 'ready' || !allowed('link') || isLocked()) return '';
var on = st.route && st.route.screen === 'link';
return '<a class="' + cls + '" href="#link"' + (on ? ' aria-current="page"' : '') + (cls === 'acct-btn' ? ' aria-label="' + U.esc(C.graph.settings) + '"' : '') + '>' + ICON_ACCT + (cls === 'acct-btn' ? '' : '<span>' + U.esc(C.graph.settings) + '</span>') + '</a>';
}
function freshText() {
if (!st.model) return '';
var fr = st.model.freshness(), ref = Number(String(st.model.today).slice(0, 4));
var bank = '통장 ' + F.date(fr.bank.value, { refYear: ref }) + '까지';
var stmt = fr.stmt.value ? '명세표 ' + F.date(fr.stmt.value, { refYear: ref }) + '까지' : '';
var stmtShort = fr.stmt.value ? '명세표 ' + F.dateShort(fr.stmt.value) : '';
var short = ['통장 ' + F.dateShort(fr.bank.value), stmtShort].filter(Boolean).join(' · ');
return { bank: bank, stmt: stmt, line: [bank, stmt].filter(Boolean).join(' · '), short: short, stmtShort: stmtShort, refreshed: fr.refreshed };
}
function stampText(fr) {
if (!fr) return { line: '', short: '' };
return V.stamp === 'stmt' && fr.stmt ? { line: fr.stmt, short: fr.stmtShort } : { line: fr.line, short: fr.short };
}
function term(k) { return (V.terms && V.terms[k]) || (C.terms && C.terms[k]) || k; }
function navLabel(id) { var n = C.nav.filter(function (x) { return x.id === id; })[0]; return (V.terms && V.terms[id]) || (n ? n.label : id); }
function navList() { return V.nav.map(function (id) { var n = C.nav.filter(function (x) { return x.id === id; })[0]; return n ? { id: n.id, path: n.path, label: navLabel(id), tab: n.tab || null } : null; }).filter(Boolean); }
function navItems(cls, withIcon) {
var current = st.route ? navId(st.route.screen) : V.home;
var rc = st.model ? (V.reviewTodo ? st.model.reviewItems('전체').length : st.model.reviewCount().value) : null;
return navList().map(function (n) {
var count = n.id === 'review' && F.isNum(rc) && rc > 0 ? '<span class="count" aria-label="' + F.count(rc) + '">' + (withIcon && cls === 'tab' && rc > 999 ? '999+' : F.digits(rc)) + '</span>' : '';
return '<a class="' + cls + '" href="' + U.esc(link(n.path)) + '"' + (n.id === current ? ' aria-current="page"' : '') + '>' +
(withIcon ? U.icon(n.id) : '') + '<span>' + U.esc(withIcon && cls === 'tab' && n.tab && navList().length >= 8 ? n.tab : n.label) + '</span>' + count + '</a>';
}).join('');
}
function renderShell() {
var lk = isLocked();
var name = U.esc(lk ? C.appFallback : brandName()), fr = lk ? '' : freshText();
var f = !lk && st.model && st.route ? filters(st.route) : null;
var badge = C.viewBadge && C.viewBadge[VIEW] ? C.viewBadge[VIEW] : '';
var scope = (badge ? U.esc(badge) + ' · ' : '') + U.esc(f ? (f.store === 'all' ? C.storeFallback.all : st.model.storeLabel(f.store)) : C.storeFallback.all);
var synthetic = !lk && st.snap && st.snap.source && st.snap.source.synthetic;
var tabbar = document.getElementById('tabbar'), appEl = document.querySelector('.app');
if (tabbar) { tabbar.style.setProperty('--tabs', String(navList().length)); tabbar.setAttribute('data-view', VIEW); }
if (appEl && (lk || appEl.classList.contains('locked'))) appEl.classList.toggle('locked', lk);
document.getElementById('sidebar').innerHTML =
'<div class="brand">' + MARK + '<div><div class="brand-name">' + name + '</div><div class="brand-scope">' + scope + '</div></div></div>' +
(lk ? '' : '<nav aria-label="메뉴"><div class="nav">' + navItems('nav-item', true) + '</div></nav>') +
'<div class="bottom">' + (fr ? '<span>' + U.esc(fr.bank) + '</span>' + (fr.stmt ? '<span>' + U.esc(fr.stmt) + '</span>' : '') +
(fr.refreshed ? '<span>' + U.esc(F.date(String(fr.refreshed).slice(0, 10)) + ' ' + F.time(fr.refreshed)) + ' 갱신</span>' : '') : '') +
(synthetic ? '<span class="synthetic">' + U.esc(C.states.synthetic) + '</span>' : '') + acctLink('nav-item acct-link') + '</div>';
var sp = stampText(fr), stamp = '<span class="stamp"><span class="long">' + U.esc(sp.line) + '</span><span class="short">' + U.esc(sp.short) + '</span></span>', acct = acctLink('acct-btn');
document.getElementById('topbar').innerHTML = '<div class="brand">' + MARK + '<div class="brand-name">' + name + '</div>' + (badge ? '<span class="view-badge">' + U.esc(badge) + '</span>' : '') + '</div>' +
(acct ? '<span class="top-end">' + stamp + acct + '</span>' : stamp);
document.getElementById('tabs-top').innerHTML = lk ? '' : navItems('tab', false);
document.getElementById('tabbar').innerHTML = lk ? '' : navItems('tab', true);
}
function lockAvail() { return !!(L.lock && (BUILD.mode === 'web' || (DEV && graphOn()))); }
function isLocked() { return lockAvail() && L.lock.locked(); }
var lockUi = { busy: false, err: null, msg: null };
var RELOGIN_KEY = 'ledger.lock.relogin';
var LOCK_ICON = '<svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.25 10.5V8a3.75 3.75 0 0 1 7.5 0v2.5M12 14.5v2"/></svg>';
function lockErrText(e, kind) {
var K = C.lock || {}, code = e && e.code;
if (kind === 'enable') return (K.enableErr && (K.enableErr[code] || K.enableErr.failed)) || '';
return code === 'unsupported' ? K.unsupported : K.unlockErr;
}
function lockHtml() {
var K = C.lock || {}, e = lockUi.err, gone = !!(e && e.unsupported);
var btns = (gone ? '' : '<button type="button" class="btn primary" data-action="unlock"' + (lockUi.busy ? ' disabled' : '') + '>' + U.esc(lockUi.busy ? K.unlocking : e ? K.retry : K.unlock) + '</button>') +
(e ? (gone ? '' : ' ') + '<button type="button" class="btn' + (gone ? ' primary' : '') + '" data-action="lock-relogin">' + U.esc(K.relogin) + '</button>' : '');
return '<div class="title-row"><div><h1 tabindex="-1">' + U.esc(K.lockedTitle) + '</h1></div></div>' +
'<section class="state lock-screen" aria-live="polite">' + LOCK_ICON + '<p>' + U.esc(K.lockedBody) + '</p><div class="row-actions">' + btns + '</div>' +
(e ? '<p class="lock-err" role="alert">' + U.esc(e.text) + '</p><p class="lock-note">' + U.esc(K.reloginNote) + '</p>' : '') + '</section>';
}
function lockToggle(input) {
var K = C.lock || {};
if (!lockAvail() || lockUi.busy) return;
if (input.checked) {
var p = L.lock.enable();
lockUi.busy = true; lockUi.msg = { text: K.registering }; render();
p.then(function () { lockUi.busy = false; lockUi.msg = { text: K.onDone }; announce(K.onDone); render(); },
function (e) { lockUi.busy = false; lockUi.msg = { text: lockErrText(e, 'enable'), bad: true }; render(); });
} else { L.lock.disable(); lockUi.msg = { text: K.offDone }; announce(K.offDone); render(); }
}
function reloginPending() { var v = null; try { v = sessionStorage.getItem(RELOGIN_KEY); sessionStorage.removeItem(RELOGIN_KEY); } catch (e) { v = null; } return v === '1'; }
function relogin() {
var a = st.adapter;
if (L.lock) L.lock.disable();
lockUi.busy = false; lockUi.err = null;
try { sessionStorage.setItem(RELOGIN_KEY, '1'); } catch (x) { }
if (st.unwatch) { st.unwatch(); st.unwatch = null; }
dropSnapshot(); st.status = 'loading'; render();
if (a && a.signOut) Promise.resolve(a.signOut()).then(function (r) { if (r && r.reload) load(); }); else load();
}
function noticesHtml() {
var out = [], fr = st.model ? st.model.freshness() : null, mode = st.adapter ? st.adapter.kind : 'file';
if (st.loadError) {
var at = st.loadError.cachedAt ? clock(st.loadError.cachedAt) || F.date(String(st.loadError.cachedAt).slice(0, 10)) : '';
var why = mode === 'graph' && st.loadError.error && st.loadError.error.userMessage;
var txt = why ? L.tpl(C.states.errorCachedMsg, { msg: why, time: whenText(st.loadError.cachedAt) }).replace(/\s{2,}/g, ' ') : L.tpl(C.states.errorCached, { source: C.sourceNames[mode] || '', time: at });
out.push(U.notice('bad', U.esc(txt), '<button type="button" class="btn act" data-action="retry">' + U.esc(C.states.error.retry) + '</button>'));
}
if (st.validation && st.validation.errors.length) out.push(U.notice('bad', U.esc(L.tpl(C.states.invalid, { n: st.validation.errors.length })) + (allowed('data') ? ' <a class="card-link" href="' + U.esc(link('/data')) + '">자료 화면</a>' : '')));
if (fr && fr.stale && V.staleNote !== false) {
var tplKey = mode === 'graph' ? 'staleGraph' : 'stale';
out.push(U.notice('warn', U.esc(L.tpl(C.states[tplKey], { days: fr.ageDays, date: F.date(String(fr.refreshed).slice(0, 10)) }))));
}
if (st.snap && st.snap.source && st.snap.source.synthetic) out.push(U.notice('info', U.esc(C.states.synthetic)));
return out.length ? '<div class="notices">' + out.join('') + '</div>' : '';
}
function stateHtml() {
var s = C.states, mode = (forced && qs.get('as')) || (st.adapter ? st.adapter.kind : 'file');
if (st.status === 'unavailable') {
if (st.reason === 'notOwner') return U.stateScreen(s.notOwner);
if (mode === 'graph') return U.stateScreen(s.unavailableGraph);
return U.stateScreen(s.outside);
}
if (st.status === 'signedOut') return U.stateScreen({ title: s.signedOut.title, body: s.signedOut.body, actions: [{ label: s.signedOut.action, action: 'signin', primary: true }] });
if ((graphOn() || mode === 'graph') && C.graph && (st.status === 'empty' || st.status === 'error')) return graphStateHtml();
if (st.status === 'empty') {
if (mode === 'artifact') return U.stateScreen(s.emptyArtifact);
return U.stateScreen(s.emptyFile);
}
var msg = st.error && st.error.userMessage ? st.error.userMessage : (st.error && st.error.message ? String(st.error.message) : '');
return U.stateScreen({ title: s.error.title, body: msg || s.error.title, actions: [{ label: s.error.retry, action: 'retry', primary: true }] });
}
var keepAt = null;
function keepFrom(el) {
keepAt = null;
var box = el && el.closest ? el.closest('[data-keep]') : null;
if (!box) return;
keepAt = { sel: '[data-keep="' + CSS.escape(box.getAttribute('data-keep')) + '"]', top: box.getBoundingClientRect().top };
}
function restoreKeep(main) {
var k = keepAt; keepAt = null;
if (!k) return;
var fix = function () { var el = main.querySelector(k.sel); if (!el) return; var d = el.getBoundingClientRect().top - k.top; if (Math.abs(d) >= 1) window.scrollBy(0, d); };
fix();
if (window.requestAnimationFrame) window.requestAnimationFrame(fix);
}
function activeKey() {
var a = document.activeElement;
if (!a || a === document.body) return null;
var attrs = ['data-store', 'data-year', 'data-month', 'data-month-chip', 'data-pick-month', 'data-go-month', 'data-period-reset', 'data-year-select', 'data-place', 'data-period', 'data-kpi', 'data-type', 'data-pref', 'data-toggle', 'data-basis', 'data-sup-span', 'id'];
for (var i = 0; i < attrs.length; i++) { var v = a.getAttribute(attrs[i]); if (v != null) return attrs[i] === 'id' ? '#' + CSS.escape(v) : '[' + attrs[i] + '="' + CSS.escape(v) + '"]'; }
return null;
}
function ctxFor(route) {
var f = filters(route);
var bankView = route.screen === 'pnl' && !!st.modelBank && route.params.get('basis') === 'bank';
return {
route: route, f: f, M: bankView ? st.modelBank : st.model, bankView: bankView, snap: st.snap, validation: st.validation, fingerprint: st.fingerprint, prefs: st.prefs, view: VIEW, V: V, allowed: allowed, term: term,
inbox: V.inbox && L.inbox ? L.inbox : null,
loadTx: loadTx, txOk: txOk, loadTxo: loadTxo, txoOk: txoOk, addDrill: function (d) { st.drills.push(d); return st.drills.length - 1; }, keep: keepFrom,
adapter: st.adapter, status: st.status, link: link, setFilter: setFilter, setParam: setParam, setPref: setPref, rerender: render, brand: brandName(),
lock: lockAvail() ? { busy: lockUi.busy, msg: lockUi.msg } : null,
num: function (x, unit, opts) { return U.num(x, unit, Object.assign({ units: st.prefs.units }, opts || {})); },
delta: function (x, unit, good, opts) { return U.delta(x, unit, good, Object.assign({ units: st.prefs.units }, opts || {})); },
storeName: function (code) { return code === 'all' ? C.storeFallback.all : st.model.storeLabel(code); }
};
}
function render() {
var route = st.route = parseHash();
if (route.redirected && location.hash) {
var rp = {}; route.params.forEach(function (v, k) { rp[k] = v; });
history.replaceState(null, '', location.pathname + location.search + hashFor(route.path, rp));
}
var main = document.getElementById('main'), key = activeKey(), screenChanged = st.lastScreen !== route.screen + '|' + route.arg;
if (screenChanged && lockUi.msg && !lockUi.busy) lockUi.msg = null;
if (isLocked()) {
var firstLock = st.lastScreen !== 'lock';
st.lastScreen = 'lock';
renderShell();
if (L.pop) L.pop.close();
main.removeAttribute('aria-busy');
main.innerHTML = lockHtml();
document.title = C.appFallback;
if (firstLock) { keepAt = null; focusTitle(main); window.scrollTo(0, 0); }
st.rendered = true;
window.__LEDGER_READY__ = true;
document.dispatchEvent(new CustomEvent('ledger:rendered', { detail: { screen: 'lock' } }));
return;
}
st.lastScreen = route.screen + '|' + route.arg;
renderShell();
if (st.status === 'loading') { main.innerHTML = U.skeleton(route.screen, navLabel); main.setAttribute('aria-busy', 'true'); return; }
main.removeAttribute('aria-busy');
if (st.status !== 'ready') {
main.innerHTML = stateHtml(); if (BUILD.mode !== 'artifact') document.title = C.appFallback; if (screenChanged) focusTitle(main); st.rendered = true;
window.__LEDGER_READY__ = true;
document.dispatchEvent(new CustomEvent('ledger:rendered', { detail: { screen: 'state:' + st.status } }));
return;
}
if (L.pop) L.pop.close();
st.drills = [];
var scr = L.screens[route.screen] || L.screens.notfound, ctx = st.ctx = ctxFor(route);
try {
main.innerHTML = scr.html(ctx);
var tr = main.querySelector('.title-row');
if (tr) tr.insertAdjacentHTML('afterend', noticesHtml());
U.applyWidths(main);
var on = main.querySelector('.month-chips [aria-pressed="true"]');
if (on && on.parentNode && on.parentNode.scrollWidth > on.parentNode.clientWidth) on.parentNode.scrollLeft = Math.max(0, on.offsetLeft - on.parentNode.clientWidth / 2 + on.offsetWidth / 2);
if (scr.mount) scr.mount(main, ctx);
} catch (e) {
console.error(e);
main.innerHTML = U.stateScreen({ title: C.states.error.title, body: '화면을 그리다 문제가 생겼어요. ' + (e && e.message ? e.message : ''), actions: [{ label: C.states.error.retry, action: 'retry', primary: true }] });
}
if (BUILD.mode !== 'artifact') document.title = (scr.title ? scr.title(ctx) : '') + ' · ' + brandName();
if (screenChanged) { keepAt = null; focusTitle(main); window.scrollTo(0, 0); }
else {
if (key) { var el = main.querySelector(key); if (el) el.focus({ preventScroll: true }); }
restoreKeep(main);
}
st.rendered = true;
window.__LEDGER_READY__ = true;
document.dispatchEvent(new CustomEvent('ledger:rendered', { detail: { screen: route.screen } }));
}
function focusTitle(main) {
if (!st.rendered) return;
var h = main.querySelector('h1'); if (h) h.focus({ preventScroll: true });
}
function clock(x) {
var s = String(x || '');
if (/T.*(Z|[+-]\d{2}:?\d{2})$/.test(s)) { var d = new Date(s); if (!isNaN(d)) return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
return F.time(s);
}
function whenText(x) {
var d = x ? new Date(String(x)) : null;
if (!d || isNaN(d)) return '';
var p = function (n) { return (n < 10 ? '0' : '') + n; }, now = new Date();
var ymd = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()), today = now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate());
return (ymd === today ? '' : F.date(ymd, { refYear: now.getFullYear() }) + ' ') + p(d.getHours()) + ':' + p(d.getMinutes());
}
function linkFormHtml(err, cancel) {
var GC = C.graph;
return '<form class="link-form" data-link-form novalidate>' +
'<label class="lf-label" for="share-link">' + U.esc(GC.linkLabel) + '</label>' +
'<input class="lf-input" id="share-link" name="link" type="url" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="' + U.esc(GC.linkPlaceholder) + '" aria-describedby="share-link-help share-link-err">' +
'<p class="lf-help" id="share-link-help">' + U.esc(GC.linkHelp) + '</p>' +
'<p class="lf-err" id="share-link-err" role="alert">' + U.esc(err || '') + '</p>' +
'<div class="row-actions"><button type="submit" class="btn primary" data-link-submit>' + U.esc(GC.linkSubmit) + '</button>' +
(cancel ? ' <button type="button" class="btn ghost" data-action="link-cancel">' + U.esc(GC.cancel) + '</button>' : '') + '</div></form>';
}
function acctLine() {
var a = st.adapter, who = a && a.accountLabel ? a.accountLabel() : '';
return who ? '<p class="lf-who muted">' + U.esc(L.tpl(C.graph.loggedInAs, { account: who })) + '</p>' : '';
}
function graphStateHtml() {
var s = C.states, GC = C.graph, e = st.error || {}, a = st.adapter || {};
var msg = e.userMessage || (e.message ? String(e.message) : '') || s.error.title;
if (st.status === 'empty') {
return U.stateScreen({ title: GC.firstTitle, body: GC.firstBody, extra: linkFormHtml('', false),
after: acctLine() + '<p class="lf-owner muted">' + U.esc(GC.ownerHint) + '</p><div class="row-actions"><button type="button" class="btn" data-action="retry">' + U.esc(GC.retryFind) + '</button> <button type="button" class="btn ghost" data-action="signout">' + U.esc(GC.otherAccount) + '</button></div>' });
}
if (e.needLink) {
return U.stateScreen({ title: GC.linkAgainTitle, body: msg, extra: linkFormHtml('', false),
after: acctLine() + '<div class="row-actions"><button type="button" class="btn" data-action="retry">' + U.esc(s.error.retry) + '</button> <button type="button" class="btn ghost" data-action="signout">' + U.esc(GC.otherAccount) + '</button></div>' });
}
var acts = [];
if (e.signIn) acts.push({ label: s.signedOut.action, action: 'signin', primary: true });
acts.push({ label: s.error.retry, action: 'retry', primary: !e.signIn });
var info = a.sourceInfo ? a.sourceInfo() : {};
if (info.stored) acts.push({ label: GC.linkChange, action: 'link-change' });
if (!e.signIn) acts.push({ label: GC.signout, action: 'signout' });
return U.stateScreen({ title: s.error.title, body: msg, actions: acts, after: acctLine() + '<div id="link-box"></div>' });
}
function onSubmit(e) {
var f = e.target;
if (!f || !f.hasAttribute || !f.hasAttribute('data-link-form')) return;
e.preventDefault();
var a = st.adapter, input = f.querySelector('input[name="link"]'), err = f.querySelector('.lf-err'), btn = f.querySelector('[data-link-submit]');
if (!a || !a.setShareLink || (btn && btn.disabled)) return;
if (btn) { btn.disabled = true; btn.textContent = C.graph.linkChecking; }
if (err) err.textContent = '';
a.setShareLink(input ? input.value : '').then(function () {
announce(C.graph.linkSaved);
if (st.route && st.route.screen === 'link') history.replaceState(null, '', location.pathname + location.search + hashFor(V.home === 'overview' ? '/' : '/' + V.home, {}));
load();
}, function (x) {
if (btn) { btn.disabled = false; btn.textContent = C.graph.linkSubmit; }
if (err) err.textContent = x && x.userMessage ? x.userMessage : C.graph.err.linkDenied;
if (input) input.focus();
});
}
function announce(text) { var live = document.getElementById('live'); if (!live) return; live.textContent = ''; setTimeout(function () { live.textContent = text; }, 30); }
function setPref(k, v) { st.prefs[k] = v; savePrefs(); if (k === 'theme') applyTheme(); render(); }
function modelFor(snap, basis) {
var today = qs.get('today') || undefined;
if (forced === 'stale') {
var base = String((snap.meta && (snap.meta.refreshed_at || snap.meta.built_at)) || '').slice(0, 10);
if (S.validDate(base)) { var d = new Date(base + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 5); today = d.toISOString().slice(0, 10); }
}
return L.model.create(snap, { today: today, basis: basis, columns: C.columns, labels: { tax: C.groups.tax, etc: C.groups.etc, loan: C.groups.loan, all: C.storeFallback.all, '2ho': C.storeFallback['2ho'], eungam: C.storeFallback.eungam } });
}
function dropSnapshot() { st.snap = null; st.model = null; st.modelBank = null; st.validation = null; st.fingerprint = null; st.loadError = null; }
function setSnapshot(snap, fresh) {
st.snap = snap;
st.validation = S.validate(snap);
st.model = modelFor(snap);
st.modelBank = V.bankToggle && st.model.hasAdj ? modelFor(snap, 'bank') : null;
st.status = 'ready';
return S.fingerprint(snap).then(function (fp) {
st.fingerprint = fp;
if (snap.source && snap.source.fingerprint && snap.source.fingerprint !== fp) st.validation.warnings.push({ code: 'fingerprint', message: '받은 자료의 지문(' + snap.source.fingerprint + ')과 화면에서 다시 계산한 지문(' + fp + ')이 달라요.', where: 'source.fingerprint' });
if (fresh) announce(C.states.fresh);
});
}
function pickAdapter() {
var want = qs.get('adapter') || (BUILD.mode === 'artifact' ? 'artifact' : BUILD.mode === 'web' ? 'graph' : 'file');
var A = L.adapters && (L.adapters[want] || L.adapters.file || L.adapters.artifact || L.adapters.graph);
if (!A) throw new Error('자료를 읽을 어댑터가 없어요.');
return A.create({ params: qs, forced: forced, shared: !!V.shared });
}
function load() {
st.status = 'loading'; st.loadError = null; render();
var a = st.adapter;
return Promise.resolve(a.init()).then(function (res) {
res = res || {};
if (forced === 'signedout') res = { state: 'signedOut' };
if (forced === 'unavailable') res = { state: 'unavailable', reason: qs.get('as') === 'graph' ? 'noClientId' : 'outside' };
if (forced === 'empty') res = { state: 'empty' };
if (forced === 'error') throw Object.assign(new Error('예시 오류예요.'), { userMessage: '자료를 못 읽었어요. 잠시 뒤 다시 시도해 주세요.' });
if (forced === 'loading') return new Promise(function () { });
var relogin = lockAvail() && reloginPending();
if (res.state !== 'ready') {
st.status = res.state || 'error'; st.reason = res.reason || null; st.error = res.error || null;
if (graphOn()) dropSnapshot();
if (relogin && res.state === 'signedOut' && a.signIn) a.signIn();
return null;
}
return Promise.resolve(a.load()).then(function (snap) { return setSnapshot(snap, false); }).then(function () {
if (forced === 'error-cached') st.loadError = { cachedAt: st.snap.meta && st.snap.meta.refreshed_at };
if (res.cachedOnly) { var c0 = a.cached ? a.cached() : null; st.loadError = { cachedAt: c0 && c0.savedAt, error: res.error }; }
});
}).catch(function (e) {
console.error(e);
var cached = a.cached ? a.cached() : null;
if (cached && cached.snapshot) {
return setSnapshot(cached.snapshot, false).then(function () { st.loadError = { cachedAt: cached.savedAt, error: e }; });
}
st.status = 'error'; st.error = e;
if (graphOn()) dropSnapshot();
}).then(function () {
render();
if (st.status === 'ready' && V.inbox && L.inbox && a.database && a.database()) L.inbox.init(a.database(), render);
if (st.status === 'ready' && a.watch && !st.unwatch) {
st.unwatch = a.watch(function (snap) { setSnapshot(snap, true).then(function () { st.loadError = null; render(); }); },
function (e) {
console.warn(e);
if (e && e.revoked) { if (st.unwatch) { st.unwatch(); st.unwatch = null; } dropSnapshot(); st.status = 'error'; st.error = e; render(); return; }
var c1 = graphOn() && a.cached ? a.cached() : null;
st.loadError = { cachedAt: (c1 && c1.savedAt) || (st.snap && st.snap.meta && st.snap.meta.refreshed_at), error: e }; render();
});
}
});
}
function onClick(e) {
var lt = e.target.closest('[data-lock-toggle]');
if (lt) { lockToggle(lt); return; }
var dr = e.target.closest('[data-drill]');
if (dr && L.pop && st.ctx) { var d = st.drills[Number(dr.getAttribute('data-drill'))]; if (d) L.pop.drill(st.ctx, d, dr); return; }
var pk = e.target.closest('[data-pick-month],[data-go-month]');
if (pk) {
keepFrom(pk);
var pm = pk.getAttribute('data-pick-month') || pk.getAttribute('data-go-month');
if (/^\d{4}-\d{2}$/.test(pm)) { if (pk.hasAttribute('data-pick-month') && V.multiPeriod) togglePeriod('m', Number(pm.slice(5))); else setFilter({ y: Number(pm.slice(0, 4)), m: Number(pm.slice(5)) }); }
return;
}
var bt = e.target.closest('[data-basis]');
if (bt && V.bankToggle) { keepFrom(bt); setParam('basis', bt.getAttribute('data-basis') === 'bank' ? 'bank' : null); return; }
var t = e.target.closest('[data-store],[data-year],[data-month-chip],[data-period-reset],[data-place],[data-action],[data-pref]');
if (!t) return;
if (!t.hasAttribute('data-action')) keepFrom(t);
if (t.hasAttribute('data-store')) { setFilter({ store: t.getAttribute('data-store') }); return; }
if (t.hasAttribute('data-year')) { if (V.multiPeriod) togglePeriod('y', Number(t.getAttribute('data-year'))); else setFilter({ y: Number(t.getAttribute('data-year')) }); return; }
if (t.hasAttribute('data-month-chip')) { if (V.multiPeriod) togglePeriod('m', Number(t.getAttribute('data-month-chip'))); else setFilter({ m: Number(t.getAttribute('data-month-chip')) }); return; }
if (t.hasAttribute('data-period-reset')) { var lm = st.model.latestMonth(filters(st.route).store) || st.model.latestMonth('all'); if (lm) setFilter({ y: Number(lm.slice(0, 4)), m: Number(lm.slice(5)) }); return; }
if (t.hasAttribute('data-place')) { setParam('place', t.getAttribute('data-place') === 'all' ? null : t.getAttribute('data-place')); return; }
if (t.hasAttribute('data-pref')) { var k = t.getAttribute('data-pref'), v = t.getAttribute('data-value'); if (t.type === 'checkbox') return; setPref(k, v); return; }
var act = t.getAttribute('data-action'), a = st.adapter;
if (act === 'skip') { var mm = document.getElementById('main'), h1 = mm && mm.querySelector('h1'); (h1 || mm).focus(); return; }
if (act === 'retry') { load(); return; }
if (act === 'signin' && a && a.signIn) { a.signIn(); return; }
if (act === 'signout' && a && a.signOut) { if (lockAvail()) L.lock.disable(); Promise.resolve(a.signOut()).then(function (r) { if (r && r.reload) load(); }); return; }
if (act === 'unlock' && lockAvail()) {
var up = L.lock.unlock();
lockUi.busy = true; lockUi.err = null; render();
up.then(function () { lockUi.busy = false; lockUi.err = null; }, function (x) { lockUi.busy = false; lockUi.err = { text: lockErrText(x), unsupported: !!(x && x.code === 'unsupported') }; render(); });
return;
}
if (act === 'lock-relogin') { relogin(); return; }
if (act === 'lock-off' && lockAvail()) { L.lock.disable(); lockUi.msg = { text: (C.lock || {}).offDone }; announce(lockUi.msg.text); render(); return; }
var lbox = document.getElementById('link-box');
if (act === 'link-change' && lbox) { lbox.innerHTML = linkFormHtml('', true); var li = lbox.querySelector('input'); if (li) li.focus(); return; }
if (act === 'link-cancel') { if (lbox) lbox.innerHTML = ''; else render(); return; }
var cbox = document.getElementById('link-clear-box');
if (act === 'link-clear' && cbox) {
cbox.innerHTML = '<p class="confirm-q" role="alert">' + U.esc(C.graph.linkClearQ) + '</p><div class="row-actions"><button type="button" class="btn danger" data-action="link-clear-yes">' + U.esc(C.graph.linkClearYes) + '</button> <button type="button" class="btn ghost" data-action="link-clear-no">' + U.esc(C.graph.cancel) + '</button></div>';
var cy = cbox.querySelector('[data-action="link-clear-yes"]'); if (cy) cy.focus();
return;
}
if (act === 'link-clear-yes' && a && a.clearShareLink) {
Promise.resolve(a.clearShareLink()).then(function () { announce(C.graph.linkCleared); history.replaceState(null, '', location.pathname + location.search + hashFor(V.home === 'overview' ? '/' : '/' + V.home, {})); load(); });
return;
}
if (act === 'link-clear-no') { if (cbox) cbox.innerHTML = ''; return; }
var box = document.getElementById('clear-box');
if (act === 'clear-cache' && box) {
box.innerHTML = '<p class="confirm-q" role="alert">이 기기에 저장된 장부 자료와 설정을 지울까요? 엑셀 파일과 Claude 자료함의 자료는 그대로예요.</p>' +
'<div class="row-actions"><button type="button" class="btn danger" data-action="clear-cache-yes">지우기</button> <button type="button" class="btn ghost" data-action="clear-cache-no">그만두기</button></div>';
var yes = box.querySelector('[data-action="clear-cache-yes"]'); if (yes) yes.focus();
return;
}
if (act === 'clear-cache-yes') {
if (a && a.clearCache) a.clearCache();
try { localStorage.removeItem('ledger.prefs'); } catch (x) { }
if (box) box.innerHTML = '<p class="muted" role="status">이 기기에 저장된 자료를 지웠어요.</p>';
announce('이 기기에 저장된 자료를 지웠어요.');
return;
}
if (act === 'clear-cache-no') { render(); return; }
}
function onChange(e) {
var t = e.target;
if (t.matches('[data-month],[data-year-select],[data-period]')) keepFrom(t);
if (t.matches('[data-month]')) setFilter({ m: Number(t.value) });
else if (t.matches('[data-year-select]')) setFilter({ y: Number(t.value) });
else if (t.matches('[data-period]')) { var p = t.value.split('-'); setFilter({ y: Number(p[0]), m: Number(p[1]) }); }
else if (t.matches('[data-pref][type="checkbox"]')) setPref(t.getAttribute('data-pref'), t.checked);
}
function boot() {
if (!document.documentElement.getAttribute('lang')) document.documentElement.setAttribute('lang', 'ko');
applyTheme();
document.addEventListener('click', onClick);
document.addEventListener('change', onChange);
document.addEventListener('submit', onSubmit);
window.addEventListener('hashchange', render);
try { st.adapter = pickAdapter(); } catch (e) { st.status = 'error'; st.error = e; render(); return; }
if (lockAvail()) L.lock.start(function (why) { if (why === 'support' && !(st.route && st.route.screen === 'link')) return; render(); });
load();
}
L.app = { state: st, view: VIEW, render: render, filters: filters, link: link, setFilter: setFilter, setParam: setParam, announce: announce, reload: load, keep: keepFrom,
resolve: function (expr) {
if (!st.snap) return null;
if (String(expr).indexOf('calc:') === 0) { var p = String(expr).slice(5).split(':'), fn = L.model.calc[p[0]]; return fn ? fn.apply(null, [st.snap].concat(p.slice(1))) : null; }
return S.evaluate(st.snap, expr);
} };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
