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
  emailDraftSubject: string | null;
  emailDraftBody: string | null;
  emailDraftHtml: string | null;
  researchBrief: string | null;
  sendFrom: string | null;
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

function extractSection(body: string, startMarker: string, endMarker?: string): string | null {
  const startIndex = body.indexOf(startMarker);
  if (startIndex === -1) return null;

  const contentStart = startIndex + startMarker.length;
  const sliced = body.slice(contentStart);
  const endIndex = endMarker ? sliced.indexOf(endMarker) : -1;
  const raw = endIndex === -1 ? sliced : sliced.slice(0, endIndex);
  const cleaned = raw.trim();
  return cleaned || null;
}

function parseEmailDraftBody(body: string): string | null {
  const emailSection = extractSection(body, "[EMAIL DRAFT]\n", "\n\n[EMAIL HTML]")
    ?? extractSection(body, "[EMAIL DRAFT]\n", "\n\n[RESEARCH BRIEF]");
  if (!emailSection) return null;

  const marker = "Body:\n";
  const markerIndex = emailSection.indexOf(marker);
  if (markerIndex === -1) return null;

  const draftBody = emailSection.slice(markerIndex + marker.length).trim();
  return draftBody || null;
}

export async function getHubSpotLeads(): Promise<HubSpotLead[]> {
  const token = getToken();
  if (!token) {
    console.error("[hubspot-leads] No HubSpot token configured.");
    return [];
  }

  try {
    const dealsUrl =
      `${BASE}/crm/v3/objects/deals?limit=50` +
      `&properties=dealname,dealstage,closedate,createdate` +
      `&sort=-createdate`;
    const dealsData = await hubFetch(token, dealsUrl);
    const deals: Array<{ id: string; properties: Record<string, string> }> =
      dealsData.results ?? [];

    if (deals.length === 0) return [];

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

    return deals.map((deal) => {
      const assoc = dealAssocMap[deal.id] ?? { contactId: null, companyId: null, noteId: null };
      const contact = assoc.contactId ? (contactMap[assoc.contactId] ?? null) : null;
      const company = assoc.companyId ? (companyMap[assoc.companyId] ?? null) : null;
      const noteBody = assoc.noteId ? (noteBodyMap[assoc.noteId] ?? null) : null;
      const emailDraftSection = noteBody
        ? extractSection(noteBody, "[EMAIL DRAFT]\n", "\n\n[RESEARCH BRIEF]")
          ?? extractSection(noteBody, "[EMAIL DRAFT]\n", "\n\n[EMAIL HTML]")
        : null;

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
        emailDraftSubject: emailDraftSection
          ? parseNoteField(emailDraftSection, "Subject: ")
          : null,
        emailDraftBody: noteBody ? parseEmailDraftBody(noteBody) : null,
        emailDraftHtml: noteBody
          ? extractSection(noteBody, "[EMAIL HTML]\n", "\n[RESEARCH BRIEF]") ?? null
          : null,
        researchBrief: noteBody
          ? extractSection(noteBody, "[RESEARCH BRIEF]\n")
          : null,
        sendFrom: emailDraftSection
          ? parseNoteField(emailDraftSection, "Send from: ")
          : null,
      };
    });
  } catch (err) {
    console.error("[hubspot-leads] Fatal error:", err);
    return [];
  }
}
