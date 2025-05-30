const ping = require('ping');

const bodyModules = {
    clientes_online: 
        {
            get_online_customer: {
            }
        }, 
    extrato_radius:
        {
            radius_extract: {
            }
        }
}

async function icmpPing(host, attempts = 30) {
    const times = [];

    for (let i = 0; i < attempts; i++) {
        const res = await ping.promise.probe(host);
        if (res.alive) {
            // console.log(`Ping ${i + 1}: ${res.time} ms`);
            times.push(parseFloat(res.time));
        } else {
            // console.log(`Ping ${i + 1} falhou`);
            times.push(null); // Ou ignore
            break;
        }
    }

    const validTimes = times.filter(t => t !== null);

    if (validTimes.length === 0) {
        // console.log('Todos os pings falharam.');
        return null;
    }

    const avg = validTimes.reduce((a, b) => a + b) / validTimes.length;
    const min = Math.min(...validTimes);
    const max = Math.max(...validTimes);

    // console.log(`\nResultados para ${host}:`);
    // console.log(`Média: ${avg.toFixed(2)} ms`);
    // console.log(`Mínimo: ${min} ms`);
    // console.log(`Máximo: ${max} ms`);

    return {
        average: avg.toFixed(2),
        min,
        max,
        times: validTimes
    };
}

module.exports = { bodyModules, icmpPing }