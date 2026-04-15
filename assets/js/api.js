const BASE_URL = "/api/manga";

export async function fetchMangaPopuler(searchQuery = "") {
    const res = await fetch(`${BASE_URL}?action=search&query=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.length === 0) throw new Error("Manga tidak ditemukan.");
    return data;
}

export async function fetchChapters(mangaId) {
    const res = await fetch(`${BASE_URL}?action=chapters&mangaId=${encodeURIComponent(mangaId)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}

// Tambahkan mangaId sebagai parameter kedua
export async function fetchChapterPages(chapterId, mangaId) {
    const res = await fetch(`${BASE_URL}?action=pages&chapterId=${encodeURIComponent(chapterId)}&mangaId=${encodeURIComponent(mangaId)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}
