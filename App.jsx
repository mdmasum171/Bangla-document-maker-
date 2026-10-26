import { useCallback, useEffect, useState } from 'react';
import DocumentForm from './DocumentForm.jsx';
import DocumentPreview from './DocumentPreview.jsx';
import { DOC_TYPES } from './templates.js';
import { buildPlainText, copyText, hasPlaceholders, todayISO, validate, waitForFonts } from './utils.js';

const initialForm = () => {
  const t = DOC_TYPES.general;
  return {
    type: 'general',
    recipient: t.recipient,
    office: t.office,
    subject: t.subject,
    name: '',
    father: '',
    mother: '',
    address: '',
    phone: '',
    date: todayISO(),
    body: t.body,
    showDraft: true,
  };
};

const blankForm = (type) => ({
  type,
  recipient: '',
  office: '',
  subject: '',
  name: '',
  father: '',
  mother: '',
  address: '',
  phone: '',
  date: todayISO(),
  body: '',
  showDraft: true,
});

export default function App() {
  // Everything lives in memory only. Nothing is saved to localStorage or sent anywhere.
  const [form, setForm] = useState(initialForm);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState('');

  const errors = showErrors ? validate(form) : {};

  useEffect(() => {
    if (!status) return undefined;
    const id = setTimeout(() => setStatus(''), 4500);
    return () => clearTimeout(id);
  }, [status]);

  useEffect(() => {
    waitForFonts(); // warm up fonts early
  }, []);

  const update = useCallback((key, value) => setForm((f) => ({ ...f, [key]: value })), []);

  const changeType = useCallback((type) => {
    setForm((f) => {
      const oldT = DOC_TYPES[f.type];
      const newT = DOC_TYPES[type];
      const next = { ...f, type };
      ['recipient', 'office', 'subject', 'body'].forEach((k) => {
        if (f[k] === '' || f[k] === oldT[k]) next[k] = newT[k];
      });
      return next;
    });
  }, []);

  const handlePrint = async () => {
    const errs = validate(form);
    setShowErrors(true);
    const keys = Object.keys(errs);
    if (keys.length) {
      setStatus('প্রিন্টের আগে লাল চিহ্নিত ঘরগুলো ঠিক করুন।');
      document.getElementById(`field-${keys[0]}`)?.focus();
      return;
    }
    if (hasPlaceholders(form) && !window.confirm('এখনও [ ] চিহ্নিত ফাঁকা অংশ আছে। তবুও প্রিন্ট করবেন?')) return;

    setStatus('ফন্ট প্রস্তুত করা হচ্ছে…');
    await waitForFonts();
    const prevTitle = document.title;
    document.title = form.subject.trim().slice(0, 60) || 'আবেদন'; // becomes the default PDF file name
    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setStatus('');
    window.print();
  };

  const handleCopy = async () => {
    const ok = await copyText(buildPlainText(form));
    setStatus(ok ? 'ডকুমেন্টের লেখা কপি হয়েছে।' : 'কপি করা যায়নি। ব্রাউজারের অনুমতি দেখুন।');
  };

  const handleClear = () => {
    if (!window.confirm('ফর্মের সব লেখা মুছে ফেলবেন? এটি ফেরানো যাবে না।')) return;
    setForm((f) => blankForm(f.type));
    setShowErrors(false);
    setStatus('ফর্ম পরিষ্কার করা হয়েছে।');
  };

  return (
    <div className="min-h-screen pb-32">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold text-indigo-700 sm:text-2xl">বাংলা ডকুমেন্ট মেকার</h1>
          <p className="mt-1 text-sm text-slate-600">
            আবেদনের খসড়া লিখুন, A4 প্রিভিউ দেখুন, তারপর প্রিন্ট করুন বা PDF হিসেবে সেভ করুন।
          </p>
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            গোপনীয়তা: ডকুমেন্ট শুধু আপনার ব্রাউজারেই তৈরি হয়। কোনো সার্ভারে পাঠানো বা কোথাও সংরক্ষণ করা হয় না। পেজ রিফ্রেশ করলে লেখা মুছে যাবে।
          </p>
        </div>
      </header>

      <main className="app-main mx-auto grid max-w-7xl gap-6 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
        <section className="no-print" aria-label="ফর্ম">
          <DocumentForm form={form} errors={errors} onChange={update} onTypeChange={changeType} />
        </section>
        <section className="preview-section" aria-label="প্রিভিউ">
          <DocumentPreview form={form} />
        </section>
      </main>

      <div className="no-print fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4">
          <p role="status" aria-live="polite" className="min-h-5 pb-1 text-center text-sm font-medium text-indigo-700">
            {status}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-12 rounded-xl bg-indigo-600 px-2 text-base font-bold text-white active:bg-indigo-800"
            >
              প্রিন্ট / PDF
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-2 text-base font-semibold text-slate-800 active:bg-slate-100"
            >
              লেখা কপি
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="min-h-12 rounded-xl border border-red-300 bg-white px-2 text-base font-semibold text-red-700 active:bg-red-50"
            >
              ফর্ম মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
