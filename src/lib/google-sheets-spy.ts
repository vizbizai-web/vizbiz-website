// Temporary debug module - intercepts sheetsFetch calls
const originalFetch = globalThis.fetch;
globalThis.fetch = function patchedFetch(url: RequestInfo | URL, init?: RequestInit) {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
  if (urlStr.includes('sheets.googleapis.com') && init?.method === 'POST') {
    console.log('[SHEETS-SPY] POST to:', urlStr.substring(0, 120));
    console.log('[SHEETS-SPY] Body:', init?.body?.toString().substring(0, 200));
  }
  return originalFetch(url, init);
};
