import { Suspense } from "react";
import { MyProductsPage } from "../../pages/my-products/my-products-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-zinc-50 px-4 py-16 text-center text-sm text-zinc-500">…</div>}>
      <MyProductsPage />
    </Suspense>
  );
}
