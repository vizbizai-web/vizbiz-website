/**
 * Google Places API Client (New)
 *
 * Primary source for local competitor discovery.
 * Returns verified nearby businesses with addresses, ratings, and URLs.
 * Falls back gracefully if API key is not configured.
 */

const PLACES_API_BASE = "https://places.googleapis.com/v1";

interface PlaceResult {
  name: string;           // Resource name: "places/ChIJ..."
  displayName: { text: string };
  formattedAddress: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  primaryType?: string;
  types?: string[];
  googleMapsUri?: string;
}

interface NearbySearchResponse {
  places?: PlaceResult[];
}

/**
 * Search for nearby businesses of a specific type using Google Places API (New).
 *
 * @param query - Search query (e.g., "yoga studio")
 * @param location - Center point { latitude, longitude }
 * @param radiusMeters - Search radius in meters (default: 10000 = ~6 miles)
 * @param maxResults - Max results to return (default: 10)
 */
export async function placesNearbySearch(
  query: string,
  location: { latitude: number; longitude: number },
  radiusMeters: number = 10000,
  maxResults: number = 10
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.info("[places-client] No GOOGLE_PLACES_API_KEY configured, skipping Places search");
    return [];
  }

  try {
    const body = {
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: location.latitude, longitude: location.longitude },
          radius: radiusMeters,
        },
      },
      pageSize: maxResults,
      languageCode: "en",
    };

    const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.websiteUri",
          "places.nationalPhoneNumber",
          "places.primaryType",
          "places.types",
          "places.googleMapsUri",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[places-client] Places API error (${response.status}): ${errorText}`);
      return [];
    }

    const data: NearbySearchResponse = await response.json();
    return data.places || [];
  } catch (error) {
    console.error("[places-client] Places API request failed:", error);
    return [];
  }
}

/**
 * Geocode an address or postal code to coordinates.
 * Falls back gracefully if API key is not configured.
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    // Use Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error("[places-client] Geocoding failed:", error);
    return null;
  }
}

/**
 * Check if Google Places API is configured.
 */
export function isPlacesConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

export type { PlaceResult };
