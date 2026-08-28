type StyleDimensionItem = {
  value: string;
  label: string;
  subtitle?: string | null;
};

type VoiceDimensionItem = StyleDimensionItem & {
  restrictedToCountry: string | null;
};

export type StyleDimensions = {
  tones: StyleDimensionItem[];
  voices: VoiceDimensionItem[];
  countries: StyleDimensionItem[];
};

type StyleDimensionsResponse = {
  success: boolean;
  message?: string;
  data?: StyleDimensions;
};

function getApiUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('The backend URL is not configured. Add EXPO_PUBLIC_API_URL to your .env file.');
  }
  return apiUrl.replace(/\/$/, '');
}

export async function fetchStyleDimensions(): Promise<StyleDimensions> {
  const response = await fetch(`${getApiUrl()}/api/style-dimensions`, {
    headers: { Accept: 'application/json' },
  });
  const result = (await response.json()) as StyleDimensionsResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Unable to load style options right now.');
  }

  return result.data;
}
