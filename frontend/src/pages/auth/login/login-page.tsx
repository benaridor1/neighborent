"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { markUserAuthenticated } from "../../../lib/auth-session";
import { useLocale } from "../../../lib/locale-context";

export function LoginPage() {
  const router = useRouter();
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";

  const onSubmitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markUserAuthenticated();
    router.push("/");
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-10">
        <div className={`w-full max-w-sm ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          <div className="mb-5 inline-flex w-full rounded-full border border-zinc-200 bg-white p-1 text-sm font-semibold">
            <button type="button" className="flex-1 rounded-full bg-emerald-950 py-1.5 text-white">
              {t("menuLogin")}
            </button>
            <Link href="/register" className="flex-1 rounded-full py-1.5 text-center text-zinc-500">
              {t("menuRegister")}
            </Link>
          </div>

          <h1 className="text-3xl font-black text-zinc-900">{t("authWelcome")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("authEnterDetails")}</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmitLogin}>
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">{t("authEmail")}</span>
              <input type="email" className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">{t("authPassword")}</span>
              <input type="password" className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
            </label>
            <button type="submit" className="h-11 w-full rounded-xl bg-emerald-950 text-sm font-semibold text-white">
              {t("authLoginAction")}
            </button>
          </form>

          <div className="mt-3 text-center text-sm">
            <Link href="#" className="text-zinc-600 hover:text-zinc-900">
              {t("authForgotPassword")}
            </Link>
          </div>

          <p className="mt-2 text-center text-sm text-zinc-600">
            {t("authNoAccount")}{" "}
            <Link href="/register" className="font-semibold text-zinc-900">
              {t("authFreeSignup")}
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-[linear-gradient(180deg,#f8f5ee_0%,#f6f2e8_100%)] px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="text-right">
          <Link href="/" className="text-3xl font-black text-zinc-900">
            RENTO
          </Link>
        </div>
        <div className={isRtl ? "text-right" : "text-left"} dir={isRtl ? "rtl" : "ltr"}>
          <h2 className="text-5xl font-black leading-tight text-zinc-900">
            השכר ציוד
            <br />
            בקלות ובטחון
            <br />
            מכל מקום
          </h2>
          <p className="mt-4 text-sm text-zinc-500">אלפי פריטים להשכרה • חיפוש מהיר • חוויית משתמש מתקדמת</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginTemplatePage() {
  return null;
}
