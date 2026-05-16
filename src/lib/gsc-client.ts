/**
 * Google Search Console API Client
 * Service account: gsc-reader@vizbiz-gsc.iam.gserviceaccount.com
 * Verified owner of: https://vizbiz.ai/
 */

import crypto from 'crypto';

interface GSCConfig {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
}

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
}

interface SearchAnalyticsParams {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  dimensionFilterGroups?: any[];
  rowLimit?: number;
}

export class GSCClient {
  private config: GSCConfig;

  constructor(config?: Partial<GSCConfig>) {
    this.config = {
      clientEmail: config?.clientEmail || process.env.GSC_CLIENT_EMAIL || 'gsc-reader@vizbiz-gsc.iam.gserviceaccount.com',
      privateKey: config?.privateKey || process.env.GSC_PRIVATE_KEY || '',
      siteUrl: config?.siteUrl || process.env.GSC_SITE_URL || 'https://vizbiz.ai/',
    };
  }

  private async getAccessToken(): Promise<string> {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: this.config.clientEmail,
      scope: 'https://www.googleapis.com/auth/webmasters',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const signInput = `${b64(header)}.${b64(claim)}`;
    const signature = crypto.createSign('RSA-SHA256').update(signInput).sign(this.config.privateKey, 'base64url');
    const jwt = `${signInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!res.ok) throw new Error(`Token error: ${res.status} ${await res.text()}`);
    const { access_token } = await res.json() as any;
    return access_token;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    const url = endpoint.startsWith('http')
      ? endpoint
      : `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.config.siteUrl)}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GSC API error ${res.status}: ${text}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return null;
  }

  /** Search analytics query */
  async searchAnalytics(params: SearchAnalyticsParams): Promise<SearchAnalyticsRow[]> {
    const data = await this.fetch('/searchAnalytics/query', {
      method: 'POST',
      body: JSON.stringify({
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions || ['page'],
        dimensionFilterGroups: params.dimensionFilterGroups,
        rowLimit: params.rowLimit || 50,
      }),
    });
    return data?.rows || [];
  }

  /** Get last N days of search performance by page */
  async recentPerformance(days = 7): Promise<SearchAnalyticsRow[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return this.searchAnalytics({ startDate, endDate, dimensions: ['page'], rowLimit: 50 });
  }

  /** Get performance by query */
  async topQueries(days = 7, limit = 30): Promise<SearchAnalyticsRow[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return this.searchAnalytics({ startDate, endDate, dimensions: ['query'], rowLimit: limit });
  }

  /** Get performance by page + query */
  async pageQueryBreakdown(days = 7, limit = 50): Promise<SearchAnalyticsRow[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return this.searchAnalytics({ startDate, endDate, dimensions: ['page', 'query'], rowLimit: limit });
  }

  /** List sitemaps */
  async sitemaps(): Promise<any[]> {
    const data = await this.fetch('/sitemaps');
    return data?.sitemap || [];
  }

  /** Get site info / permission level */
  async siteInfo(): Promise<any> {
    return this.fetch('');
  }

  /** Summary stats for a date range */
  async summary(days = 7): Promise<{
    clicks: number;
    impressions: number;
    position: number;
    ctr: number;
    topPages: SearchAnalyticsRow[];
    topQueries: SearchAnalyticsRow[];
  }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 8000000).toISOString().split('T')[0];

    const [pages, queries] = await Promise.all([
      this.searchAnalytics({ startDate, endDate, dimensions: ['page'], rowLimit: 50 }),
      this.searchAnalytics({ startDate, endDate, dimensions: ['query'], rowLimit: 30 }),
    ]);

    const totals = pages.reduce(
      (acc, r) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
        position: acc.position + r.position * r.impressions,
      }),
      { clicks: 0, impressions: 0, position: 0 },
    );

    return {
      clicks: totals.clicks,
      impressions: totals.impressions,
      position: totals.impressions > 0 ? totals.position / totals.impressions : 0,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      topPages: pages.sort((a, b) => b.clicks - a.clicks),
      topQueries: queries.sort((a, b) => b.clicks - a.clicks),
    };
  }
}

// CLI test
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load key from env file
  import('fs').then(async ({ readFileSync }) => {
    import('path').then(async ({ join, dirname }) => {
      import('url').then(async ({ fileURLToPath }) => {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const envPath = join(__dirname, '..', '.env.local');
        const envContent = readFileSync(envPath, 'utf-8');
        const keyMatch = envContent.match(/GOOGLE_GSC_KEY=({[\s\S]*?})\n/);
        if (!keyMatch) { console.error('No GSC key found in .env.local'); process.exit(1); }
        
        const keyData = JSON.parse(keyMatch[1]);
        const client = new GSCClient({ privateKey: keyData.private_key });
        
        console.log('=== GSC Summary (7 days) ===');
        const summary = await client.summary(7);
        console.log(`Total: ${summary.clicks} clicks, ${summary.impressions} impressions, avg pos ${summary.position.toFixed(1)}, CTR ${(summary.ctr * 100).toFixed(1)}%`);
        
        console.log('\nTop Pages:');
        for (const p of summary.topPages.slice(0, 10)) {
          console.log(`  ${p.keys[0]}: ${p.clicks} clicks, ${p.impressions} imp, pos ${p.position.toFixed(1)}`);
        }
        
        console.log('\nTop Queries:');
        for (const q of summary.topQueries.slice(0, 10)) {
          console.log(`  "${q.keys[0]}": ${q.clicks} clicks, ${q.impressions} imp, pos ${q.position.toFixed(1)}`);
        }
      });
    });
  });
}
