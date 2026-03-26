import type { LeadInput } from "@/lib/lead-handler";

export type ResearchBrief = {
  status: "pending" | "completed";
  note: string;
};

export function buildResearchBrief(_input: LeadInput): ResearchBrief {
  return {
    status: "pending",
    note: "Research not yet completed. Run manual research before the call and update the HubSpot note with findings.",
  };
}
