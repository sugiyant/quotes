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

    let clickCounter = 0; // Tambahkan counter di luar event listener

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
        const currentQuoteHTML = quoteText.innerHTML;
        const currentURL = window.location.origin;
        
        const styles = `
            <style>
                body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                }
                .screenshot-container {
                    background: white;
                    padding: 30px;
                    max-width: 600px;
                    margin: 20px auto;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .arabic { 
                    font-family: 'Amiri', serif;
                    font-size: 28px;
                    line-height: 1.6;
                    text-align: right;
                    margin-bottom: 20px;
                    color: #000;
                }
                .translation { 
                    font-size: 18px;
                    line-height: 1.6;
                    color: #444;
                    margin-bottom: 15px;
                }
                .surah-info, .hadis-info { 
                    font-size: 14px;
                    color: #666;
                    text-align: right;
                }
                .website-link {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .button-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px auto;
                }
                .capture-button, .copy-button {
                    width: 200px;
                    padding: 10px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .capture-button:hover {
                    background: #45a049;
                }
                .copy-button {
                    background: #2196F3;
                }
                .copy-button:hover {
                    background: #1976D2;
                }
                .success-message {
                    display: none;
                    text-align: center;
                    color: #4CAF50;
                    margin-top: 10px;
                }
                .quote-source {
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                    margin-top: 15px;
                    border-top: 1px solid #eee;
                    padding-top: 10px;
                }
            </style>
        `;

        const newWindow = window.open('', '_blank', 'width=700,height=600');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Screenshot Kutipan</title>
                <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet">
                ${styles}
            </head>
            <body>
                <div class="screenshot-container">
                    ${currentQuoteHTML}
                    <div class="quote-source">
                        <p>Sumber: ${currentURL}</p>
                    </div>
                </div>
                <div class="website-link">
                    <p>Sumber: ${currentURL}</p>
                </div>
                <div class="button-container">
                    <button class="capture-button" onclick="captureAndDownload()">📸 Ambil Screenshot</button>
                    <button class="copy-button" onclick="copyToClipboard()">📋 Salin ke Clipboard</button>
                </div>
                <p id="success-message" class="success-message">✅ Berhasil disalin ke clipboard!</p>
                <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
                <script>
                    function captureAndDownload() {
                        const container = document.querySelector('.screenshot-container');
                        html2canvas(container).then(canvas => {
                            // Convert to image and trigger download
                            const image = canvas.toDataURL('image/png');
                            const link = document.createElement('a');
                            link.download = 'kutipan-islami.png';
                            link.href = image;
                            link.click();
                        });
                    }

                    async function copyToClipboard() {
                        const container = document.querySelector('.screenshot-container');
                        try {
                            const canvas = await html2canvas(container);
                            canvas.toBlob(async (blob) => {
                                await navigator.clipboard.write([
                                    new ClipboardItem({
                                        'image/png': blob
                                    })
                                ]);
                                const msg = document.getElementById('success-message');
                                msg.style.display = 'block';
                                setTimeout(() => {
                                    msg.style.display = 'none';
                                }, 2000);
                            });
                        } catch (err) {
                            console.error('Gagal menyalin ke clipboard:', err);
                            alert('Maaf, gagal menyalin ke clipboard');
                        }
                    }
                </script>
            </body>
            </html>
        `);
        newWindow.document.close();
    }

    document.getElementById('generate-quote').addEventListener('click', function() {
        clickCounter++; // Increment counter
        
        // Generate new quote
        const randomChoice = Math.random() < 0.5;
        if (randomChoice) {
            fetchRandomQuranQuote();
        } else {
            fetchRandomHadisQuote();
        }
        
        // Check for reload
        if (clickCounter >= 15) {
            clickCounter = 0;
            setTimeout(() => {
                location.reload();
            }, 500);
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