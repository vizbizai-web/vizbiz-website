import { getLeadByLeadId } from '../src/lib/google-sheets.js';
async function main() {
  const lead = await getLeadByLeadId('VZB-MP7T6G8I');
  if (!lead) { console.log('Not found'); return; }
  console.log('Name:', lead.dealershipName);
  console.log('Website:', lead.website);
  console.log('City:', lead.city);
  console.log('Status:', lead.status);
  console.log('Notes (first 3000):', lead.notes.substring(0, 3000));
}
main();
