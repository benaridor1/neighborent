import { MessagesThreadClient } from "./messages-thread-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <MessagesThreadClient threadId={id} />;
}
