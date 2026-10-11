/* ════ graficos.js — Pirâmide racial municipal, rosca de gênero e barras raciais do bairro ════
   Pirâmide e barras: HTML/CSS puro (não usar Chart.js: ver agents.md §3.5).
   Rosca de gênero: Chart.js (global `Chart`), instância sempre destruída antes de recriar. */
import { estado } from './estado.js';
import { corFem, corMasc } from '../comum/config.js';

/* ════ Pirâmide Racial Horizontal Municipal (HTML Customizado) ════ */
export function renderizarRacialMunicipal(dados) {
    var container = document.getElementById('muni-racial-chart-container');

    var maxLado = 0;
    dados.forEach(function(d) {
        if (d.masc > maxLado) maxLado = d.masc;
        if (d.fem  > maxLado) maxLado = d.fem;
    });

    var popMuniTotal = dados.reduce(function(s, d) { return s + d.total; }, 0) || 1;
    var LIMIAR = 22; 

    var html = '<div class="piramide-header">' +
        '<div class="piramide-header-rotulo"></div>' +
        '<div class="piramide-header-masc" style="--cor-masc:' + corMasc + '">Masculino</div>' +
        '<div class="piramide-header-centro">Total<br>racial</div>' +
        '<div class="piramide-header-fem" style="--cor-fem:' + corFem + '">Feminino</div>' +
        '<div class="piramide-header-rotulo"></div>' +
    '</div>';

    dados.forEach(function(d) {
        var wMasc = maxLado > 0 ? ((d.masc / maxLado) * 100).toFixed(2) : 0;
        var wFem  = maxLado > 0 ? ((d.fem  / maxLado) * 100).toFixed(2) : 0;
        var pctRacial = ((d.total / popMuniTotal) * 100).toFixed(1);

        var mascFora = parseFloat(wMasc) < LIMIAR;
        var femFora  = parseFloat(wFem)  < LIMIAR;

        // Inversão do Degradê solicitada (Raça na base central, Sexo na ponta)
        var gradMasc = 'linear-gradient(to left, ' + d.cor + ' 0%, ' + corMasc + ' 100%)';
        var gradFem  = 'linear-gradient(to right, ' + d.cor + ' 0%, ' + corFem + ' 100%)';

        html += '<div class="pir-linha">' +
            '<div class="pir-rotulo esq">' + d.nome + '<span class="pir-emoji">' + d.emoji + '</span></div>' +
            
            '<div class="pir-zona-masc">' +
                '<div class="pir-barra pir-barra-masc' + (mascFora ? ' pir-texto-fora' : '') + '" style="width:' + wMasc + '%;background:' + gradMasc + ';">' +
                    '<span class="pir-barra-texto">' + d.masc.toLocaleString('pt-BR') + '</span>' +
                '</div>' +
            '</div>' +

            '<div class="pir-centro">' +
                '<span class="pir-centro-total">' + d.total.toLocaleString('pt-BR') + '</span>' +
                '<span class="pir-centro-pct">' + pctRacial + '%</span>' +
            '</div>' +

            '<div class="pir-zona-fem">' +
                '<div class="pir-barra pir-barra-fem' + (femFora ? ' pir-texto-fora' : '') + '" style="width:' + wFem + '%;background:' + gradFem + ';">' +
                    '<span class="pir-barra-texto">' + d.fem.toLocaleString('pt-BR') + '</span>' +
                '</div>' +
            '</div>' +

            '<div class="pir-rotulo dir"><span class="pir-emoji">' + d.emoji + '</span>' + d.nome + '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

/* ════ Gráfico de Doughnut de Gênero ════ */
export function renderizarPizzaGeral(masc, fem) {
    if (estado.graficoSexo) { estado.graficoSexo.destroy(); estado.graficoSexo = null; }
    var ctx = document.getElementById('chart-sexo').getContext('2d');
    var total = masc + fem || 1;

    estado.graficoSexo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
                data: [masc || 0, fem || 0],
                backgroundColor: [corMasc, corFem],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2, hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function(ctx) { return '  ' + ctx.parsed.toLocaleString('pt-BR') + ' hab. (' + ((ctx.parsed / total) * 100).toFixed(1) + '%)'; } } }
            }
        }
    });

    var box = document.getElementById('gender-ratio-box');
    var html = '';
    if (fem > masc && masc > 0) {
        var r = (fem / masc).toFixed(1).replace('.', ',');
        html = '<span style="font-size:.70rem;font-weight:900;color:' + corFem + ';">' + r + ' mulheres</span>' +
               '<br><span style="font-size:.7rem;color:#003366;font-weight:700;letter-spacing:.04em;">para cada</span>' +
               '<br><span style="font-size:.70rem;font-weight:900;color:' + corMasc + ';">homem</span>';
    } else if (masc > fem && fem > 0) {
        var r = (masc / fem).toFixed(1).replace('.', ',');
        html = '<span style="font-size:.70rem;font-weight:900;color:' + corMasc + ';">' + r + ' homens</span>' +
               '<br><span style="font-size:.7rem;color:#003366;font-weight:700;letter-spacing:.04em;">para cada</span>' +
               '<br><span style="font-size:.70rem;font-weight:900;color:' + corFem + ';">mulher</span>';
    } else if (masc > 0 && fem > 0 && masc === fem) {
        html = '<span style="font-size:.72rem;font-weight:bold;color:#003366;">Proporção<br>Exata</span>';
    } else {
        html = '<span style="font-size:.68rem;font-weight:bold;color:#6b8ba4;">Sem Dados</span>';
    }
    box.innerHTML = html;
}

/* ════ Barras Horizontais Raciais do Bairro (HTML/CSS) ════ */
export function renderizarBarrasBairroHTML(dados) {
    var container = document.getElementById('chart-racial-bairro-piramide');
    if (!container) return;

    var maxTotal = 0;
    dados.forEach(function(d) { if (d.total > maxTotal) maxTotal = d.total; });

    var popBairroTotal = dados.reduce(function(s, d) { return s + d.total; }, 0) || 1;
    var LIMIAR = 20;
    var html = '';

    dados.forEach(function(d) {
        var pct     = maxTotal > 0 ? ((d.total / maxTotal) * 100).toFixed(2) : 0;
        var pctBairro = ((d.total / popBairroTotal) * 100).toFixed(1);
        var textoFora = parseFloat(pct) < LIMIAR;

        html += '<div class="brb-linha">' +
            '<div class="brb-rotulo">' +
                '<span class="brb-emoji">' + d.emoji + '</span>' + d.nome +
            '</div>' +
            '<div class="brb-barra-wrap">' +
                '<div class="brb-barra-fill" style="width:' + pct + '%;background:' + d.cor + ';">' +
                    '<span class="brb-barra-label' + (textoFora ? ' fora' : '') + '">' + d.total.toLocaleString('pt-BR') + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="brb-valor-abs">' + pctBairro + '%</div>' +
        '</div>';
    });

    container.innerHTML = html;
}
