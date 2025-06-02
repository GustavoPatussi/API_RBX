const queryModule = (query) => {
    const filtro = Object.entries(query)
        .map(([chave, valor]) => `${chave} = '${valor}'`)
        .join(' AND ');
    return filtro;
}

function bodyModule(campoRaiz, query) {
    const filtro = queryModule(query);
    console.log(filtro);
    return {
        [campoRaiz]: {
            Autenticacao: {
                ChaveIntegracao: 'FTSRYZWQ2TL1LUNOWMZJQUG3VX2JHJ'
            },
            ...(filtro ? { Filtro: filtro } : {})
        }
    };
}

module.exports = { bodyModule };