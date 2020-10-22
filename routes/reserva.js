const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const exhbs = require('express-handlebars')
const User = require('../models/User')
require('../models/Sala')
const Sala = mongoose.model('salas')
require('../models/User')
require('../models/Reserva')
const Reserva = mongoose.model('reservas')

router.get('/reserva-sala', async(req, res) => {
    var hoje = new Date()
    hoje.setHours(hoje.getHours() - 3)

    try {
        var salasDistin = await Reserva.distinct('salasNumero')
        var count = salasDistin.length
        let reservas = []
        for (i = 0; i < count; i++) {
            let query = await Reserva.findOne({ salasNumero: salasDistin[i] }).sort({ $natural: -1 }).lean()
            reservas.push(query)
        }
        return res.render('pages/reserva', {
            reservas: reservas,
        })
    } catch (err) {
        req.flash("error_msg", "Houve um erro")
    }
})

router.post('/reserva-sala', async(req, res) => {
    let { hMin, hMax, salNum } = req.body

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

    const novaReserva = new Reserva({
        user_id: req.user._id,
        hMin: min,
        hMax: max,
        salasNumero: salNum
    })

    try {
        await novaReserva.save()
        res.sendStatus(200).send('Sucesso ao resgistrar reserva')
    } catch (error) {}

    new Reserva(novaReserva)
})

module.exports = router