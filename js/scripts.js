document.addEventListener('DOMContentLoaded', () => {
    const quoteText = document.getElementById('quote-text');
    const generateQuoteButton = document.getElementById('generate-quote');
    const showTafsirButton = document.getElementById('show-tafsir');
    const screenshotQuoteButton = document.getElementById('screenshot-quote');

    let hadisData = [];
    let currentQuote = {
        surahNumber: null,
        ayahNumber: null,
        isHadis: false
    };

    async function fetchRandomQuranQuote() {
        const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
        const surahData = await loadSurahData(randomSurahNumber);

        if (surahData) {
            const numberOfAyah = parseInt(surahData.number_of_ayah);
            const randomAyahNumber = Math.floor(Math.random() * numberOfAyah) + 1;

            const ayahText = surahData.text[randomAyahNumber];
            const ayahTranslation = surahData.translations.id.text[randomAyahNumber];

            quoteText.innerHTML = `
                <p class="arabic">${ayahText}</p>
                <p class="translation">${ayahTranslation}</p>
                <p class="surah-info">QS. ${surahData.name_latin} : ${randomAyahNumber}</p>
            `;

            currentQuote.surahNumber = randomSurahNumber;
            currentQuote.ayahNumber = randomAyahNumber;
            currentQuote.isHadis = false;

            showTafsirButton.style.display = 'inline-block';
        }
    }

    async function fetchRandomHadisQuote() {
        if (hadisData.length === 0) {
            await loadHadisData();
        }

        const randomIndex = Math.floor(Math.random() * hadisData.length);
        const quote = hadisData[randomIndex];

        if (quote) {
            quoteText.innerHTML = `
                <p class="arabic">${quote.arab}</p>
                <p class="translation">${quote.id}</p>
                <p class="hadis-info">(${quote.kitab} No. ${quote.number})</p>
            `;

            currentQuote.isHadis = true;
            showTafsirButton.style.display = 'none';
        }
    }

    async function showTafsir() {
        if (currentQuote.isHadis) {
            return;
        }

        if (currentQuote.surahNumber && currentQuote.ayahNumber) {
            const surahData = await loadSurahData(currentQuote.surahNumber);
            const ayahTafsir = surahData.tafsir.id.kemenag.text[currentQuote.ayahNumber];

            quoteText.innerHTML = `
                <div class="quote-card">
                    <p class="tafsir">${ayahTafsir}</p>
                    <p class="surah-info">QS. ${surahData.name_latin} : ${currentQuote.ayahNumber}</p>
                </div>
            `;
        }
    }

    async function loadSurahData(surahNumber) {
        try {
            const response = await fetch(`alquran/${surahNumber}.json`);
            const data = await response.json();
            return data[surahNumber]; // Mengakses data surah berdasarkan nomor surah
        } catch (error) {
            console.error('Error loading surah data:', error);
            return null;
        }
    }

    async function loadHadisData() {
        try {
            const response = await fetch('hadits/bukhari.json');
            if (!response.ok) {
                console.error("Failed to load Hadis data:", response.status, response.statusText);
                return;
            }
            hadisData = await response.json();
        } catch (error) {
            console.error('Error loading hadis data:', error);
        }
    }

    function getCurrentQuoteText() {
        return quoteText.innerText;
    }

    function takeScreenshot() {
        const quoteCard = document.querySelector(".quote-card");
        
        // Membuat style untuk tampilan screenshot
        const styles = `
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .quote-card { background: white; padding: 20px; max-width: 600px; margin: 0 auto; }
                .arabic { font-size: 24px; font-family: 'Amiri', serif; text-align: right; }
                .translation { font-size: 18px; color: #555; }
                .surah-info, .hadis-info { font-size: 14px; color: #888; }
                .website-link { margin-top: 20px; text-align: center; }
                .website-link a { color: #007BFF; text-decoration: none; }
            </style>
        `;

        // Membuat jendela baru dengan konten yang akan di-screenshot
        const newWindow = window.open();
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet">
                ${styles}
            </head>
            <body>
                <div class="quote-card">
                    ${quoteCard.innerHTML}
                </div>
                <div class="website-link">
                    <a href="https://yourwebsite.com">https://yourwebsite.com</a>
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();
    }

    generateQuoteButton.addEventListener('click', () => {
        const randomChoice = Math.random() < 0.5;
        if (randomChoice) {
            fetchRandomQuranQuote();
        } else {
            fetchRandomHadisQuote();
        }
    });

    showTafsirButton.addEventListener('click', showTafsir);

    screenshotQuoteButton.addEventListener('click', takeScreenshot);

    loadHadisData();

    // Theme Switcher
    const themeSwitchers = {
        'theme-light': 'light',
        'theme-dark': 'dark',
        'theme-sepia': 'sepia',
        'theme-cozy': 'cozy',
        'theme-forest': 'forest'
    };

    Object.keys(themeSwitchers).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                document.documentElement.setAttribute('data-theme', themeSwitchers[id]);
                localStorage.setItem('theme', themeSwitchers[id]);
            });
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});