import { redirect } from 'next/navigation';

export default function RemovedTasksPage() {
  // Step 5 decision: Needs-You is the single actionable operator queue.
  // The old localStorage Tasks page was removed from navigation to avoid a zero-count widget farm.
  redirect('/mission-control');
}
