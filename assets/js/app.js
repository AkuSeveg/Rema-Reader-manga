if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

// UBAH IMPORT MENJADI api.js
import { fetchMangaPopuler, fetchChapters, fetchChapterPages } from './api.js';

const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const mangasList = ref([]);
        const isLoading = ref(true);
        const searchQuery = ref('');

        const isChapterListOpen = ref(false);
        const chapterSortDesc = ref(true);

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

        const sortedChapters = computed(() => {
            let chaps = [...activeChapters.value];
            return chapterSortDesc.value ? chaps.reverse() : chaps;
        });

        onMounted(() => {
            cariManga('Jujutsu Kaisen'); // Default loading keren
        });

        async function cariManga(query = searchQuery.value) {
            if(currentTab.value !== 'home') currentTab.value = 'home';
            isLoading.value = true;
            try {
                mangasList.value = await fetchMangaPopuler(query);
            } catch (e) {
                alert("Gagal memuat manga: " + e.message);
                mangasList.value = [];
            } finally {
                isLoading.value = false;
            }
        }

        function toggleFavorite(event, manga) {
            if (event) event.stopPropagation();
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

        async function bukaDetail(manga) {
            try {
                const chapters = await fetchChapters(manga.id);
                if (chapters.length === 0) {
                    alert("Belum ada chapter terjemahan untuk manga ini.");
                    return;
                }
                activeChapters.value = chapters;
                activeManga.value = manga;
                activeMangaTitle.value = manga.title;
                isChapterListOpen.value = true;
            } catch (e) {
                alert("Gagal mengambil daftar chapter.");
            }
        }

        async function bacaChapter(chapter) {
            const idx = activeChapters.value.findIndex(c => c.id === chapter.id);
            currentChapterIndex.value = idx > -1 ? idx : 0;
            isChapterListOpen.value = false;
            isReaderOpen.value = true;
            await loadPages();
        }

        async function lanjutBaca() {
            const hist = readHistory.value[activeManga.value.id];
            if (hist) {
                const idx = activeChapters.value.findIndex(c => c.id === hist.chapterId);
                currentChapterIndex.value = idx > -1 ? idx : 0;
            } else {
                currentChapterIndex.value = 0;
            }
            isChapterListOpen.value = false;
            isReaderOpen.value = true;
            await loadPages();
        }

        async function loadPages() {
            isReaderLoading.value = true;
            errorMsg.value = '';
            currentPages.value = [];
            try {
                const chapterData = activeChapters.value[currentChapterIndex.value];
                const chapterId = chapterData.id;
                const chapterNum = chapterData.chapter;

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
            mangasList, isLoading, searchQuery, cariManga,
            isChapterListOpen, chapterSortDesc, sortedChapters, bukaDetail, bacaChapter, lanjutBaca,
            isReaderOpen, activeManga, activeMangaTitle, activeChapters, currentChapterIndex, currentPages, isReaderLoading, errorMsg, gantiChapter,
            currentTab, displayedManga, toggleFavorite, isFavorite, getHistoryChapter
        }
    }
}).mount('#app');
