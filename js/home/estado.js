/* ════ estado.js — Estado compartilhado entre os módulos da home ════
   Substitui as variáveis globais do script inline original.
   Os módulos leem e gravam sempre via `estado.<campo>`. */

export var estado = {
    geoAreaMunicipal: null,
    geoBairros: null,
    geoSetores: null,

    dadosPop: [],
    dadosRaciais: [],

    layerBairros: null,
    layerDestacado: null,
    graficoSexo: null,
    mapOverlays: {}
};
