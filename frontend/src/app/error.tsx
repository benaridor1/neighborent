"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-black text-zinc-900">משהו השתבש</h1>
      <p className="text-sm text-zinc-600">
        לעיתים זה קורה בגלל תיקיית <code className="rounded bg-zinc-100 px-1">.next</code> ישנה או פגומה. עצרו את שרת הפיתוח, מחקו את התיקייה <code className="rounded bg-zinc-100 px-1">.next</code>, והריצו שוב{" "}
        <code className="rounded bg-zinc-100 px-1">npm run dev</code>.
      </p>
      {error.digest ? <p className="text-xs text-zinc-400">מזהה: {error.digest}</p> : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
      >
        נסו שוב
      </button>
    </div>
  );
}
