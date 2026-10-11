/* ════ clima.js — Widget de clima do cabeçalho (todas as páginas) ════
   Extraído de script.js sem alterar a lógica. Carregar com
   <script type="module" src="js/comum/clima.js"> */
import { WEATHERAPI_KEY, CLIMA_COORD } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica do Widget de Clima ---
    async function fetchWeather() {
        try {
            const url = 'https://api.weatherapi.com/v1/current.json?key=' + WEATHERAPI_KEY + '&q=' + CLIMA_COORD + '&aqi=no&lang=pt';
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

});
