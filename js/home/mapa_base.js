/* ════ mapa_base.js — Mapa Leaflet, controles, mapas base e barra lateral ════ */
import { CARTO_KEY } from '../comum/config.js';

/* ════ Controle de Interface da Barra Flutuante ════ */
const sidebar = document.getElementById('layer-sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('close-sidebar');

if (window.innerWidth <= 920) { sidebar.classList.add('closed'); }

toggleBtn.addEventListener('click', () => { sidebar.classList.remove('closed'); });
closeBtn.addEventListener('click', () => { sidebar.classList.add('closed'); });

// Permite que a escala gráfica do Leaflet utilize múltiplos de 4 (ex: 4 km)
L.Control.Scale.prototype._getRoundNum = function (num) {
    var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
        d = num / pow10;

    d = d >= 10 ? 10 :
        d >= 5 ? 5 :
        d >= 4 ? 4 :
        d >= 3 ? 3 :
        d >= 2 ? 2 : 1;

    return pow10 * d;
};

/* ════ Instância do Mapa ════ */
var isMobileScreen = window.innerWidth <= 768;
var initialZoom = isMobileScreen ? 12 : 12.3;

export var map = L.map('map', {
    center: [-22.83, -43.05],
    zoom: initialZoom,
    zoomSnap: 0.1,
    zoomControl: false 
});

L.control.zoom({ position: 'bottomright' }).addTo(map);

L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false,
    maxWidth: isMobileScreen ? 200 : 160
}).addTo(map);

var RosaDosVentosControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control compass-container');
        container.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="compass-svg">
                <polygon points="50,15 58,45 50,50" fill="#d32f2f"/>
                <polygon points="50,15 42,45 50,50" fill="#b71c1c"/>
                <polygon points="50,85 58,55 50,50" fill="#cfd8dc"/>
                <polygon points="50,85 42,55 50,50" fill="#b0bec5"/>
                <polygon points="85,50 55,42 50,50" fill="#cfd8dc"/>
                <polygon points="85,50 55,58 50,50" fill="#b0bec5"/>
                <polygon points="15,50 45,42 50,50" fill="#cfd8dc"/>
                <polygon points="15,50 45,58 50,50" fill="#b0bec5"/>
                <circle cx="50" cy="50" r="6" fill="#003366"/>
                <circle cx="50" cy="50" r="2" fill="#FFD700"/>
                <text x="50" y="11" font-family="'Audiowide', sans-serif" font-size="14" font-weight="bold" fill="#003366" text-anchor="middle">N</text>
            </svg>`;
        return container;
    }
});
map.addControl(new RosaDosVentosControl());

/* ════ MAPAS BASE ════ */
var basemaps = {
    voyager_nolabels: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png?key=' + CARTO_KEY, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),
    positron_nolabels: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png?key=' + CARTO_KEY, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),
    darkmatter_nolabels: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?key=' + CARTO_KEY, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),
    mtbmap: L.tileLayer('https://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; USGS',
        maxZoom: 18
    }),
    stamen_terrain_bg: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 18
    }),
    osm_cat: L.tileLayer('https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OSM Team</a>',
        maxZoom: 19
    }),
    f4: L.tileLayer('https://tile1.f4map.com/tiles/f4_2d/{z}/{x}/{y}.png', {
        attribution: '&copy; F4 Map | &copy; OpenStreetMap',
        maxZoom: 20
    }),
    esri: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar',
        maxZoom: 19
    })
};

var currentBasemap = basemaps.voyager_nolabels;
currentBasemap.addTo(map);

document.querySelectorAll('input[name="basemap"]').forEach(function(radio) {
    radio.addEventListener('change', function(e) {
        map.removeLayer(currentBasemap);
        currentBasemap = basemaps[e.target.value];
        currentBasemap.addTo(map);
        document.getElementById('card-basemap-name').textContent = e.target.parentElement.textContent.trim();
    });
});

if (window.ResizeObserver) {
    new ResizeObserver(function() { if (map) map.invalidateSize(); }).observe(document.getElementById('map-wrapper'));
}

/* ════ Loader do mapa ════ */
export function ocultarLoader() {
    var l = document.getElementById('map-loader');
    l.classList.add('oculto');
    setTimeout(() => { map.invalidateSize(); }, 420);
}
