import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

export const Google = {
  authUrl: oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  }),
  logIn: async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const { data } = await google
      .people({ version: "v1", auth: oauth2Client })
      .people.get({
        resourceName: "people/me",
        personFields: "emailAddresses,names,photos",
      });

    return { user: data };
  },
};

export interface GeocodeResult {
  country: string | null;
  admin: string | null;
  city: string | null;
}

interface AddressComponent {
  long_name: string;
  types: string[];
}

const parseAddressComponents = (
  components: AddressComponent[]
): GeocodeResult => {
  let country: string | null = null;
  let admin: string | null = null;
  let city: string | null = null;

  for (const component of components) {
    if (component.types.includes("country")) {
      country = component.long_name;
    }
    if (component.types.includes("administrative_area_level_1")) {
      admin = component.long_name;
    }
    if (
      component.types.includes("locality") ||
      component.types.includes("postal_town")
    ) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

// Fallback used when no geocoding key is configured: treats a comma separated
// address as "..., city, admin, country".
export const parseAddress = (address: string): GeocodeResult => {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    country: parts.length >= 2 ? parts[parts.length - 1] : null,
    admin: parts.length >= 3 ? parts[parts.length - 2] : null,
    city: parts.length >= 3 ? parts[parts.length - 3] : parts[0] ?? null,
  };
};

export const geocode = async (
  address: string
): Promise<GeocodeResult | null> => {
  const key = process.env.G_GEOCODE_KEY;
  if (!key) {
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", key);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    status: string;
    results: { address_components: AddressComponent[] }[];
  };

  if (data.status !== "OK" || !data.results.length) {
    return null;
  }

  return parseAddressComponents(data.results[0].address_components);
};
