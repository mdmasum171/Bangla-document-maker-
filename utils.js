import { DOC_TYPES } from './templates.js';

export const todayISO = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// "2026-10-26" -> "২৬ অক্টোবর ২০২৬"
export const toBnDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  try {
    return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(y, m - 1, d)
    );
  } catch {
    return iso;
  }
};

// Make sure the Bengali font files are really downloaded before printing.
export async function waitForFonts() {
  if (!document.fonts) return;
  const sample = 'সাধারণ ডায়েরির আবেদন পাসপোর্ট Abc 123';
  try {
    await Promise.all([
      document.fonts.load('400 16px "Noto Serif Bengali"', sample),
      document.fonts.load('700 16px "Noto Serif Bengali"', sample),
      document.fonts.load('400 16px "Noto Sans Bengali"', sample),
    ]);
    await document.fonts.ready;
  } catch {
    /* printing still works with fallback fonts */
  }
}

export function validate(f) {
  const e = {};
  if (!f.subject.trim()) e.subject = 'বিষয় লিখুন।';
  if (!f.name.trim()) e.name = 'আবেদনকারীর নাম লিখুন।';
  if (f.phone.trim() && !/^[+০-৯0-9\s\-()]{6,20}$/.test(f.phone.trim()))
    e.phone = 'সঠিক ফোন নম্বর দিন (শুধু সংখ্যা, + ও -)।';
  if (!f.body.trim()) e.body = 'আবেদনের মূল অংশ লিখুন।';
  return e;
}

export const hasPlaceholders = (f) =>
  /\[[^\]]+\]/.test([f.recipient, f.office, f.subject, f.body].join('\n'));

export function buildPlainText(f) {
  const t = DOC_TYPES[f.type];
  const L = [];
  if (f.date) L.push(`তারিখ: ${toBnDate(f.date)}`, '');
  L.push('বরাবর,');
  if (f.recipient.trim()) L.push(f.recipient.trim());
  if (f.office.trim()) L.push(f.office.trim());
  L.push('');
  if (f.subject.trim()) L.push(`বিষয়: ${f.subject.trim()}`, '');
  if (t.salutation) L.push(t.salutation, '');
  if (f.body.trim()) L.push(f.body.trim(), '');
  if (t.closing) L.push(t.closing);
  L.push('', '', 'স্বাক্ষর', f.name.trim());
  if (f.father.trim()) L.push(`পিতা: ${f.father.trim()}`);
  if (f.mother.trim()) L.push(`মাতা: ${f.mother.trim()}`);
  if (f.address.trim()) L.push(`ঠিকানা: ${f.address.trim()}`);
  if (f.phone.trim()) L.push(`মোবাইল: ${f.phone.trim()}`);
  if (f.showDraft) L.push('', '(এটি একটি আবেদনের খসড়া; কোনো সরকারি রেকর্ড বা অনুমোদন নয়।)');
  return L.join('\n');
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy method */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
