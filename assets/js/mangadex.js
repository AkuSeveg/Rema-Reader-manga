const BASE_URL = "https://api.comick.fun";

export async function fetchMangaPopuler(searchQuery = "") {
    let url = `${BASE_URL}/v1.0/search?limit=30`;
    
    if (searchQuery && searchQuery.trim() !== "") {
        url += `&q=${encodeURIComponent(searchQuery)}`;
    } else {
        url += `&sort=follow`; // Jika kosong, tampilkan yang trending
    }

    const res = await fetch(url);
    const data = await res.json();
    
    if (!data || data.length === 0) {
        throw new Error("Manga tidak ditemukan.");
    }
    
    // Format data agar seragam dan rapi saat dikirim ke aplikasi
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
    // Coba ambil chapter bahasa Indonesia (id)
    let res = await fetch(`${BASE_URL}/comic/${mangaId}/chapters?lang=id&limit=300`);
    let data = await res.json();
    let chapters = data.chapters || [];

    // Jika chapter Indo kosong, coba ambil bahasa Inggris (en)
    if (chapters.length === 0) {
        res = await fetch(`${BASE_URL}/comic/${mangaId}/chapters?lang=en&limit=300`);
        data = await res.json();
        chapters = data.chapters || [];
    }
    
    // Filter chapter yang valid dan format ulang datanya
    chapters = chapters.filter(c => c.chap).map(c => ({
        id: c.hid,
        chapter: c.chap,
        title: c.title || "",
        lang: c.lang
    }));

    // Urutkan dari chapter pertama ke terakhir (Ascending)
    chapters.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
    
    return chapters;
}

export async function fetchChapterPages(chapterId) {
    const res = await fetch(`${BASE_URL}/chapter/${chapterId}`);
    const data = await res.json();
    
    if (!data.chapter || !data.chapter.images) {
        throw new Error("Gagal mengambil data halaman komik.");
    }

    return data.chapter.images.map(img => img.url);
                    }
