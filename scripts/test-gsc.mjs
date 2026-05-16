import crypto from 'crypto';

const sa = {
  type: "service_account",
  project_id: "vizbiz-gsc",
  private_key_id: "b394adb5d71c2805a0e529391ae1d7f15434f9db",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuf4RwJW1CrFz8\nQ3fJ1QlivBUzPD192HOFd8qqlFjUFCQQOe5Hc2TxL1eFO0QiGvv6e9mwCINnys7h\nnvv4SxidARzApKKCqqbb2xjgsz3yYOKqS2F6J8s5/sZ1uiRDc4e4VHSZiB3WuMju\nyTp1XB1+D1vVJYgVmBDp615onef66nEOxFsPIWr8w8ziXKgk4mg9PZbhTEG+gdmw\nr+rldIDXBxEMMfrL7UosCGLV1Cv1RKR7++X6wnJrpKZYOXEGp4GfpgoPDc01ro7p\nhxOvN5ljnhGYxqPW/VOUxkFfmIVdRnWqOfeadKwcrtj6RnHuLibeqOE0ZLEoEG0M\n2Z3JlfQbAgMBAAECggEABZ/Qj04gLmpLI5+yaGFNyHk9dFr4XxUEltmx65DqfV4a\nJ3e73rZbxjZQwNeUg5uRDEAaV8UpJHBHU22su2etkb9BGP3KyyFgTW0gvnqogCZv\n8oM0JMbMPcCgzuyX/KCS+vWl6HOYWp0MGj4xfH+NPSHrmNF5MxD6rT92hIgKZm5D\nAGsxfMmRhzPxXXLAUiLmCvivXr+0lBISNpuypbdhPl7QVgICUn1vi4MGFoExnXpt\nN5gCtXprIs+twzrP1ao/x9zw2WwsYLiEg64VSjexoXQVJyyCQj4Luj5uzSavfrzE\nS5Cb4fLz0QRTtcT5wI3RHrLaFGOqB2UpnLBBVppRAQKBgQDn1j/ghcHuBCn7Fo/3\nCXKEzsJ884LKMzb6Mbp0FqBswzrgZAdd2l2+9Pf4emoEKxDRs8QlC4Ju0nzdI+Yh\nN48N9W6vjOG5dQ/gqqHY5ohJm/ARtRooa4hArpUsiXJ6ADzYlk3lgFQCZv1jGM9H\nWhnJ0nriuxX8eYoyIWLxvmcBmwKBgQDAr2Jan/LSE4eIBeCYcBV/QtgOKTPqYaUB\nlwvvQ5MLBKQ7YkbupeKEMTfkX/IJ5Roq2LZ8HlaaS0qKCJYAIJucAjIYqBpTjZw6\ncSiTgEtOL8dgaJ+Anu1sD+cwRsyQ6EGufUp3Wg6DLJDu3CvNRsUu5DB8M9rBE53S\nTtFH3+s/gQKBgHmnjcFtrwQNH1Jo1obVaEiUjq4uwhUEpvbHHYZJUUmBcOXK16rC\nKatItM6ovfUN/DduU6D01y78ORV5/wqzMtgqUDjCfrho2zoTj/ZXknC96U4BcIaB\nVvBKLHFAdtfaRBOLW7jwjCTukkxr+mkAuMOVNXLApZrk1EXWCyu7tCW9AoGBAI+f\nqz5FzydLq1B2oQy/Lybm2kjj6XChS+89eYXk5qvlz8z72kd0mr1SOokeAzng7XpW\ngt9NddwYlv0AnV6G77Z/5HuAge8ZtQPS6R3ZGUi0UHbKRWoIDIzp5beUblLs7Fh1\nx5XjKMIZ7AY/Ut72C3CCYqmRtVMJni/u1AwxGhcBAoGAKpZI+9Xm7aD1asuYA6Xp\nS3cu0PnObsBIIbEyiXvo7KF+urUqceoOOm3x8hFo/zhakZ6lYbAB6tOtGeNiBs6g\nMlHFe8k/3V0/dl9QWrQ3t+APsEQJ74UEfJR0ll9SBgcD+Lb9BlF6ocIkVuBtnt1p\nx3SC8qmT5SbkXYa1IDgU2Io=\n-----END PRIVATE KEY-----\n",
  client_email: "gsc-reader@vizbiz-gsc.iam.gserviceaccount.com",
  client_id: "114165541569140728260",
  token_uri: "https://oauth2.googleapis.com/token",
};

// Create JWT
const header = { alg: 'RS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const claim = {
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters',
  aud: sa.token_uri,
  iat: now,
  exp: now + 3600,
};

const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const signInput = `${base64url(header)}.${base64url(claim)}`;
const sign = crypto.createSign('RSA-SHA256');
sign.update(signInput);
const signature = sign.sign(sa.private_key, 'base64url');
const jwt = `${signInput}.${signature}`;

// Get access token
const tokenRes = await fetch(sa.token_uri, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
});

if (!tokenRes.ok) { console.error('Token error:', await tokenRes.text()); process.exit(1); }
const { access_token } = await tokenRes.json();
console.log('✅ Got access token');

// Try to add service account as site owner
const siteUrl = 'https://vizbiz.ai/';
const addRes = await fetch(
  `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
  { method: 'PUT', headers: { Authorization: `Bearer ${access_token}` } }
);
console.log(`Add site: ${addRes.status} ${addRes.statusText}`);
if (!addRes.ok) console.log(await addRes.text());

// List accessible sites
const listRes = await fetch(
  'https://www.googleapis.com/webmasters/v3/sites',
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const sites = await listRes.json();
if (sites.siteEntry) {
  console.log('\nSites:');
  for (const s of sites.siteEntry) console.log(`  ${s.siteUrl} (${s.permissionLevel})`);
} else {
  console.log('\nNo sites accessible:', JSON.stringify(sites, null, 2));
}
