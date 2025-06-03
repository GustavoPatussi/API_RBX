const axios = require('axios');
const dayjs = require('dayjs');

// Configurações da API
const API_URL = 'https://rbx.3xfibra.com.br/routerbox/ws/rbx_server_json.php';
const API_KEY = 'FTSRYZWQ2TL1LUNOWMZJQUG3VX2JHJ';

async function getAtendimentosPorData(data) {
    try {
        const response = await axios.post(API_URL, {
            ConsultaAtendimentos: {
                Autenticacao: {
                    ChaveIntegracao: API_KEY
                },
                Filtro: `Atendimentos.Data_AB = '${data}'`
            }
        });

        return response.data.result || [];
    } catch (error) {
        console.error(`Erro ao buscar atendimentos para ${data}:`, error.message);
        return [];
    }
}

async function contarAtendimentosPorCliente() {
    const hoje = dayjs();
    const umMesAtras = hoje.subtract(1, 'month');

    // Gerar todas as datas do período
    const datasParaConsultar = [];
    let dataAtual = umMesAtras;

    while (dataAtual.isBefore(hoje) || dataAtual.isSame(hoje, 'day')) {
        datasParaConsultar.push(dataAtual.format('YYYY-MM-DD'));
        dataAtual = dataAtual.add(1, 'day');
    }

    // Obter todos os atendimentos do período
    const todosAtendimentos = [];

    for (const data of datasParaConsultar) {
        // console.log(`Consultando atendimentos para ${data}...`);
        const atendimentos = await getAtendimentosPorData(data);
        todosAtendimentos.push(...atendimentos);

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Contar atendimentos por cliente
    const contagemPorCliente = {};

    todosAtendimentos.forEach(atendimento => {
        const codigoCliente = atendimento.CodigoCliente;
        contagemPorCliente[codigoCliente] = (contagemPorCliente[codigoCliente] || 0) + 1;
    });

    // Converter para array, ordenar e formatar o resultado
    const resultadoOrdenado = Object.entries(contagemPorCliente)
        .map(([cliente, count]) => ({ cliente, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return resultadoOrdenado;
}

// Uso da função
// contarAtendimentosPorCliente()
//     .then(resultado => {
//         console.log('=== CONTAGEM DE ATENDIMENTOS POR CLIENTE (ÚLTIMO MÊS) ===');
//         console.log('| Cliente | Atendimentos |');
//         console.log('|---------|--------------|');

//         resultado.forEach(item => {
//             console.log(`| ${item.cliente.toString().padEnd(7)} | ${item.count.toString().padEnd(12)} |`);
//         });

//         console.log('\nTotal de clientes atendidos:', resultado.length);
//         console.log('Total de atendimentos no período:', resultado.reduce((sum, item) => sum + item.count, 0));
//     })
//     .catch(error => {
//         console.error('Erro ao processar atendimentos:', error);
//     });
module.exports = {contarAtendimentosPorCliente}