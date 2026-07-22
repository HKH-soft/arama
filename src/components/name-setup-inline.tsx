"use client";

import { useState, type FormEvent } from "react";

export function NameSetupInline() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitNameSetup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("نام باید دست‌کم دو حرف باشد.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "ذخیره نام انجام نشد.");
      }
      
      // Reload the page to reflect the new name in the dashboard
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره نام انجام نشد.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-card p-6 shadow-[var(--shadow-lift)] border border-line sm:p-8">
        <form onSubmit={(e) => void submitNameSetup(e)} className="flex flex-col gap-5">
          <div>
            <h3 className="text-xl font-extrabold text-ink">چطور صدات کنیم؟</h3>
            <p className="mt-2 text-sm leading-7 text-soft">
              برای اینکه تجربه صمیمی‌تری در آراما داشته باشیم، لطفاً پیش از ورود نام خود را وارد کن.
            </p>
          </div>

          <div>
            <label htmlFor="inline-name-setup" className="mb-2 block text-sm font-bold text-ink">
              نام شما
            </label>
            <input
              id="inline-name-setup"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: علی"
              autoComplete="name"
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
            />
            {error && (
              <p role="alert" className="animate-rise mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || name.trim().length < 2}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <span className="animate-breathe size-3 rounded-full bg-onbrand" />
                در حال ثبت…
              </>
            ) : (
              "شروع استفاده از آراما"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
