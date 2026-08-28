import { authorizedFetch } from './auth-service';

type ShareDesign = {
  theme: string;
  font: string;
  fontColor: string;
  pattern: string;
  glow: string;
  format: string;
  fontScale: number;
  alignment: 'left' | 'center';
};

export async function recordShare(
  aiOutputId: number,
  design: ShareDesign,
  channel: 'system_share' | 'download',
): Promise<void> {
  const response = await authorizedFetch('/api/shares', {
    method: 'POST',
    body: JSON.stringify({ aiOutputId, design, channel }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}) as { message?: string });
    throw new Error(result.message || 'Unable to record this share.');
  }
}
