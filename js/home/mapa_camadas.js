/* ════ mapa_camadas.js — Montagem das camadas, panes, grupo Meteorologia e legendas ════ */
import { map } from './mapa_base.js';
import { estado } from './estado.js';
import { OPENWEATHER_KEY } from '../comum/config.js';
import { getProp } from '../comum/utils.js';
import { criarCamadaBairros } from './bairros.js';

map.on('layeradd layerremove', atualizarContadorCamadas);

function atualizarContadorCamadas() {
    var mapOverlays = estado.mapOverlays;
    if (Object.keys(mapOverlays).length === 0) return;
    var total = Object.keys(mapOverlays).length;
    var ativas = 0;
    for (var key in mapOverlays) { if (map.hasLayer(mapOverlays[key])) ativas++; }

    var elAtivas = document.getElementById('card-camadas-ativas');
    var elTotal = document.getElementById('card-camadas-total');
    if (elAtivas) elAtivas.textContent = ativas;
    if (elTotal) elTotal.textContent = 'de ' + total + ' camadas disponíveis';
}

/* ════ Configuração das Camadas ════ */
export function montarCamadas(geoZonas, geoDistritos, geoSedesD, geoSedeM) {
    novoPane('pClima', 350);
    novoPane('pZonas', 402); novoPane('pBairros', 403); novoPane('pDistritos', 404);
    novoPane('pSedesD', 405); novoPane('pSedeM', 406); novoPane('pArea', 407);

    if (estado.geoAreaMunicipal) {
        L.geoJSON(estado.geoAreaMunicipal, { pane: 'pArea', interactive: false, style: { color: '#00008B', weight: 3, fillOpacity: 0 } }).addTo(map);
    }

    var mapOverlays = {};
    estado.mapOverlays = mapOverlays;

    var lz = camadaPoly(geoZonas, { pane: 'pZonas', estilo: { color: '#232323', weight: 1, fillOpacity: 0 }, campos: ['zona_eleitoral', 'area_km2'] });
    if (lz) mapOverlays['Zonas Eleitorais'] = lz;

    estado.layerBairros = criarCamadaBairros();
    if (estado.layerBairros) { mapOverlays['Bairros'] = estado.layerBairros; estado.layerBairros.addTo(map); }

    var cDistritos = { 'São Gonçalo': { cor: '#00008B', fill: 'rgba(0,0,139,0.12)' }, 'Ipiíba': { cor: '#0a6b1c', fill: 'rgba(10,107,28,0.12)' }, 'Monjolo': { cor: '#ca8413', fill: 'rgba(202,132,19,0.12)' }, 'Neves': { cor: '#686868', fill: 'rgba(104,104,104,0.12)' }, 'Sete Pontes': { cor: '#e31a1c', fill: 'rgba(227,26,28,0.12)' } };
    var ld = camadaPoly(geoDistritos, { pane: 'pDistritos', estiloFn: function(f) { var nm = getProp(f.properties, 'nm_distr') || ''; var c = cDistritos[nm] || { cor: '#888', fill: 'rgba(136,136,136,0.12)' }; return { pane: 'pDistritos', color: c.cor, weight: 3, fillColor: c.fill, fillOpacity: 1 }; }, campos: ['nm_distr', 'area_km2', 'nm_munic'] });
    if (ld) mapOverlays['Distritos'] = ld;

    var lsd = camadaPonto(geoSedesD, { pane: 'pSedesD', rExt: 6, rInt: 3, corBorda: '#232323', fillExt: '#fff', campos: ['nome'] });
    if (lsd) mapOverlays['Sedes Distritais'] = lsd;

    var lsm = camadaPonto(geoSedeM, { pane: 'pSedeM', rExt: 7.5, rInt: 2.5, corBorda: '#000', fillExt: '#fff', campos: ['nome'] });
    if (lsm) mapOverlays['Sede Municipal'] = lsm;

    /* ── Camadas Meteorológicas (OpenWeatherMap) ── */
    var layerTemp = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=' + OPENWEATHER_KEY, {
        pane: 'pClima',
        maxZoom: 18,
        opacity: 0.7,
        attribution: '&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
    });
    mapOverlays['Temperatura (°C)'] = layerTemp;

    var layerPrecip = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + OPENWEATHER_KEY, {
        pane: 'pClima',
        maxZoom: 18,
        opacity: 0.7,
        attribution: '&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
    });
    mapOverlays['Precipitação (mm/h)'] = layerPrecip;

    var layerControl = L.control.layers(null, mapOverlays, { collapsed: false });
    layerControl.addTo(map);
    var sidebarContent = document.getElementById('layer-sidebar-content');
    sidebarContent.appendChild(layerControl.getContainer());

    /* ── Grupo Colapsável "Meteorologia" no Menu de Camadas ── */
    var overlaysContainer = sidebarContent.querySelector('.leaflet-control-layers-overlays');
    if (overlaysContainer) {
        var labels = Array.from(overlaysContainer.querySelectorAll('label'));
        var labelTemp = labels.find(function(l) { return l.textContent.indexOf('Temperatura') !== -1; });
        var labelPrecip = labels.find(function(l) { return l.textContent.indexOf('Precipitação') !== -1; });

        if (labelTemp && labelPrecip) {
            var groupDiv = document.createElement('div');
            groupDiv.className = 'layer-group-item';

            var groupHeader = document.createElement('div');
            groupHeader.className = 'layer-group-header open';
            groupHeader.innerHTML = `
                <svg class="group-chevron" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span>Meteorologia</span>
            `;

            var groupChildren = document.createElement('div');
            groupChildren.className = 'layer-group-children';
            groupChildren.appendChild(labelTemp);
            groupChildren.appendChild(labelPrecip);

            groupHeader.addEventListener('click', function(e) {
                e.stopPropagation();
                groupHeader.classList.toggle('open');
                groupChildren.classList.toggle('closed');
            });

            groupDiv.appendChild(groupHeader);
            groupDiv.appendChild(groupChildren);
            overlaysContainer.appendChild(groupDiv);
        }
    }

    /* ── Sincronização das Legendas Gráficas no Centro Inferior ── */
    function atualizarLegendasClima() {
        var hasTemp = map.hasLayer(layerTemp);
        var hasPrecip = map.hasLayer(layerPrecip);
        var legendContainer = document.getElementById('weather-legend-container');
        var cardTemp = document.getElementById('legend-temp');
        var cardPrecip = document.getElementById('legend-precip');

        if (!legendContainer || !cardTemp || !cardPrecip) return;

        cardTemp.style.display = hasTemp ? 'block' : 'none';
        cardPrecip.style.display = hasPrecip ? 'block' : 'none';

        if (hasTemp || hasPrecip) {
            legendContainer.style.display = 'flex';
        } else {
            legendContainer.style.display = 'none';
        }
    }

    map.on('layeradd layerremove', atualizarLegendasClima);
    atualizarLegendasClima();
    atualizarContadorCamadas();
}

function novoPane(nome, z) { map.createPane(nome).style.zIndex = z; }

function camadaPoly(data, opts) {
    if (!data) return null;
    return L.geoJSON(data, { pane: opts.pane, interactive: true, style: opts.estiloFn || function() { return Object.assign({ pane: opts.pane }, opts.estilo || {}); }, onEachFeature: function(f, l) { bindPopupCampos(f, l, opts.campos); } });
}

function camadaPonto(data, opts) {
    if (!data) return null;
    var grupo = L.layerGroup();
    L.geoJSON(data, { pane: opts.pane, pointToLayer: function(f, ll) { return L.circleMarker(ll, { pane: opts.pane, radius: opts.rExt, color: opts.corBorda, weight: 1.5, fillColor: opts.fillExt, fillOpacity: 1 }); }, onEachFeature: function(f, l) { bindPopupCampos(f, l, opts.campos); } }).addTo(grupo);
    L.geoJSON(data, { pane: opts.pane, pointToLayer: function(f, ll) { return L.circleMarker(ll, { pane: opts.pane, radius: opts.rInt, color: opts.corBorda, weight: 1, fillColor: opts.corBorda, fillOpacity: 1 }); } }).addTo(grupo);
    return grupo;
}

function bindPopupCampos(feature, layer, campos) {
    if (!campos || !campos.length) return;
    var html = '<div style="font-family:\'National Park\',sans-serif;font-size:.8rem;line-height:1.5">';
    campos.forEach(c => { var val = getProp(feature.properties || {}, c); if (val != null) html += '<b>' + c + '</b>: ' + val + '<br>'; });
    html += '</div>';
    layer.bindPopup(html, { maxWidth: 240 });
}
