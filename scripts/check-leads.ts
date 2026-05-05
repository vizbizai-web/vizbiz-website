import { getAllLeads } from '../src/lib/google-sheets';

async function main() {
  const leads = await getAllLeads();
  console.log(`Total leads: ${leads.length}\n`);
  
  for (const lead of leads) {
    console.log(`--- ${lead.leadId} ---`);
    console.log(`  Name: ${lead.dealershipName}`);
    console.log(`  City: ${lead.city}`);
    console.log(`  Competitor: ${lead.competitor}`);
    console.log(`  Status: ${lead.status} | Research: ${lead.researchStatus}`);
    console.log(`  Snapshot: ${lead.snapshotAppeared} | Band: ${lead.visibilityBand}`);
    if (lead.notes?.includes('RESEARCH_DATA:')) {
      try {
        const jsonStr = lead.notes.slice(lead.notes.indexOf('RESEARCH_DATA:') + 14);
        const data = JSON.parse(jsonStr);
        console.log(`  >> AVI: ${data.aviScore}, Appeared: ${data.appearedCount}/${data.totalPrompts}`);
        console.log(`  >> CompetitorMention: ${data.competitorMention}`);
        console.log(`  >> Niche: ${data.niche}`);
        console.log(`  >> Competitors: ${data.competitors?.join(', ') || 'none'}`);
      } catch(e: any) {
        console.log(`  >> PARSE ERROR: ${e.message}`);
      }
    }
  }
}

main().catch(console.error);
