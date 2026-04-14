"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "../../../lib/locale-context";
import {
  getThreadBubbles,
  getThreadPreview,
  isSupportChatActive,
  SUPPORT_THREAD_ID,
} from "../../../lib/messages.mock";

interface MessagesThreadClientProps {
  threadId: string;
}

function participantLabel(thread: { participantName: string; participantNameKey?: string }, translate: (key: string) => string) {
  return thread.participantNameKey ? translate(thread.participantNameKey) : thread.participantName;
}

export function MessagesThreadClient({ threadId }: MessagesThreadClientProps) {
  const { language, t } = useLocale();
  const thread = getThreadPreview(threadId);
  const isSupport = threadId === SUPPORT_THREAD_ID;
  const isRtl = language === "he" || language === "ar";

  const [supportUnlocked, setSupportUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupport) return;
    setSupportUnlocked(isSupportChatActive());
  }, [isSupport, threadId]);

  if (!thread) {
    return (
      <main className="min-h-[calc(100vh-70px)] bg-white px-4 py-10 md:px-8 lg:px-10" dir={isRtl ? "rtl" : "ltr"}>
        <p className="text-center text-sm text-zinc-600">{t("messagesThreadNotFound")}</p>
        <Link href="/messages" className="mt-4 block text-center text-sm font-semibold text-emerald-900 hover:underline">
          {t("messagesBackToList")}
        </Link>
      </main>
    );
  }

  if (isSupport && supportUnlocked === null) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 md:px-8 lg:px-10">
          <p className="text-sm text-zinc-500">{t("messagesSupportLoading")}</p>
        </div>
      </main>
    );
  }

  if (isSupport && supportUnlocked === false) {
    return (
      <main className="min-h-[calc(100vh-70px)] bg-white px-4 py-10 md:px-8 lg:px-10" dir={isRtl ? "rtl" : "ltr"}>
        <div className={`mx-auto max-w-lg space-y-4 ${isRtl ? "text-right" : "text-left"}`}>
          <Link
            href="/messages"
            className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("messagesBackToList")}
          </Link>
          <h1 className="text-2xl font-black text-zinc-900">{t("messagesSupportThreadLockedTitle")}</h1>
          <p className="text-sm leading-relaxed text-zinc-600">{t("messagesSupportThreadLockedBody")}</p>
          <Link
            href="/help"
            className="inline-flex rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            {t("messagesSupportThreadLockedCta")}
          </Link>
        </div>
      </main>
    );
  }

  const bubbles = getThreadBubbles(threadId);
  const threadHint = isSupport ? t("messagesThreadHintSupport") : t("messagesThreadHint");

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <header className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:gap-4 md:px-8 lg:px-10">
          <Link
            href="/messages"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 p-2.5 text-zinc-700 transition hover:bg-zinc-50"
            aria-label={t("messagesBackToList")}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          </Link>
          <div className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
            <p className="truncate text-lg font-bold text-zinc-900">{participantLabel(thread, t)}</p>
            <p className="truncate text-sm text-zinc-500">{t(thread.productLineKey)}</p>
          </div>
          <span
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm md:h-12 md:w-12 ${thread.avatarBg}`}
          >
            {thread.initial}
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 md:px-8 lg:px-10">
        <p className={`mb-5 text-xs text-zinc-500 md:text-sm ${isRtl ? "text-right" : "text-left"}`}>{threadHint}</p>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-28 md:gap-4 md:pb-32">
          {bubbles.map((bubble) => {
            const mine = bubble.from === "me";
            const timeLabel = bubble.timeKey ? t(bubble.timeKey) : bubble.time ?? "";
            return (
              <div key={bubble.id} className={`flex ${mine ? (isRtl ? "justify-start" : "justify-end") : isRtl ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm md:text-base ${
                    mine ? "rounded-br-md bg-emerald-950 text-white" : "rounded-bl-md border border-zinc-200 bg-zinc-50 text-zinc-800"
                  }`}
                >
                  <p>{t(bubble.bodyKey)}</p>
                  <p className={`mt-1.5 text-[11px] md:text-xs ${mine ? "text-emerald-200/90" : "text-zinc-400"}`}>{timeLabel}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md md:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl gap-3">
            <input
              type="text"
              readOnly
              placeholder={t("messagesInputPlaceholder")}
              className="min-h-[48px] flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-500 outline-none md:text-base"
              aria-label={t("messagesInputPlaceholder")}
            />
            <button
              type="button"
              disabled
              className="min-h-[48px] shrink-0 rounded-2xl bg-emerald-950 px-5 text-sm font-semibold text-white opacity-60 md:px-6"
            >
              {t("messagesSend")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
