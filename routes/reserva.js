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
        let reservas = await Reserva.find({}).limit(1).sort({ $natural: -1 })
        return res.render('pages/reserva', {
            reservas: reservas.map(reservas => reservas.toJSON()),
            helpers: {
                validacao: (value) => {
                    var str = (reservas)
                    var horaMin = new Date(str[0].hMin)
                    var horaMax = new Date(str[0].hMax)
                    var time = new Date()
                    if (time.getTime() > horaMin.getTime() && time.getTime() < horaMax.getTime()) {
                        return value = "Sala Ocupada"
                    } else {
                        return value = "Sala Livre"
                    }
                }
            }
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