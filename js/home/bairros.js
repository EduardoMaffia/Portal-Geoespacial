/* ════ bairros.js — Camada de bairros, estilos e seleção (mapa ⇄ seletor ⇄ dashboard) ════ */
import { map } from './mapa_base.js';
import { estado } from './estado.js';
import { getProp } from '../comum/utils.js';
import { mostrarPagina, calcularBairro } from './dashboard.js';

export function criarCamadaBairros() {
    if (!estado.geoBairros) return null;
    return L.geoJSON(estado.geoBairros, {
        pane: 'pBairros', interactive: true, style: estiloNormal,
        onEachFeature: function(feature, layer) {
            var nm = getProp(feature.properties, 'nm_bairro') || '';
            layer.bindTooltip(nm, { sticky: true, direction: 'top', className: 'leaflet-tooltip' });
            layer.on('mouseover', () => { if (nm !== document.getElementById('bairro-select').value) layer.setStyle(estiloHover()); });
            layer.on('mouseout', () => { if (nm !== document.getElementById('bairro-select').value) layer.setStyle(estiloNormal()); });
            layer.on('click', () => { mostrarPagina(2); selecionarBairro(nm, layer); });
        }
    });
}

var estiloNormal = function() { return { color: '#515151', weight: 2, fillOpacity: 0 }; };
var estiloHover  = function() { return { color: '#87CEFA', weight: 2.5, fillOpacity: .18, fillColor: '#87CEFA' }; };
var estiloAtivo  = function() { return { color: '#003366', weight: 3, fillOpacity: .22, fillColor: '#003366' }; };

/* ════ Seleção de Bairros ════ */
export function aoSelecionarBairro() {
    var nm = document.getElementById('bairro-select').value;
    if (!nm) { limparFiltro(); return; }
    selecionarBairro(nm);
}

export function selecionarBairro(nmBairro, leafletLayer) {
    var sel = document.getElementById('bairro-select');
    if (sel.value !== nmBairro) sel.value = nmBairro;

    if (estado.layerDestacado) { try { estado.layerDestacado.setStyle(estiloNormal()); } catch(e) {} }
    
    if (estado.layerBairros && !map.hasLayer(estado.layerBairros)) map.addLayer(estado.layerBairros);

    var bounds = L.latLngBounds();
    var encontrouCamada = false;

    if (estado.layerBairros) {
        estado.layerBairros.eachLayer(function(l) {
            var nLayer = getProp(l.feature.properties, 'nm_bairro');
            if (nLayer === nmBairro) {
                l.setStyle(estiloAtivo());
                bounds.extend(l.getBounds());
                encontrouCamada = true;
                if (!leafletLayer) estado.layerDestacado = l;
            } else {
                l.setStyle(estiloNormal());
            }
        });
    }
    if (leafletLayer) estado.layerDestacado = leafletLayer;

    if (encontrouCamada) { try { map.fitBounds(bounds, { padding: [40, 40] }); } catch(e) {} }

    document.getElementById('bairro-placeholder').classList.add('oculto');
    document.getElementById('p2-col-center').classList.add('visivel');
    document.getElementById('bairro-chart-wrap').classList.add('visivel');

    calcularBairro(nmBairro);
}

export function limparFiltro() {
    document.getElementById('bairro-select').value = '';
    document.getElementById('bairro-placeholder').classList.remove('oculto');
    document.getElementById('p2-col-center').classList.remove('visivel');
    document.getElementById('bairro-chart-wrap').classList.remove('visivel');

    if (estado.layerDestacado) { try { estado.layerDestacado.setStyle(estiloNormal()); } catch(e) {} estado.layerDestacado = null; }
    if (estado.layerBairros) { estado.layerBairros.eachLayer(l => l.setStyle(estiloNormal())); }
    if (estado.graficoSexo) { estado.graficoSexo.destroy(); estado.graficoSexo = null; }
    mostrarPagina(1);
}

/* ════ Ligação dos controles do painel de bairro (substitui onchange/onclick inline) ════ */
export function iniciarControlesBairro() {
    document.getElementById('bairro-select').addEventListener('change', aoSelecionarBairro);
    document.getElementById('btn-limpar-filtro').addEventListener('click', limparFiltro);
}
