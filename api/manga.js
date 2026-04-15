const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://kiryuu.id';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { action, query, id } = req.query;

    try {
        if (action === 'search') {
            const searchUrl = query ? `${TARGET_URL}/?s=${encodeURIComponent(query)}` : `${TARGET_URL}/manga/?order=popular`;
            const { data } = await axios.get(searchUrl);
            const $ = cheerio.load(data);
            let results = [];

            $('.bsx').each((i, el) => {
                const title = $(el).find('.tt').text().trim();
                const link = $(el).find('a').attr('href');
                let cover = $(el).find('img').attr('src');
                
                const mangaId = link ? link.replace(TARGET_URL, '').replace('/manga/', '').replace(/\//g, '') : '';

                if (title && mangaId) {
                    if (!cover || cover.includes('data:image')) {
                        cover = $(el).find('img').attr('data-src') || "https://via.placeholder.com/200x300/111111/e50914?text=Rema";
                    }
                    results.push({ id: mangaId, title, cover, status: 'Sub Indo' });
                }
            });
            return res.status(200).json(results);
        }

        if (action === 'chapters') {
            const { data } = await axios.get(`${TARGET_URL}/manga/${id}/`);
            const $ = cheerio.load(data);
            let chapters = [];

            $('#chapterlist li').each((i, el) => {
                const chapText = $(el).find('.chapternum').text();
                const chapNum = chapText.replace(/[^0-9.]/g, ''); 
                const link = $(el).find('a').attr('href');
                const chapterId = link ? link.replace(TARGET_URL, '').replace(/\//g, '') : '';

                if (chapNum && chapterId) {
                    chapters.push({ id: chapterId, chapter: chapNum });
                }
            });
            
            chapters.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
            return res.status(200).json(chapters);
        }

        if (action === 'pages') {
            const { data } = await axios.get(`${TARGET_URL}/${id}/`);
            const $ = cheerio.load(data);
            let pages = [];

            $('#readerarea img').each((i, el) => {
                let src = $(el).attr('src');
                if (!src || src.includes('data:image')) {
                    src = $(el).attr('data-src') || $(el).attr('data-lazy-src');
                }
                if (src) pages.push(src);
            });
            return res.status(200).json(pages);
        }

        return res.status(400).json({ error: 'Perintah tidak dikenali.' });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data dari target: ' + error.message });
    }
};
