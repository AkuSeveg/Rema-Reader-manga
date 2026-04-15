const { Batoto } = require("mangascrape");
const batoto = new Batoto();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { action, query, mangaId, chapterId } = req.query;

    try {
        if (action === 'search') {
            const searchRes = await batoto.search({ 
                query: query || "Jujutsu Kaisen" 
            });
            
            if (!searchRes.results || searchRes.results.length === 0) {
                return res.status(200).json([]);
            }

            const results = searchRes.results.map(m => ({
                id: m.id,
                title: m.title || m.name || "Tanpa Judul",
                cover: m.cover || m.poster || "https://via.placeholder.com/200x300/111111/e50914?text=Rema",
                status: 'Manga'
            }));
            
            return res.status(200).json(results);
        }

        if (action === 'chapters') {
            const detailed = await batoto.id(mangaId);
            if (!detailed || !detailed.chapters) throw new Error("Data chapter kosong");

            const chapters = detailed.chapters.map(c => ({
                id: c.id,
                chapter: c.chapter || c.title?.replace(/[^0-9.]/g, '') || "?",
                title: c.title || "",
            }));

            // Urutkan dari chapter awal ke akhir
            chapters.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
            return res.status(200).json(chapters);
        }

        if (action === 'pages') {
            // Mangascrape butuh mangaId dan chapterId sekaligus
            const pagesData = await batoto.chapter(mangaId, chapterId);
            const pages = pagesData.map(p => typeof p === 'string' ? p : p.url || p.src);
            return res.status(200).json(pages);
        }

        return res.status(400).json({ error: 'Aksi tidak valid' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
