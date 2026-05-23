import { afterEach, describe, expect, it, vi } from "vitest";
import { enrichWithGooglePlaces, findGooglePlace } from "./google-places";

const place = {
  id: "places/client123",
  displayName: { text: "Oakville Family Dental" },
  formattedAddress: "123 Lakeshore Rd, Oakville, ON, Canada",
  location: { latitude: 43.447, longitude: -79.667 },
  rating: 4.8,
  userRatingCount: 142,
  businessStatus: "OPERATIONAL",
  types: ["dentist", "health", "point_of_interest", "establishment"],
  websiteUri: "https://oakvillefamilydental.com",
  googleMapsUri: "https://maps.google.com/?cid=123",
};

const competitorPlace = {
  ...place,
  id: "places/competitor456",
  displayName: { text: "Lakeshore Dental" },
  formattedAddress: "456 Lakeshore Rd, Oakville, ON, Canada",
  location: { latitude: 43.449, longitude: -79.669 },
  rating: 4.9,
  userRatingCount: 301,
  websiteUri: "https://lakeshoredental.example",
};

describe("Google Places enrichment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns an unavailable client-only enrichment when GOOGLE_PLACES_API_KEY is missing", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");

    const result = await enrichWithGooglePlaces({ name: "Oakville Family Dental", city: "Oakville" });

    expect(result.status).toBe("unavailable");
    expect(result.competitorMode).toBe("client_only");
    expect(result.client.placeId).toBeNull();
    expect(result.competitors).toEqual([]);
  });

  it("looks up a client with the cost-controlled Places field mask", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "google_test");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ places: [place] }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await findGooglePlace({ name: "Oakville Family Dental", city: "Oakville", websiteUrl: "https://oakvillefamilydental.com" });

    expect(fetchMock).toHaveBeenCalledWith("https://places.googleapis.com/v1/places:searchText", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "X-Goog-Api-Key": "google_test",
        "X-Goog-FieldMask": expect.stringContaining("places.userRatingCount"),
      }),
    }));
    expect(result.placeId).toBe("places/client123");
    expect(result.websiteMatch).toBe(true);
    expect(result.cityMatch).toBe(true);
    expect(result.userRatingCount).toBe(142);
  });

  it("validates only client-provided competitors and keeps blank competitors in client-only mode", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "google_test");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ places: [place] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ places: [competitorPlace] }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await enrichWithGooglePlaces({
      name: "Oakville Family Dental",
      city: "Oakville",
      websiteUrl: "https://oakvillefamilydental.com",
      competitors: [{ name: "Lakeshore Dental", aviScore: 65 }],
    });

    expect(result.status).toBe("completed");
    expect(result.competitorMode).toBe("client_provided");
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors[0]).toMatchObject({ source: "client_provided", validationStatus: "validated" });
    expect(result.competitors[0].googlePlace.userRatingCount).toBe(301);
    expect(result.localEntityTrustScore.score).toBeGreaterThan(70);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
