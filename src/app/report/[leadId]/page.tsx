import { ReportContent } from './report-content';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <ReportContent leadId={leadId} />;
}
