import { DOC_TYPES, TYPE_ORDER } from './templates.js';

function Field({ name, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`field-${name}-err`} role="alert" className="mt-1 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const base =
  'w-full rounded-xl border bg-white px-3 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function DocumentForm({ form, errors, onChange, onTypeChange }) {
  const bind = (key) => ({
    id: `field-${key}`,
    value: form[key],
    onChange: (e) => onChange(key, e.target.value),
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `field-${key}-err` : undefined,
    className: `${base} ${errors[key] ? 'border-red-500' : 'border-slate-300'}`,
  });

  return (
    <form className="space-y-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200" onSubmit={(e) => e.preventDefault()} noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-800">ডকুমেন্টের ধরন</legend>
        <div className="grid grid-cols-2 gap-2" role="group">
          {TYPE_ORDER.map((key) => {
            const active = form.type === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(key)}
                className={`min-h-12 rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {DOC_TYPES[key].label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ধরন বদলালে শুধু ফাঁকা বা অপরিবর্তিত ঘরগুলোতে নতুন নমুনা বসে। [ ] এর ভেতরের অংশ নিজের তথ্য দিয়ে বদলে নিন।
        </p>
      </fieldset>

      <Field name="date" label="তারিখ">
        <input type="date" {...bind('date')} />
      </Field>

      <Field name="recipient" label="প্রাপক / বরাবর">
        <input type="text" placeholder="যেমন: অফিসার ইনচার্জ" {...bind('recipient')} />
      </Field>

      <Field name="office" label="অফিস বা থানার নাম">
        <input type="text" placeholder="যেমন: ধানমন্ডি থানা, ঢাকা" {...bind('office')} />
      </Field>

      <Field name="subject" label="বিষয়" required error={errors.subject}>
        <input type="text" placeholder="আবেদনের বিষয়" {...bind('subject')} />
      </Field>

      <Field name="name" label="আবেদনকারীর নাম" required error={errors.name}>
        <input type="text" autoComplete="off" {...bind('name')} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field name="father" label="পিতার নাম">
          <input type="text" autoComplete="off" {...bind('father')} />
        </Field>
        <Field name="mother" label="মাতার নাম">
          <input type="text" autoComplete="off" {...bind('mother')} />
        </Field>
      </div>

      <Field name="address" label="ঠিকানা">
        <textarea rows={2} autoComplete="off" {...bind('address')} />
      </Field>

      <Field name="phone" label="ফোন নম্বর" error={errors.phone}>
        <input type="tel" inputMode="tel" autoComplete="off" placeholder="০১XXXXXXXXX" {...bind('phone')} />
      </Field>

      <Field
        name="body"
        label="আবেদনের মূল অংশ"
        required
        error={errors.body}
        hint="নতুন অনুচ্ছেদের জন্য একটি ফাঁকা লাইন রাখুন।"
      >
        <textarea rows={12} className="min-h-[14rem]" {...bind('body')} />
      </Field>

      <label className="flex min-h-12 items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
        <input
          type="checkbox"
          checked={form.showDraft}
          onChange={(e) => onChange('showDraft', e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-indigo-600"
        />
        <span>
          নিচে “খসড়া আবেদন” নোট দেখান
          <span className="block text-xs text-slate-500">
            এই সাইট শুধু আবেদনের খসড়া বানায়। কোনো সরকারি রেকর্ড, জিডি নম্বর, সিল বা অনুমোদন তৈরি করে না।
          </span>
        </span>
      </label>
    </form>
  );
}
