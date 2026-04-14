import { ProductDetailsPage } from "../../../pages/product-details/product-details-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailsPage productId={id} />;
}
