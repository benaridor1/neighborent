"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../lib/locale-context";
import {
  isSupportChatActive,
  messageThreads,
  supportThreadPreview,
  SUPPORT_THREAD_ID,
} from "../../lib/messages.mock";
import { DynamicBackLink } from "../../components/layout/dynamic-back-link";

function participantLabel(thread: { participantName: string; participantNameKey?: string }, translate: (key: string) => string) {
  return thread.participantNameKey ? translate(thread.participantNameKey) : thread.participantName;
}

export function MessagesPage() {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [query, setQuery] = useState("");
  const [supportActive, setSupportActive] = useState(false);

  useEffect(() => {
    const sync = () => setSupportActive(isSupportChatActive());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("rentup-support-chat", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rentup-support-chat", sync);
    };
  }, []);

  const allThreads = useMemo(() => {
    if (!supportActive) return messageThreads;
    const withoutDup = messageThreads.filter((thread) => thread.id !== SUPPORT_THREAD_ID);
    return [supportThreadPreview, ...withoutDup];
  }, [supportActive]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allThreads;
    return allThreads.filter((thread) => {
      const name = participantLabel(thread, t).toLowerCase();
      const preview = t(thread.previewKey).toLowerCase();
      const product = t(thread.productLineKey).toLowerCase();
      return name.includes(q) || preview.includes(q) || product.includes(q);
    });
  }, [query, t, allThreads]);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex w-full flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
        <header className="w-full">
          <DynamicBackLink className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`} />
          <h1 className={`mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl ${isRtl ? "text-right" : "text-left"}`}>
            {t("menuMessages")}
          </h1>
          <p className={`mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base ${isRtl ? "ms-auto text-right" : "me-auto text-left"}`}>
            {t("messagesIntro")}
          </p>
        </header>

        <div className="w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-4 md:p-5">
            <label
              className={`relative flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-300 focus-within:bg-white ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Search className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("messagesSearchPlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 md:text-base"
              />
            </label>
          </div>

          <ul className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <li className="px-6 py-14 text-center text-sm text-zinc-500 md:px-8">{t("messagesEmptyInbox")}</li>
            ) : (
              filtered.map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/messages/${thread.id}`}
                    className={`group flex gap-4 px-5 py-4 transition hover:bg-zinc-50 md:gap-5 md:px-6 md:py-5 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                  >
                    <div className="relative shrink-0">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-2 ring-white transition group-hover:ring-zinc-100 md:h-14 md:w-14 md:text-base ${thread.avatarBg}`}
                      >
                        {thread.initial}
                      </span>
                      {thread.unread ? (
                        <span className="absolute -start-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white shadow rtl:-start-auto rtl:-end-1">
                          {thread.unread > 9 ? "9+" : thread.unread}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${isRtl ? "flex-row-reverse justify-between" : "justify-between"}`}
                      >
                        <p className="min-w-0 truncate text-base font-semibold text-zinc-900 md:text-lg">{participantLabel(thread, t)}</p>
                        <div className={`flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 tabular-nums md:text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
                          {thread.readReceipt ? <span className="text-emerald-800/80" aria-hidden>✓✓</span> : null}
                          <span>
                            {thread.timeBadge === "yesterday" ? `${t("messagesYesterday")} · ${thread.time}` : thread.time}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-zinc-500 md:text-sm md:normal-case md:tracking-normal">
                        {t(thread.productLineKey)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 md:line-clamp-1 md:text-base lg:line-clamp-2">
                        {t(thread.previewKey)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function MessagesTemplatePage() {
  return null;
}
