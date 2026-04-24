import { Suspense } from "react";
import { AdminPage } from "../../pages/admin/admin-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminPage />
    </Suspense>
  );
}

