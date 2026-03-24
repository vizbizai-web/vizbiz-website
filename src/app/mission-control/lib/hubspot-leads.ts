export type HubSpotLead = {
  dealId: string;
  dealName: string;
  dealStage: string;
  closeDate: string | null;
  createdAt: string;
  contactId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companyId: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  companyCity: string | null;
  noteBody: string | null;
  appearedInPrompts: string | null;
  overallVisibility: string | null;
  serviceDeptVisibility: string | null;
  competitorSummary: string | null;
};

const BASE = "https://api.hubapi.com";

function getToken(): string | null {
  return process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY || null;
}

async function hubFetch(token: string, url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HubSpot API error ${res.status} for ${url}`);
  }
  return res.json();
}

function parseNoteField(body: string, prefix: string): string | null {
  const lines = body.split("\n");
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      const val = line.slice(prefix.length).trim();
      return val || null;
    }
  }
  return null;
}

export async function getHubSpotLeads(): Promise<HubSpotLead[]> {
  const token = getToken();
  if (!token) {
    console.error("[hubspot-leads] No HubSpot token configured.");
    return [];
  }

  try {
    // 1. Fetch deals (limit 50, newest first)
    const dealsUrl =
      `${BASE}/crm/v3/objects/deals?limit=50` +
      `&properties=dealname,dealstage,closedate,createdate` +
      `&sort=-createdate`;
    const dealsData = await hubFetch(token, dealsUrl);
    const deals: Array<{ id: string; properties: Record<string, string> }> =
      dealsData.results ?? [];

    if (deals.length === 0) return [];

    // 2 & 3 & 6. Fetch associations for all deals in parallel
    const assocResults = await Promise.allSettled(
      deals.map(async (deal) => {
        const [contactAssoc, companyAssoc, noteAssoc] = await Promise.allSettled([
          hubFetch(
            token,
            `${BASE}/crm/v4/objects/deals/${deal.id}/associations/contacts/default`
          ),
          hubFetch(
            token,
            `${BASE}/crm/v4/objects/deals/${deal.id}/associations/companies/default`
          ),
          hubFetch(
            token,
            `${BASE}/crm/v4/objects/deals/${deal.id}/associations/notes/default`
          ),
        ]);

        const contactId =
          contactAssoc.status === "fulfilled"
            ? (contactAssoc.value.results?.[0]?.toObjectId as string) ?? null
            : null;

        const companyId =
          companyAssoc.status === "fulfilled"
            ? (companyAssoc.value.results?.[0]?.toObjectId as string) ?? null
            : null;

        const noteId =
          noteAssoc.status === "fulfilled"
            ? (noteAssoc.value.results?.[0]?.toObjectId as string) ?? null
            : null;

        return { dealId: deal.id, contactId, companyId, noteId };
      })
    );

    // Build lookup maps
    const dealAssocMap: Record<
      string,
      { contactId: string | null; companyId: string | null; noteId: string | null }
    > = {};
    assocResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        dealAssocMap[deals[i].id] = r.value;
      } else {
        dealAssocMap[deals[i].id] = { contactId: null, companyId: null, noteId: null };
      }
    });

    // 4. Batch fetch contacts
    const contactIds = [
      ...new Set(
        Object.values(dealAssocMap)
          .map((a) => a.contactId)
          .filter(Boolean) as string[]
      ),
    ];

    const contactMap: Record<string, { name: string | null; email: string | null; phone: string | null }> = {};
    if (contactIds.length > 0) {
      try {
        const batchContactData = await hubFetch(
          token,
          `${BASE}/crm/v3/objects/contacts/batch/read`,
          {
            method: "POST",
            body: JSON.stringify({
              properties: ["firstname", "lastname", "email", "phone"],
              inputs: contactIds.map((id) => ({ id })),
            }),
          }
        );
        for (const c of batchContactData.results ?? []) {
          const first = c.properties?.firstname ?? "";
          const last = c.properties?.lastname ?? "";
          contactMap[c.id] = {
            name: [first, last].filter(Boolean).join(" ") || null,
            email: c.properties?.email ?? null,
            phone: c.properties?.phone ?? null,
          };
        }
      } catch (err) {
        console.error("[hubspot-leads] Contact batch fetch failed:", err);
      }
    }

    // 5. Batch fetch companies
    const companyIds = [
      ...new Set(
        Object.values(dealAssocMap)
          .map((a) => a.companyId)
          .filter(Boolean) as string[]
      ),
    ];

    const companyMap: Record<string, { name: string | null; website: string | null; city: string | null }> = {};
    if (companyIds.length > 0) {
      try {
        const batchCompanyData = await hubFetch(
          token,
          `${BASE}/crm/v3/objects/companies/batch/read`,
          {
            method: "POST",
            body: JSON.stringify({
              properties: ["name", "website", "city"],
              inputs: companyIds.map((id) => ({ id })),
            }),
          }
        );
        for (const c of batchCompanyData.results ?? []) {
          companyMap[c.id] = {
            name: c.properties?.name ?? null,
            website: c.properties?.website ?? null,
            city: c.properties?.city ?? null,
          };
        }
      } catch (err) {
        console.error("[hubspot-leads] Company batch fetch failed:", err);
      }
    }

    // 6. Fetch notes (individual — no batch endpoint for notes)
    const noteIds = [
      ...new Set(
        Object.values(dealAssocMap)
          .map((a) => a.noteId)
          .filter(Boolean) as string[]
      ),
    ];

    const noteBodyMap: Record<string, string> = {};
    await Promise.allSettled(
      noteIds.map(async (noteId) => {
        try {
          const noteData = await hubFetch(
            token,
            `${BASE}/crm/v3/objects/notes/${noteId}?properties=hs_note_body`
          );
          const body: string = noteData.properties?.hs_note_body ?? "";
          if (body) noteBodyMap[noteId] = body;
        } catch (err) {
          console.error(`[hubspot-leads] Note fetch failed for ${noteId}:`, err);
        }
      })
    );

    // 7 & 8. Assemble leads
    return deals.map((deal) => {
      const assoc = dealAssocMap[deal.id] ?? { contactId: null, companyId: null, noteId: null };
      const contact = assoc.contactId ? (contactMap[assoc.contactId] ?? null) : null;
      const company = assoc.companyId ? (companyMap[assoc.companyId] ?? null) : null;
      const noteBody = assoc.noteId ? (noteBodyMap[assoc.noteId] ?? null) : null;

      return {
        dealId: deal.id,
        dealName: deal.properties.dealname ?? "",
        dealStage: deal.properties.dealstage ?? "",
        closeDate: deal.properties.closedate ?? null,
        createdAt: deal.properties.createdate ?? "",
        contactId: assoc.contactId,
        contactName: contact?.name ?? null,
        contactEmail: contact?.email ?? null,
        contactPhone: contact?.phone ?? null,
        companyId: assoc.companyId,
        companyName: company?.name ?? null,
        companyWebsite: company?.website ?? null,
        companyCity: company?.city ?? null,
        noteBody,
        appearedInPrompts: noteBody
          ? parseNoteField(noteBody, "- Appeared in prompts: ")
          : null,
        overallVisibility: noteBody
          ? parseNoteField(noteBody, "- Visibility status: ")
          : null,
        serviceDeptVisibility: noteBody
          ? parseNoteField(noteBody, "- Service visibility: ")
          : null,
        competitorSummary: noteBody
          ? parseNoteField(noteBody, "- Competitor summary: ")
          : null,
      };
    });
  } catch (err) {
    console.error("[hubspot-leads] Fatal error:", err);
    return [];
  }
}
