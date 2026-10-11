/* ════ main.js — Bootstrap da home: carga dos dados e orquestração dos módulos ════ */
import { BASE_GEO, BASE_TAB } from '../comum/config.js';
import { carregarJSON, parsePandasJSON } from '../comum/utils.js';
import { estado } from './estado.js';
import { ocultarLoader } from './mapa_base.js';
import { montarCamadas } from './mapa_camadas.js';
import { iniciarAbas, iniciarDashboard } from './dashboard.js';
import { iniciarControlesBairro } from './bairros.js';

/* Ligação dos controles da interface (substitui os handlers inline do HTML) */
iniciarAbas();
iniciarControlesBairro();

/* ════ Busca Assíncrona ════ */
Promise.all([
    carregarJSON(BASE_GEO + 'area_municipal.geojson'),
    carregarJSON(BASE_GEO + 'bairros.geojson'),
    carregarJSON(BASE_GEO + 'setores_censitarios.geojson'),
    carregarJSON(BASE_GEO + 'zonas_eleitorais.geojson'),
    carregarJSON(BASE_GEO + 'distritos.geojson'),
    carregarJSON(BASE_GEO + 'sedes_distritais.geojson'),
    carregarJSON(BASE_GEO + 'sede_municipal.geojson'),
    carregarJSON(BASE_TAB + 'dados_populacionais.json'),
    carregarJSON(BASE_TAB + 'dados_raciais.json') 
])
.then(function(res) {
    estado.geoAreaMunicipal = res[0]; estado.geoBairros = res[1]; estado.geoSetores = res[2];
    var geoZonas = res[3], geoDistritos = res[4], geoSedesD = res[5], geoSedeM = res[6];
    
    if (!estado.geoBairros && !estado.geoSetores) document.getElementById('alerta-cors').style.display = 'block';

    estado.dadosPop = parsePandasJSON(res[7]);
    estado.dadosRaciais = parsePandasJSON(res[8]);

    montarCamadas(geoZonas, geoDistritos, geoSedesD, geoSedeM);
    iniciarDashboard();
    ocultarLoader();
})
.catch(function(err) { console.error('[SIG] Erro crítico:', err); ocultarLoader(); });
