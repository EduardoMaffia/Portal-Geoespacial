/* ════ utils.js — Funções de higienização, carga e parsing (NÃO simplificar: ver agents.md §2.4) ════ */

export function getProp(obj, prop) {
    if (!obj) return undefined;
    if (obj[prop] !== undefined) return obj[prop];
    var lowerProp = prop.toLowerCase().trim();
    for (var key in obj) { if (key.trim().toLowerCase() === lowerProp) return obj[key]; }
    return undefined;
}

export function limparCodigo(val) {
    if (val == null) return '';
    return String(val).replace(/\.0$/, '').trim();
}

export function carregarJSON(url) {
    return fetch(url).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + url);
        return r.json();
    }).catch(e => {
        console.warn('[SIG] Não carregado:', e.message);
        return null;
    });
}

export function parsePandasJSON(raw) {
    var arr = [];
    if (Array.isArray(raw)) {
        arr = raw;
    } else if (raw && Array.isArray(raw.features)) {
        arr = raw.features.map(f => f.properties || {});
    } else if (raw && typeof raw === 'object') {
        var colunas = Object.keys(raw);
        if (colunas.length > 0) {
            var primeiraColuna = raw[colunas[0]];
            if (typeof primeiraColuna === 'object' && !Array.isArray(primeiraColuna)) {
                var indices = Object.keys(primeiraColuna);
                indices.forEach(idx => {
                    var linha = {};
                    colunas.forEach(col => { linha[col] = raw[col][idx]; });
                    arr.push(linha);
                });
            } else {
                colunas.forEach(k => { if (typeof raw[k] === 'object') arr.push(raw[k]); });
            }
        }
    }
    return arr;
}
