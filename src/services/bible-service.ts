function getApiUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "The backend URL is not configured. Add EXPO_PUBLIC_API_URL to your .env file.",
    );
  }
  return apiUrl.replace(/\/$/, "");
}

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: { Accept: "application/json" },
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(
      result.message || "Unable to load Bible choices. Please try again.",
    );
  }
  return result.data;
}

type BookItem = { code: string; name: string; testament: string | null };

export async function fetchKjvBooks() {
  const books = await getJson<BookItem[]>("/api/scripture/books");
  // `id` is the book's display name — our backend's chapter/verse routes key
  // off the name directly, so there's no separate code lookup needed here.
  return books.map((book) => ({ id: book.name, name: book.name }));
}

export async function fetchKjvChapters(bookId: string) {
  const chapters = await getJson<number[]>(
    `/api/scripture/books/${encodeURIComponent(bookId)}/chapters`,
  );
  return chapters.map((chapter) => ({
    book_id: bookId,
    book: bookId,
    chapter,
  }));
}

export async function fetchKjvChapter(bookId: string, chapter: string) {
  const verses = await getJson<number[]>(
    `/api/scripture/books/${encodeURIComponent(bookId)}/chapters/${chapter}/verses`,
  );
  return verses.map((verse) => ({
    book_id: bookId,
    book: bookId,
    chapter: Number(chapter),
    verse,
    text: "",
  }));
}

export async function fetchKjvVerse(
  book: string,
  chapter: string,
  verse: string,
) {
  const data = await getJson<{
    reference: string;
    translation: string;
    text: string;
  }>(
    `/api/scripture/books/${encodeURIComponent(book)}/chapters/${chapter}/verses/${verse}`,
  );
  return {
    reference: data.reference,
    translation: data.translation,
    translationName: "King James Version",
    text: data.text,
  };
}

export async function fetchRandomVerse() {
  return getJson<{ reference: string; translation: string; text: string }>(
    "/api/scripture/random",
  );
}
