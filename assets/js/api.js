const BASE_URL = "https://api.comick.app";
const PROXY = "https://api.allorigins.win/raw?url=";

export async function fetchMangaPopuler(searchQuery = "") {
    let url = `${BASE_URL}/v1.0/search?limit=30`;
    
    if (searchQuery && searchQuery.trim() !== "") {
        url += `&q=${encodeURIComponent(searchQuery)}`;
    } else {
        url += `&sort=follow`; 
    }

    const fetchUrl = PROXY + encodeURIComponent(url);

    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error("Gagal terhubung ke server komik.");
    const data = await res.json();
    
    if (!data || data.length === 0) {
        throw new Error("Manga tidak ditemukan.");
    }
    
    return data.map(m => {
        let coverImg = "https://via.placeholder.com/200x300/111111/e50914?text=Rema";
        if (m.cover_url) {
            coverImg = m.cover_url;
        } else if (m.md_covers && m.md_covers.length > 0 && m.md_covers[0].b2key) {
            coverImg = `https://meo.comick.pictures/${m.md_covers[0].b2key}`;
        }

        return {
            id: m.hid,
            title: m.title || "Tanpa Judul",
            desc: m.desc || "Tidak ada sinopsis yang tersedia.",
            cover: coverImg,
            status: m.status === 1 ? 'Ongoing' : (m.status === 2 ? 'Completed' : 'Unknown')
        };
    });
}

export async function fetchChapters(mangaId) {
    let urlId = `${BASE_URL}/comic/${mangaId}/chapters?lang=id&limit=300`;
    let res = await fetch(PROXY + encodeURIComponent(urlId));
    let data = await res.json();
    let chapters = data.chapters || [];

    if (chapters.length === 0) {
        let urlEn = `${BASE_URL}/comic/${mangaId}/chapters?lang=en&limit=300`;
        res = await fetch(PROXY + encodeURIComponent(urlEn));
        data = await res.json();
        chapters = data.chapters || [];
    }
    
    chapters = chapters.filter(c => c.chap).map(c => ({
        id: c.hid,
        chapter: c.chap,
        title: c.title || "",
        lang: c.lang
    }));

    chapters.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
    return chapters;
}

export async function fetchChapterPages(chapterId) {
    const url = `${BASE_URL}/chapter/${chapterId}`;
    const res = await fetch(PROXY + encodeURIComponent(url));
    const data = await res.json();
    
    if (!data.chapter || !data.chapter.images) {
        throw new Error("Gagal mengambil gambar halaman.");
    }

    return data.chapter.images.map(img => img.url);
            }
