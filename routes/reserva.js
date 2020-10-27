const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
require('../models/SalaReserva')
const SalaReserva = mongoose.model('salasReserva')

router.get('/reservas-atuais', async(req, res) => {
    var hoje = new Date()
    hoje.setHours(hoje.getHours() - 3)

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
    let { hMin, hMax, numero } = req.body

    //Hora minima
    horaMin = hMin[0] + hMin[1], minutoMin = hMin[3] + hMin[4]
    hMinCon = parseInt(horaMin, 10), mMinCon = parseInt(minutoMin, 10)

    let min = new Date()
    min.setHours(hMinCon)
    min.setMinutes(mMinCon)


    //Hora máxima
    horaMax = hMax[0] + hMax[1], minutoMax = hMax[3] + hMax[4]
    hMaxCon = parseInt(horaMax, 10), mMaxCon = parseInt(minutoMax, 10)

    let max = new Date()
    max.setHours(hMaxCon)
    max.setMinutes(mMaxCon)

    let sub = Math.abs(max.getTime() - min.getTime())
    let horas = Math.ceil(sub / (1000 * 60 * 60))

    const novaReserva = new SalaReserva({
        user_id: req.user._id,
        hMin: min,
        hMax: max,
        numero: numero,
        consumoAprox: horas
    })

    try {
        await novaReserva.save()
        res.sendStatus(200).send("Sucesso ao resgistrar reserva")
    } catch (error) {
        res.sendStatus(500).send("Houve um erro ao salvar a reserva, tente novamente, por favor")
    }

    new SalaReserva(novaReserva)
})

module.exports = router