// assets/js/api.js (Ganti isi file api.js yang sudah ada sebelumnya dengan kode ini)
const BASE_URL = "/api/manga";

export async function fetchMangaPopuler(searchQuery = "") {
    const res = await fetch(`${BASE_URL}?action=search&query=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);
    if (!data || data.length === 0) throw new Error("Manga tidak ditemukan.");
    
    return data;
}

export async function fetchChapters(mangaId) {
    const res = await fetch(`${BASE_URL}?action=chapters&id=${encodeURIComponent(mangaId)}`);
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);
    return data;
}

export async function fetchChapterPages(chapterId) {
    const res = await fetch(`${BASE_URL}?action=pages&id=${encodeURIComponent(chapterId)}`);
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);
    return data;
        }
