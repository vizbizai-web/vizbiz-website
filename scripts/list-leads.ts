import { getLeadsByStatus } from '../src/lib/google-sheets';

async function main() {
  const statuses = ['new', 'researching', 'research_complete', 'email_drafted', 'email_sent', 'contacted', 'responded', 'closed_won', 'closed_lost'];
  for (const s of statuses) {
    try {
      const leads = await getLeadsByStatus(s as any);
      for (const l of leads) {
        console.log(s, '|', l.leadId, '|', l.dealershipName, '|', l.city, '|', l.email);
      }
    } catch(e) {}
  }
}
main().catch(e => console.error(e));
