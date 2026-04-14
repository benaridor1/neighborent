import { Suspense } from "react";
import { CheckoutPage } from "../../sections/checkout/checkout-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-zinc-50 px-4 py-16 text-center text-sm text-zinc-500">…</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
