import { useEffect, useRef, useState } from 'react';
import { DOC_TYPES } from './templates.js';
import { toBnDate } from './utils.js';

const PAPER_PX = 794; // 210mm at 96dpi

export default function DocumentPreview({ form }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [height, setHeight] = useState(1123);

  // Scale the A4 sheet down to fit narrow phone screens; measure real height for multi-page docs.
  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner || !window.ResizeObserver) return undefined;
    const ro = new ResizeObserver(() => {
      setFit(Math.max(0.2, Math.min(1, wrap.clientWidth / PAPER_PX)));
      setHeight(inner.offsetHeight);
    });
    ro.observe(wrap);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const scale = fit * zoom;
  const t = DOC_TYPES[form.type];
  const paragraphs = form.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const details = [
    ['পিতা', form.father],
    ['মাতা', form.mother],
    ['ঠিকানা', form.address],
    ['মোবাইল', form.phone],
  ].filter(([, v]) => v.trim());
  const empty = !form.subject.trim() && !form.body.trim() && !form.name.trim();

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">A4 প্রিভিউ</h2>
        <div className="flex items-center gap-2" role="group" aria-label="প্রিভিউ জুম">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
            className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-xl font-bold"
            aria-label="জুম কমান"
          >
            −
          </button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
            className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-xl font-bold"
            aria-label="জুম বাড়ান"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold"
          >
            প্রিভিউ রিসেট
          </button>
        </div>
      </div>

      <div ref={wrapRef} className="preview-wrap overflow-x-auto pb-2">
        <div className="preview-outer mx-auto" style={{ width: PAPER_PX * scale, height: height * scale }}>
          <div
            ref={innerRef}
            className="paper-scaler"
            style={{ width: PAPER_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <article className="paper" lang="bn" aria-label="A4 ডকুমেন্ট প্রিভিউ">
              <div className="paper-guides no-print" aria-hidden="true" />

              {empty && (
                <p className="no-print text-center text-slate-400">ফর্মে লিখলে এখানে ডকুমেন্ট দেখা যাবে।</p>
              )}

              {form.date && <p className="mb-4">তারিখ: {toBnDate(form.date)}</p>}

              <div className="mb-4">
                <p>বরাবর,</p>
                {form.recipient.trim() && <p className="whitespace-pre-wrap font-bold">{form.recipient}</p>}
                {form.office.trim() && <p className="whitespace-pre-wrap">{form.office}</p>}
              </div>

              {form.subject.trim() && (
                <p className="mb-4 font-bold">
                  <span>বিষয়: </span>
                  <span className="underline decoration-1 underline-offset-4">{form.subject}</span>
                </p>
              )}

              {t.salutation && <p className="mb-2">{t.salutation}</p>}

              {paragraphs.map((p, i) => (
                <p key={i} className="mb-3 whitespace-pre-wrap">
                  {p}
                </p>
              ))}

              <div className="keep-together mt-6">
                {t.closing && <p>{t.closing}</p>}
                <div className="mt-14 w-56 border-t border-slate-700 pt-1">
                  <p className="text-sm">স্বাক্ষর</p>
                </div>
                {form.name.trim() && <p className="mt-1 font-bold">{form.name}</p>}
                {details.map(([label, value]) => (
                  <p key={label} className="whitespace-pre-wrap text-[11.5pt] leading-[1.7]">
                    {label}: {value}
                  </p>
                ))}
              </div>

              {form.showDraft && (
                <p className="keep-together mt-8 border-t border-slate-300 pt-2 text-[9pt] leading-snug text-slate-500">
                  এটি একটি আবেদনের খসড়া। এটি কোনো সরকারি রেকর্ড, জিডি নম্বর, সিল বা অনুমোদন নয়।
                </p>
              )}
            </article>
          </div>
        </div>
      </div>
      <p className="no-print mt-2 text-center text-xs text-slate-500">
        লাল রেখা আনুমানিক পাতার শেষ বোঝায়। চূড়ান্ত পাতা ভাগ প্রিন্ট ডায়ালগের প্রিভিউতে মিলিয়ে নিন।
      </p>
    </div>
  );
}
