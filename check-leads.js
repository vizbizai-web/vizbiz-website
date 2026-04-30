const fs = require('fs');
const crypto = require('crypto');

async function main() {
  const envRaw = fs.readFileSync('.env.local', 'utf-8');
  
  // Parse env vars properly
  const envVars = {};
  const lines = envRaw.split('\n');
  for (const line of lines) {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.substring(0, eqIdx).trim();
    let val = line.substring(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
  
  const sheetsId = envVars['GOOGLE_SHEETS_ID'];
  const saKeyRaw = envVars['GOOGLE_SERVICE_ACCOUNT_KEY'];
  
  if (!sheetsId || !saKeyRaw) {
    console.log('Missing config. SheetsId:', !!sheetsId, 'SAKey:', !!saKeyRaw);
    console.log('Available keys:', Object.keys(envVars).filter(k => k.includes('GOOGLE')).join(', '));
    return;
  }
  
  let sa;
  try {
    sa = JSON.parse(saKeyRaw);
  } catch(e) {
    console.log('Failed to parse SA key:', e.message);
    console.log('First 50 chars:', saKeyRaw.substring(0, 50));
    return;
  }
  
  const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT'})).toString('base64url');
  const now = Math.floor(Date.now()/1000);
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600
  })).toString('base64url');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + payload);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = header + '.' + payload + '.' + sig;
  
  console.log('Getting token from:', sa.token_uri);
  const tokenRes = await fetch(sa.token_uri, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const tokenText = await tokenRes.text();
  let tokenData;
  try { tokenData = JSON.parse(tokenText); } catch(e) { console.log('Token response not JSON:', tokenText.substring(0,200)); return; }
  if (!tokenData.access_token) {
    console.log('Token error:', JSON.stringify(tokenData).substring(0, 200));
    return;
  }
  
  const sheetsRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + sheetsId + '/values/Leads!A:Q', {
    headers: {'Authorization': 'Bearer ' + tokenData.access_token}
  });
  const sheetsData = await sheetsRes.json();
  
  if (!sheetsData.values) {
    console.log('No values:', JSON.stringify(sheetsData).substring(0, 200));
    return;
  }
  
  const rows = sheetsData.values;
  console.log('Total rows (incl header):', rows.length);
  console.log('');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    console.log('Row ' + i + ':');
    console.log('  Dealership:', row[1] || '(empty)');
    console.log('  Website:', row[2] || '(empty)');
    console.log('  City:', row[3] || '(empty)');
    console.log('  Contact:', row[4] || '(empty)');
    console.log('  Email:', row[5] || '(empty)');
    console.log('  Status (L):', row[11] || '(empty)');
    console.log('  Research (M):', row[12] || '(empty)');
    console.log('  Lead ID (Q):', row[16] || '(empty)');
    console.log('  Timestamp:', row[0] || '(empty)');
    console.log('---');
  }
}

main().catch(e => console.error(e));
