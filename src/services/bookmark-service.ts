import { authorizedFetch } from './auth-service';
import type { Insight } from '@/types/insight';

type BookmarkListResponse = {
  success: boolean;
  message?: string;
  data?: Insight[];
};

export async function fetchBookmarks(): Promise<Insight[]> {
  const response = await authorizedFetch('/api/bookmarks');
  const result = (await response.json()) as BookmarkListResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Unable to load your saved insights.');
  }

  return result.data;
}

export async function addBookmarkRemote(aiOutputId: number): Promise<void> {
  const response = await authorizedFetch('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ aiOutputId }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}) as { message?: string });
    throw new Error(result.message || 'Unable to save this insight.');
  }
}

export async function removeBookmarkRemote(aiOutputId: number): Promise<void> {
  const response = await authorizedFetch(`/api/bookmarks/${aiOutputId}`, { method: 'DELETE' });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}) as { message?: string });
    throw new Error(result.message || 'Unable to remove this insight.');
  }
}
