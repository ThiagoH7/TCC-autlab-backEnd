const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
require('../models/SalaReserva')
const SalaReserva = mongoose.model('salasReserva')

//Problema: Só mostra aultima, isso pode causar problemas
router.get('/reservas-atuais', async(req, res) => {
    var agora = new Date()
    agora.setHours(agora.getHours() - 3)

    try {
        var salasDistin = await SalaReserva.distinct('numero')
        var count = salasDistin.length
        let reservas = []
        for (i = 0; i < count; i++) {
            let query = await SalaReserva.findOne({ numero: salasDistin[i] }).sort({ $natural: -1 }).lean().populate('user_id')
            reservas.push(query)
        }
        return res.render('pages/reserva', {
            reservas: reservas,
        })
    } catch (err) {
        req.flash("error_msg", "Houve um erro")
    }
})

//Verifica se a sala está ocupada no momento em que se faz a busca
router.get('/reservas:sala', async(req, res) => {
    var agora = new Date()

    var escopoMin = new Date()
    var escopoMax = new Date()

    escopoMin = agora.setHours(agora.getHours() - 1)
    escopoMax = agora.setHours(agora.getHours() + 1)

    console.log(escopoMax, escopoMin)

    var param = req.params.sala
    try {
        var query = await SalaReserva.find({ numero: param, hMin: { $lte: new Date(escopoMin) }, hMax: { $gte: new Date(escopoMax) } }).lean().populate()
        res.send(query)
    } catch (err) {
        res.send(err)
    }
})

//Criar rota get para fazer o filtro (selecionar a sala (e período?))
router.get('/historico-reservas-sala:param', async(req, res) => {
    var salaParam = req.params.param
    try {
        var sala = await SalaReserva.find({ numero: salaParam }).populate('user_id')
        return res.send(sala)
    } catch {
        return res.sendStatus(500).send("erro interno do servidor")
    }
})

router.post('/reserva-sala', async(req, res) => {
    let { hMin, hMax, numero, consumo } = req.body

    //Hora minima
    horaMin = hMin[0] + hMin[1], minutoMin = hMin[3] + hMin[4]
    hMinCon = parseInt(horaMin, 10), mMinCon = parseInt(minutoMin, 10)

    let min = new Date()
    min.setHours(hMinCon)
    min.setMinutes(mMinCon)
    min = min.valueOf()


    //Hora máxima
    horaMax = hMax[0] + hMax[1], minutoMax = hMax[3] + hMax[4]
    hMaxCon = parseInt(horaMax, 10), mMaxCon = parseInt(minutoMax, 10)

    let max = new Date()
    max.setHours(hMaxCon)
    max.setMinutes(mMaxCon)
    max = max.valueOf()

    /* let sub = Math.abs(max.getTime() - min.getTime())
    let horas = Math.ceil(sub / (1000 * 60 * 60)) */

    const novaReserva = new SalaReserva({
        user_id: req.user._id,
        hMin: min,
        hMax: max,
        numero: numero,
        consumoAprox: consumo
    })

    try {
        await novaReserva.save()
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500).send("Houve um erro ao salvar a reserva, tente novamente, por favor")
    }

    new SalaReserva(novaReserva)
})

module.exports = router