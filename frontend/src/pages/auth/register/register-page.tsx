"use client";

import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COUNTRY_PHONE_OPTIONS } from "../../../lib/country-phone-options";
import { useRouter } from "next/navigation";
import { AccountType, markUserAuthenticated, saveUserProfile } from "../../../lib/auth-session";
import { useLocale } from "../../../lib/locale-context";

type RegisterStep = "form" | "otp";

export function RegisterPage() {
  const router = useRouter();
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [step, setStep] = useState<RegisterStep>("form");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("private");
  const [companyBrandName, setCompanyBrandName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyContactName, setCompanyContactName] = useState("");
  const [companyIdentifier, setCompanyIdentifier] = useState("");
  const [companyBusinessType, setCompanyBusinessType] = useState("events");
  const [selectedCountryIso, setSelectedCountryIso] = useState("IL");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [hasAutoVerified, setHasAutoVerified] = useState(false);
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const verifyButtonRef = useRef<HTMLButtonElement | null>(null);
  const normalizedEmail = email.trim().toLowerCase();

  const selectedCountry = COUNTRY_PHONE_OPTIONS.find((option) => option.iso === selectedCountryIso) ?? COUNTRY_PHONE_OPTIONS[0];

  const onPhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, selectedCountry.maxLength);
    setPhone(digitsOnly);
  };

  const onSubmitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveUserProfile({
      userId: `usr-${Date.now()}`,
      role: "user",
      verificationStatus: "pending",
      accountType,
      firstName,
      lastName,
      phone: `${selectedCountry.dialCode}${phone}`,
      email,
      companyBrandName: accountType === "rental_company" ? companyBrandName : undefined,
      companyAddress: accountType === "rental_company" ? companyAddress : undefined,
      companyContactName: accountType === "rental_company" ? companyContactName : undefined,
      companyBusinessType: accountType === "rental_company" ? (companyBusinessType as "events" | "construction" | "photo_video" | "sound_lighting" | "furniture" | "other") : undefined,
    });
    setStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setHasAutoVerified(false);
  };

  const onVerifyOtp = () => {
    setHasAutoVerified(true);
    markUserAuthenticated();
    router.push("/");
  };

  const verificationHint =
    language === "he"
      ? `הכנס את הקוד שנשלח לכתובת ${normalizedEmail || "המייל שלך"}`
      : `Enter the code sent to ${normalizedEmail || "your email"}`;

  useEffect(() => {
    if (step === "otp") {
      otpInputsRef.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    const isComplete = otpDigits.every((digit) => digit.length === 1);
    if (isComplete && !hasAutoVerified) {
      verifyButtonRef.current?.click();
    }
  }, [hasAutoVerified, otpDigits, step]);

  const handleOtpChange = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = nextDigit;
    setOtpDigits(nextDigits);
    setHasAutoVerified(false);

    if (nextDigit && index < nextDigits.length - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpDigits.length);
    if (!pastedDigits) {
      return;
    }

    event.preventDefault();
    const nextDigits = [...otpDigits];
    for (let i = 0; i < pastedDigits.length; i += 1) {
      nextDigits[i] = pastedDigits[i];
    }
    setOtpDigits(nextDigits);
    setHasAutoVerified(false);
    const nextFocusIndex = Math.min(pastedDigits.length, otpDigits.length - 1);
    otpInputsRef.current[nextFocusIndex]?.focus();
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-10">
        <div className={`w-full max-w-sm ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
          {step === "form" ? (
            <>
              <div className="mb-5 inline-flex w-full rounded-full border border-zinc-200 bg-white p-1 text-sm font-semibold">
                <Link href="/login" className="flex-1 rounded-full py-1.5 text-center text-zinc-500">
                  {t("menuLogin")}
                </Link>
                <button type="button" className="flex-1 rounded-full bg-emerald-950 py-1.5 text-white">
                  {t("menuRegister")}
                </button>
              </div>

              <h1 className="text-3xl font-black text-zinc-900">{t("authJoin")}</h1>
              <p className="mt-1 text-sm text-zinc-500">{t("authJoinDetails")}</p>

              <form className="mt-6 space-y-3" onSubmit={onSubmitRegister}>
                <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <legend className="mb-1 block text-xs text-zinc-500">סוג חשבון</legend>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      accountType === "private" ? "border-emerald-900 bg-emerald-50 text-emerald-950" : "border-zinc-200 text-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="private"
                      checked={accountType === "private"}
                      onChange={() => setAccountType("private")}
                    />
                    משתמש פרטי
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      accountType === "rental_company" ? "border-emerald-900 bg-emerald-50 text-emerald-950" : "border-zinc-200 text-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="rental_company"
                      checked={accountType === "rental_company"}
                      onChange={() => setAccountType("rental_company")}
                    />
                    חברת השכרה
                  </label>
                </fieldset>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">{t("authFirstName")}</span>
                    <input
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">{t("authLastName")}</span>
                    <input
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                </div>

                {accountType === "rental_company" ? (
                  <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
                    <p className="text-xs font-semibold text-emerald-950">פרטי חברת השכרה</p>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">שם המותג</span>
                      <input
                        required
                        value={companyBrandName}
                        onChange={(event) => setCompanyBrandName(event.target.value)}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">תחום חברת ההשכרה</span>
                      <select
                        required
                        value={companyBusinessType}
                        onChange={(event) => setCompanyBusinessType(event.target.value)}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      >
                        <option value="events">אירועים והפקות</option>
                        <option value="furniture">ריהוט והשכרת ציוד ישיבה</option>
                        <option value="sound_lighting">סאונד ותאורה</option>
                        <option value="photo_video">צילום ווידאו</option>
                        <option value="construction">בנייה ועבודות שטח</option>
                        <option value="other">אחר</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">כתובת מדויקת</span>
                      <input
                        required
                        value={companyAddress}
                        onChange={(event) => setCompanyAddress(event.target.value)}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">איש קשר</span>
                      <input
                        required
                        value={companyContactName}
                        onChange={(event) => setCompanyContactName(event.target.value)}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      />
                    </label>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">{t("authPhone")}</span>
                  <div className="grid grid-cols-[minmax(130px,42%)_1fr] gap-2" dir="ltr">
                    <select
                      value={selectedCountryIso}
                      onChange={(event) => {
                        const nextIso = event.target.value;
                        const nextCountry = COUNTRY_PHONE_OPTIONS.find((option) => option.iso === nextIso);
                        setSelectedCountryIso(nextIso);
                        setPhone((prev) => prev.slice(0, nextCountry?.maxLength ?? prev.length));
                      }}
                      className="h-10 rounded-xl border border-zinc-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    >
                      {COUNTRY_PHONE_OPTIONS.map((country) => (
                        <option key={country.iso} value={country.iso}>
                          {country.name} ({country.dialCode})
                        </option>
                      ))}
                    </select>

                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={selectedCountry.maxLength}
                      minLength={6}
                      pattern="^[0-9]{6,15}$"
                      title="יש להזין מספר טלפון תקין עם ספרות בלבד"
                      value={phone}
                      onChange={(event) => onPhoneChange(event.target.value)}
                      placeholder={selectedCountry.placeholder}
                      className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">{t("authEmail")}</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </label>

                {accountType === "private" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">{t("authIdFront")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-xs text-zinc-500 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2 file:py-1"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">{t("authIdBack")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-xs text-zinc-500 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2 file:py-1"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
                    <p className="text-xs font-semibold text-emerald-950">אימות חברת השכרה</p>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">מזהה חברה (ח.פ / עוסק מורשה)</span>
                      <input
                        required
                        value={companyIdentifier}
                        onChange={(event) => setCompanyIdentifier(event.target.value)}
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                        placeholder="לדוגמה: 512345678"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-500">מסמך אימות חברה (צילום תעודה/אישור)</span>
                      <input
                        required
                        type="file"
                        accept="image/*,.pdf"
                        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-xs text-zinc-500 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:px-2 file:py-1"
                      />
                    </label>
                  </div>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">{t("authPassword")}</span>
                  <input required type="password" className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                </label>

                <button type="submit" className="h-11 w-full rounded-xl bg-emerald-950 text-sm font-semibold text-white">
                  {t("authCreateAccount")}
                </button>
              </form>

              <p className="mt-2 text-center text-sm text-zinc-600">
                {t("authHasAccount")}{" "}
                <Link href="/login" className="font-semibold text-zinc-900">
                  {t("login")}
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-zinc-900">{t("authPhoneVerification")}</h1>
              <p className="mt-1 text-sm text-zinc-500">{verificationHint}</p>

              <div className="mt-6 grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    ref={(element) => {
                      otpInputsRef.current[i] = element;
                    }}
                    maxLength={1}
                    inputMode="numeric"
                    value={otpDigits[i]}
                    onChange={(event) => handleOtpChange(i, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(i, event)}
                    onPaste={handleOtpPaste}
                    className="h-12 rounded-xl border border-zinc-200 text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                ))}
              </div>

              <button
                ref={verifyButtonRef}
                type="button"
                onClick={onVerifyOtp}
                className="mt-4 h-11 w-full rounded-xl bg-emerald-950 text-sm font-semibold text-white"
              >
                {t("authVerifyAndEnter")}
              </button>

              <div className="mt-2 text-center text-sm">
                <Link href="#" className="text-zinc-600 hover:text-zinc-900">
                  {t("authResendCode")}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="hidden bg-[linear-gradient(180deg,#f8f5ee_0%,#f6f2e8_100%)] px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="text-right">
          <Link href="/" className="text-3xl font-black text-zinc-900">
            neighborent
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

export default function RegisterTemplatePage() {
  return null;
}
