import { DocumentPage } from '@/features/documents/DocumentPage';

interface Props {
  params: Promise<{ documentId: string }>;
}

export default async function Page({ params }: Props) {
  const { documentId } = await params;
  return <DocumentPage documentId={documentId} />;
}
