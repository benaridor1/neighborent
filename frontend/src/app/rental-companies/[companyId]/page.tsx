import { RentalCompanyPage } from "../../../pages/rental-company/rental-company-page";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ expand?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sp = await searchParams;
  const expandSectionId = typeof sp.expand === "string" && sp.expand.length > 0 ? sp.expand : null;
  return <RentalCompanyPage companyId={companyId} expandSectionId={expandSectionId} />;
}
