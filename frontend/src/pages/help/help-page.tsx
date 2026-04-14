"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useLocale } from "../../lib/locale-context";
import { activateSupportChat } from "../../lib/messages.mock";

export function HelpPage() {
  const { language, t } = useLocale();
  const router = useRouter();
  const isRtl = language === "he" || language === "ar";

  const openSupportChat = () => {
    activateSupportChat();
    router.push("/messages/support");
  };

  const faqs = [
    { q: "helpFaq1Q", a: "helpFaq1A" },
    { q: "helpFaq2Q", a: "helpFaq2A" },
    { q: "helpFaq3Q", a: "helpFaq3A" },
  ] as const;

  return (
    <main className="min-h-[calc(100vh-70px)] bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 lg:px-10">
        <header className="w-full">
          <Link
            href="/"
            className={`inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`}
          >
            <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
            {t("backToHome")}
          </Link>
          <h1 className={`mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl ${isRtl ? "text-right" : "text-left"}`}>
            {t("helpPageTitle")}
          </h1>
          <p className={`mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base ${isRtl ? "ms-auto text-right" : "me-auto text-left"}`}>
            {t("helpIntro")}
          </p>
        </header>

        <section className="w-full space-y-3">
          <h2 className={`text-lg font-bold text-zinc-900 ${isRtl ? "text-right" : "text-left"}`}>{t("helpFaqTitle")}</h2>
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {faqs.map((item) => (
              <li key={item.q} className={`px-5 py-4 md:px-6 ${isRtl ? "text-right" : "text-left"}`}>
                <p className="font-semibold text-zinc-900">{t(item.q)}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t(item.a)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 ${isRtl ? "text-right" : "text-left"}`}
        >
          <h2 className="text-lg font-bold text-zinc-900">{t("helpNeedMoreTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">{t("helpNeedMoreBody")}</p>
          <Button
            type="button"
            onClick={openSupportChat}
            className="mt-5 rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            {t("helpChatWithAgent")}
          </Button>
        </section>
      </div>
    </main>
  );
}

export default function HelpTemplatePage() {
  return null;
}
