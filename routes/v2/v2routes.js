const v2Routes = require('express').Router();
const { bodyModules, icmpPing } = require('./v2modules');
const axios = require('axios');
const dayjs = require('dayjs');


// consulta os usuários PPPoE online '/clientes-online?user=PPPoE'
v2Routes.get('/clientes-online', async (req, res) => {
    const { user } = req.query
    const requestBody = bodyModules.clientes_online;
    if (user) {
        requestBody.get_online_customer.authentication_username = user
    }
    else {
        requestBody.get_online_customer = {}
    }

    try {
        const response = await axios.post(
            'https://rbx.3xfibra.com.br/routerbox/ws_json/ws_json.php',
            requestBody,
            { headers: { 'authentication_key': 'FTSRYZWQ2TL1LUNOWMZJQUG3VX2JHJ' } }
        );
        res.status(200).json(response.data.result);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro na comunicação com a API externa' });
    }
});







// Consulta todos os pppoe com desconexão no ultimo mes '/extrato-radius?dias=nDias&user=PPPoE'
v2Routes.get('/extrato-radius', async (req, res) => {
    const { dias, user } = req.query

    const diasFiltro = dias ? parseInt(dias) : 30; // padrão 30 dias se não passar
    const hoje = dayjs();
    const dataInicio = hoje.subtract(diasFiltro, 'day').format("YYYY-MM-DD HH:mm:ss");
    const dataFim = hoje.format("YYYY-MM-DD HH:mm:ss");


    try {
        const requestBody = bodyModules.extrato_radius;
        if (user) {
            requestBody.radius_extract.username = user
        }
        else {
            requestBody.radius_extract = {}
        }
        requestBody.radius_extract.start_time = dataInicio;
        requestBody.radius_extract.stop_time = dataFim;

        let quedas_users = {};
        const response = await axios.post(
            'https://rbx.3xfibra.com.br/routerbox/ws_json/ws_json.php',
            requestBody,
            { headers: { 'authentication_key': 'FTSRYZWQ2TL1LUNOWMZJQUG3VX2JHJ' } }
        );
        const result = response.data.result
        result.forEach(i => {
            const username = i.username;
            if (quedas_users[username]) {
                quedas_users[username]++;
            } else {
                quedas_users[username] = 1;
            }
        });
        const ordenado = Object.entries(quedas_users)
            .sort((a, b) => b[1] - a[1])  // ordena do maior pro menor
            .map(([username, count]) => ({
                username: username,
                quedas: count
            }))
            .slice(0, 20);

        res.status(200).json(ordenado);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});







v2Routes.get('/ping', async (req, res) => {
    const { ip, user } = req.query;
    if (ip && user) {
        return res.status(400).json({ error: 'Os parâmetros "ip" e "user" não podem ser usados juntos' });
    }
    if (ip && !user) {
        try {
            const result = await icmpPing(ip);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    if (!ip && user) {
        try {
            const response = await axios.post(
                `https://rbx.3xfibra.com.br/routerbox/ws_json/ws_json.php`,
                {
                    get_online_customer: {
                        authentication_username: user
                    }
                },
                { headers: { 'authentication_key': 'FTSRYZWQ2TL1LUNOWMZJQUG3VX2JHJ' } }
            );
            const ipResult = response.data.result?.[0]?.framed_ipv4_address ?? 0;
            const result = await icmpPing(ipResult);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }

    }
});





module.exports = v2Routes