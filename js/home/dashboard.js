/* ════ dashboard.js — Abas, KPIs municipais e cálculo por bairro (join por nm_bairro: ver agents.md §3.4) ════ */
import { estado } from './estado.js';
import { getProp, limparCodigo } from '../comum/utils.js';
import { coresRaca } from '../comum/config.js';
import { renderizarRacialMunicipal, renderizarPizzaGeral, renderizarBarrasBairroHTML } from './graficos.js';

/* ════ Controle de Abas ════ */
export function mostrarPagina(n) {
    document.querySelectorAll('.dash-pagina').forEach(p => p.classList.remove('ativa'));
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('ativa'));
    document.getElementById('pagina-' + n).classList.add('ativa');
    document.getElementById('tab-' + n).classList.add('ativa');
}

/* Ligação das abas e do botão "Analisar por Bairro" (substitui onclick inline) */
export function iniciarAbas() {
    document.getElementById('tab-1').addEventListener('click', function() { mostrarPagina(1); });
    document.getElementById('tab-2').addEventListener('click', function() { mostrarPagina(2); });
    document.getElementById('btn-ir-bairro').addEventListener('click', function() { mostrarPagina(2); });
}

/* ════ Inicializa Dados ════ */
export function iniciarDashboard() {
    var geoAreaMunicipal = estado.geoAreaMunicipal;
    var geoBairros = estado.geoBairros;
    var dadosPop = estado.dadosPop;
    var dadosRaciais = estado.dadosRaciais;

    if (geoAreaMunicipal) {
        var features = geoAreaMunicipal.features || [geoAreaMunicipal];
        features.forEach(f => {
            var v = getProp(f.properties, 'area_km2');
            if (v != null) document.getElementById('card-area').textContent = parseFloat(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        });
    }

    var popTot = 0;
    dadosPop.forEach(r => popTot += parseInt(getProp(r, 'populacao'), 10) || 0);
    document.getElementById('card-pop').textContent = popTot > 0 ? popTot.toLocaleString('pt-BR') : '—';

    // --- Somas para a Diversidade Racial Municipal ---
    var totB = 0, mascB = 0, femB = 0;
    var totP = 0, mascP = 0, femP = 0;
    var totA = 0, mascA = 0, femA = 0;
    var totPa = 0, mascPa = 0, femPa = 0;
    var totI = 0, mascI = 0, femI = 0;

    dadosRaciais.forEach(row => {
        totB += parseInt(getProp(row, 'brancos'), 10) || 0;
        mascB += parseInt(getProp(row, 'masc_brancos'), 10) || 0;
        femB += parseInt(getProp(row, 'fem_brancas'), 10) || 0;

        totP += parseInt(getProp(row, 'pretos'), 10) || 0;
        mascP += parseInt(getProp(row, 'masc_pretos'), 10) || 0;
        femP += parseInt(getProp(row, 'fem_pretas'), 10) || 0;

        totA += parseInt(getProp(row, 'amarelos'), 10) || 0;
        mascA += parseInt(getProp(row, 'masc_amarelos'), 10) || 0;
        femA += parseInt(getProp(row, 'fem_amarelas'), 10) || 0;

        totPa += parseInt(getProp(row, 'pardos'), 10) || 0;
        mascPa += parseInt(getProp(row, 'masc_pardos'), 10) || 0;
        femPa += parseInt(getProp(row, 'fem_pardas'), 10) || 0;

        totI += parseInt(getProp(row, 'indigenas'), 10) || 0;
        mascI += parseInt(getProp(row, 'masc_indigenas'), 10) || 0;
        femI += parseInt(getProp(row, 'fem_indigenas'), 10) || 0;
    });

    var dadosMuniHTML = [
        { nome: 'Brancos', emoji: '✋🏻', total: totB, masc: mascB, fem: femB, cor: coresRaca.branco },
        { nome: 'Pretos', emoji: '✋🏿', total: totP, masc: mascP, fem: femP, cor: coresRaca.preto },
        { nome: 'Amarelos', emoji: '✋', total: totA, masc: mascA, fem: femA, cor: coresRaca.amarelo },
        { nome: 'Pardos', emoji: '✋🏽', total: totPa, masc: mascPa, fem: femPa, cor: coresRaca.pardo },
        { nome: 'Indígenas', emoji: '✋🏾', total: totI, masc: mascI, fem: femI, cor: coresRaca.indigena }
    ];
    
    renderizarRacialMunicipal(dadosMuniHTML);

    var sel = document.getElementById('bairro-select');
    var nomes = [];
    if (geoBairros && geoBairros.features) {
        geoBairros.features.forEach(f => {
            var nm = getProp(f.properties, 'nm_bairro');
            if (nm && nomes.indexOf(nm) < 0) nomes.push(nm);
        });
    }
    nomes.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    nomes.forEach(nm => {
        var o = document.createElement('option'); o.value = nm; o.textContent = nm; sel.appendChild(o);
    });
}

/* ── LÓGICA E CÁLCULO POR BAIRRO ── */
export function calcularBairro(nmBairro) {
    var geoBairros = estado.geoBairros;
    var geoSetores = estado.geoSetores;
    var dadosPop = estado.dadosPop;
    var dadosRaciais = estado.dadosRaciais;

    var areaTotalBairro = 0;
    if (geoBairros && geoBairros.features) {
        geoBairros.features.forEach(f => {
            var p = f.properties || {};
            if (getProp(p, 'nm_bairro') === nmBairro && getProp(p, 'area_km2') != null) {
                areaTotalBairro += parseFloat(getProp(p, 'area_km2')) || 0;
            }
        });
    }
    document.getElementById('bairro-area-valor').textContent = areaTotalBairro > 0 ? areaTotalBairro.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';

    var codigos = new Set();
    if (geoSetores && geoSetores.features) {
        geoSetores.features.forEach(f => {
            var p = f.properties || {};
            if (getProp(p, 'nm_bairro') !== nmBairro) return; 
            var cod = limparCodigo(getProp(p, 'cod_setor'));
            if (cod !== '' && cod !== 'undefined' && cod !== 'null') codigos.add(cod);
        });
    }

    var popT = 0, popM = 0, popF = 0;
    dadosPop.forEach(row => {
        var codRow = limparCodigo(getProp(row, 'cod_setor'));
        if (!codigos.has(codRow)) return; 
        popT += parseInt(getProp(row, 'populacao'), 10)     || 0;
        popM += parseInt(getProp(row, 'pop_masculina'), 10) || 0;
        popF += parseInt(getProp(row, 'pop_feminina'), 10)  || 0;
    });

    document.getElementById('bairro-pop-valor').textContent = popT > 0 ? popT.toLocaleString('pt-BR') : '0';
    document.getElementById('bairro-pop-sub').textContent = nmBairro + ' · ' + codigos.size + ' setor(es) censitário(s)';

    var tot = popT || 1; 
    document.getElementById('leg-masc').textContent = popM.toLocaleString('pt-BR') + ' hab. (' + ((popM / tot) * 100).toFixed(1) + '%)';
    document.getElementById('leg-fem').textContent = popF.toLocaleString('pt-BR') + ' hab. (' + ((popF / tot) * 100).toFixed(1) + '%)';

    renderizarPizzaGeral(popM, popF);

    var bB = 0, bP = 0, bA = 0, bPa = 0, bI = 0;
    dadosRaciais.forEach(row => {
        var codRow = limparCodigo(getProp(row, 'cod_setor'));
        if (!codigos.has(codRow)) return; 

        bB  += parseInt(getProp(row, 'brancos'), 10) || 0;
        bP  += parseInt(getProp(row, 'pretos'), 10) || 0;
        bA  += parseInt(getProp(row, 'amarelos'), 10) || 0;
        bPa += parseInt(getProp(row, 'pardos'), 10) || 0;
        bI  += parseInt(getProp(row, 'indigenas'), 10) || 0;
    });

    var dadosBairro = [
        { nome: 'Brancos',   emoji: '✋🏻', total: bB,  cor: coresRaca.branco   },
        { nome: 'Pretos',    emoji: '✋🏿', total: bP,  cor: coresRaca.preto    },
        { nome: 'Amarelos',  emoji: '✋',  total: bA,  cor: coresRaca.amarelo  },
        { nome: 'Pardos',    emoji: '✋🏽', total: bPa, cor: coresRaca.pardo    },
        { nome: 'Indígenas', emoji: '✋🏾', total: bI,  cor: coresRaca.indigena }
    ];

    renderizarBarrasBairroHTML(dadosBairro);
}
