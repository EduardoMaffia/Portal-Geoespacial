/* ════ player_hino.js — Reprodutor de áudio do hino (simbolos.html) ════
   Extraído de script.js sem alterar a lógica. Executa apenas se o player
   existir na página. Carregar com <script type="module" src="js/simbolos/player_hino.js"> */

document.addEventListener('DOMContentLoaded', () => {

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
