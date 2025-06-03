const v1Routes = require('express').Router();
const { bodyModule } = require('./v1modules');
const axios = require('axios');
const { contarAtendimentosPorCliente } = require('./ConsultaNumAtdmodule');


v1Routes.get("/ConsultaClientes", async (req, res) => {
    const filtro = req.query;
    try {
        const response = await axios.post(
            'https://rbx.3xfibra.com.br/routerbox/ws/rbx_server_json.php',
            bodyModule('ConsultaClientes', filtro),
        );
        console.log(response.data);
        res.status(200).json(response.data.result);
    }
    catch (err) {
        res.status(500).json(err);
    }
})


v1Routes.get('/ConsultaAutenticacao', async (req, res) => {
    const filtro = req.query;
    try {
        const response = await axios.post(
            'https://rbx.3xfibra.com.br/routerbox/ws/rbx_server_json.php',
            bodyModule('ConsultaAutenticacao', filtro),
        );
        res.status(200).json(response.data.result);
    }
    catch (err) {
        res.status(500).json(err);
    }
})



v1Routes.get('/ConsultaNumeroAtendimentos', async (req, res) => {
    try {
        const response = await contarAtendimentosPorCliente();
        res.status(200).json(response);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

module.exports = v1Routes;