// assets/js/mangadex.js
const BASE_URL = "https://api.mangadex.org";

export async function fetchMangaPopuler(searchQuery = "") {
    let url = `${BASE_URL}/manga?limit=24&includes[]=cover_art&includes[]=author&order[followedCount]=desc&availableTranslatedLanguage[]=id&availableTranslatedLanguage[]=en`;
    
    if (searchQuery && searchQuery.trim() !== "") {
        url = `${BASE_URL}/manga?limit=24&includes[]=cover_art&title=${encodeURIComponent(searchQuery)}&order[relevance]=desc&availableTranslatedLanguage[]=id&availableTranslatedLanguage[]=en`;
    }

    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.data || data.data.length === 0) {
        throw new Error("Manga tidak ditemukan.");
    }
    
    return data.data;
}

export async function fetchChapters(mangaId) {
    const res = await fetch(`${BASE_URL}/manga/${mangaId}/feed?limit=100&translatedLanguage[]=id&translatedLanguage[]=en&order[chapter]=asc`);
    const data = await res.json();
    
    const chapters = data.data
        .filter(ch => ch.attributes.chapter && !isNaN(parseFloat(ch.attributes.chapter)))
        .sort((a,b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));
    
    return chapters;
}

export async function fetchChapterPages(chapterId) {
    const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
    const data = await res.json();
    
    if (!data.chapter || !data.chapter.data) {
        throw new Error("Gagal mengambil data halaman.");
    }

    const baseUrl = data.baseUrl;
    const chapterHash = data.chapter.hash;
    const pageFiles = data.chapter.data;

    return pageFiles.map(file => `${baseUrl}/data/${chapterHash}/${file}`);
}