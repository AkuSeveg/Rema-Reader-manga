// assets/js/app.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

import { fetchMangaPopuler, fetchChapters, fetchChapterPages } from './mangadex.js';

const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const mangasList = ref([]);
        const isLoading = ref(true);
        const searchQuery = ref('');

        const isReaderOpen = ref(false);
        const activeManga = ref(null);
        const activeMangaTitle = ref('');
        const activeChapters = ref([]);
        const currentChapterIndex = ref(0);
        const currentPages = ref([]);
        const isReaderLoading = ref(false);
        const errorMsg = ref('');

        const favorites = ref(JSON.parse(localStorage.getItem('rema_favs') || '[]'));
        const readHistory = ref(JSON.parse(localStorage.getItem('rema_history') || '{}'));
        const currentTab = ref('home');

        const displayedManga = computed(() => {
            if (currentTab.value === 'fav') return favorites.value;
            if (currentTab.value === 'history') {
                return Object.values(readHistory.value)
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map(h => h.manga);
            }
            return mangasList.value;
        });

        onMounted(() => {
            cariManga('One Piece');
        });

        async function cariManga(query = searchQuery.value) {
            if(currentTab.value !== 'home') currentTab.value = 'home';
            isLoading.value = true;
            try {
                mangasList.value = await fetchMangaPopuler(query);
            } catch (e) {
                // Ignore silent errors for clean UI
            } finally {
                isLoading.value = false;
            }
        }

        function getCoverUrl(manga) {
            const coverRel = manga.relationships?.find(rel => rel.type === "cover_art");
            if (coverRel && coverRel.attributes?.fileName) {
                return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`;
            }
            return "https://via.placeholder.com/200x300/111111/e50914?text=Rema";
        }

        function getTitle(manga) {
            return manga.attributes?.title?.en || Object.values(manga.attributes?.title || {})[0] || "Tanpa Judul";
        }

        function toggleFavorite(event, manga) {
            event.stopPropagation();
            const index = favorites.value.findIndex(m => m.id === manga.id);
            if (index > -1) favorites.value.splice(index, 1);
            else favorites.value.push(manga);
            localStorage.setItem('rema_favs', JSON.stringify(favorites.value));
        }

        function isFavorite(mangaId) {
            return favorites.value.some(m => m.id === mangaId);
        }

        function getHistoryChapter(mangaId) {
            return readHistory.value[mangaId]?.chapterNum || null;
        }

        async function bukaManga(manga) {
            try {
                const chapters = await fetchChapters(manga.id);
                if (chapters.length === 0) {
                    alert("Belum ada chapter untuk manga ini.");
                    return;
                }
                activeChapters.value = chapters;
                activeManga.value = manga;
                activeMangaTitle.value = getTitle(manga);
                currentChapterIndex.value = 0;
                
                const hist = readHistory.value[manga.id];
                if (hist) {
                    const idx = chapters.findIndex(c => c.id === hist.chapterId);
                    if (idx > -1) currentChapterIndex.value = idx;
                }

                isReaderOpen.value = true;
                await loadPages();
            } catch (e) {
                alert("Gagal mengambil daftar chapter.");
            }
        }

        async function loadPages() {
            isReaderLoading.value = true;
            errorMsg.value = '';
            currentPages.value = [];
            try {
                const chapterData = activeChapters.value[currentChapterIndex.value];
                const chapterId = chapterData.id;
                const chapterNum = chapterData.attributes.chapter;

                currentPages.value = await fetchChapterPages(chapterId);
                
                readHistory.value[activeManga.value.id] = {
                    chapterId,
                    chapterNum,
                    manga: activeManga.value,
                    timestamp: Date.now()
                };
                localStorage.setItem('rema_history', JSON.stringify(readHistory.value));

                const readerBox = document.getElementById('reader-box');
                if (readerBox) readerBox.scrollTop = 0;
            } catch (e) {
                errorMsg.value = "Gagal memuat gambar chapter.";
            } finally {
                isReaderLoading.value = false;
            }
        }

        function gantiChapter(arah) {
            currentChapterIndex.value += arah;
            loadPages();
        }

        return {
            mangasList, isLoading, searchQuery, cariManga, getCoverUrl, getTitle,
            isReaderOpen, activeMangaTitle, activeChapters, currentChapterIndex, currentPages, isReaderLoading, errorMsg, bukaManga, gantiChapter,
            currentTab, displayedManga, toggleFavorite, isFavorite, getHistoryChapter
        }
    }
}).mount('#app');