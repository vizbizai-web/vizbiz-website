import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load service account key
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const keyMatch = envContent.match(/GOOGLE_SERVICE_ACCOUNT_KEY="([\s\S]*?)"\n/);
if (!keyMatch) { console.error('No service account key found'); process.exit(1); }
const keyStr = keyMatch[1].replace(/\n/g, '\n');
const sa = JSON.parse(keyStr);
console.log('Service account:', sa.client_email);

// Create JWT
const header = { alg: 'RS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const claim = {
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters',
  aud: 'https://oauth2.googleapis.com/token',
  iat: now,
  exp: now + 3600,
};

const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const signInput = `${base64url(header)}.${base64url(claim)}`;
const sign = crypto.createSign('RSA-SHA256');
sign.update(signInput);
const signature = sign.sign(sa.private_key, 'base64url');
const jwt = `${signInput}.${signature}`;

// Exchange JWT for access token
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
});

if (!tokenRes.ok) {
  console.error('Token error:', await tokenRes.text());
  process.exit(1);
}
const { access_token } = await tokenRes.json();
console.log('Got access token');

// Add service account as owner to GSC property
const siteUrl = 'https://vizbiz.ai/';
const addRes = await fetch(
  `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
  {
    method: 'PUT',
    headers: { Authorization: `Bearer ${access_token}` },
  }
);

if (addRes.ok || addRes.status === 204) {
  console.log(`✅ Added ${sa.client_email} as owner of ${siteUrl}`);
} else {
  const err = await addRes.text();
  console.log(`Add site result (${addRes.status}):`, err);
  
  // Try adding as a user instead
  const userRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/add`,
    {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );
  console.log(`Alternative add result (${userRes.status}):`, await userRes.text());
}

// List current sites
const listRes = await fetch(
  'https://www.googleapis.com/webmasters/v3/sites',
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const sites = await listRes.json();
console.log('\nSites accessible to service account:');
if (sites.siteEntry) {
  for (const s of sites.siteEntry) {
    console.log(`  ${s.siteUrl} (permission: ${s.permissionLevel})`);
  }
} else {
  console.log('  None found:', JSON.stringify(sites));
}
