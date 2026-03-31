document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do Widget de Clima ---
    async function fetchWeather() {
            try {
                const url = 'https://api.weatherapi.com/v1/current.json?key=5b0efbae2b8049a1ad4224136262802&q=-22.824932845750787,-43.049169269427146&aqi=no&lang=pt';
                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`HTTP: ${response.status}`);
                
                const data = await response.json();
                
                // Atualização dos elementos
                document.getElementById('temp-value').textContent = `${Math.round(data.current.temp_c)}°C`;
                document.getElementById('condition-text').textContent = data.current.condition.text;
                document.getElementById('precip-value').textContent = `Chuva: ${data.current.precip_mm} mm`;
                
                const iconElement = document.getElementById('weather-icon');
                let iconUrl = data.current.condition.icon;
                iconElement.src = iconUrl.startsWith('//') ? 'https:' + iconUrl : iconUrl;
                iconElement.style.display = 'block';

            } catch (error) {
                console.error("Erro na meteorologia:", error);
                document.getElementById('condition-text').textContent = "Erro";
            }
        }
    
    fetchWeather();

    // --- Lógica do Reprodutor de Áudio (Executa apenas se o player existir na página) ---
    const audio = document.getElementById('hino-audio');
    if (audio) {
        const playBtn = document.getElementById('play-pause-btn');
        const currentTimeEl = document.getElementById('current-time');
        const progressBar = document.getElementById('progress-bar');
        const volumeBar = document.getElementById('volume-bar');
        const muteBtn = document.getElementById('mute-btn');

        function formatTime(seconds) {
            if (isNaN(seconds)) return "0:00";
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        audio.addEventListener('loadedmetadata', () => {
            progressBar.max = Math.floor(audio.duration || 272);
        });

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.textContent = '⏸';
                playBtn.title = 'Pausar';
            } else {
                audio.pause();
                playBtn.textContent = '▶';
                playBtn.title = 'Reproduzir';
            }
        });

        audio.addEventListener('timeupdate', () => {
            progressBar.value = Math.floor(audio.currentTime);
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        progressBar.addEventListener('input', () => {
            audio.currentTime = progressBar.value;
        });

        volumeBar.addEventListener('input', () => {
            audio.volume = volumeBar.value / 100;
            muteBtn.textContent = audio.volume === 0 ? '🔇' : '🔊';
        });

        let previousVolume = 1;
        muteBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                previousVolume = audio.volume;
                audio.volume = 0;
                volumeBar.value = 0;
                muteBtn.textContent = '🔇';
            } else {
                audio.volume = previousVolume;
                volumeBar.value = previousVolume * 100;
                muteBtn.textContent = '🔊';
            }
        });
    }
});