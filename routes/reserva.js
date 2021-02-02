const express = require('express')
const { parse } = require('handlebars')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
require('../models/SalaReserva')
const SalaReserva = mongoose.model('salasReserva')

//Problema: Só mostra a última
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
        return res.render('pages/Reserva/reserva', {
            reservas: reservas,
        })
    } catch (err) {
        req.flash("error_msg", "Houve um erro")
    }
})

//Verifica se a sala está ocupada no momento em que se faz a busca
router.get('/reservas:sala', async(req, res) => {
    var arr = [7, 7.45, 8.3, 8.5, 9.35, 10.2, 10.3, 11.15, 12, 13, 13.45, 14.3, 14.4, 15.25, 16.1, 16.3, 17.15, 18, 19, 19.45, 20.3, 20.5, 21.35, 22]
    var escopoMin = new Date()
    var now = new Date()

    var param = req.params.sala
    try {
        for (let i = 0; i < arr.length; i++) {
            if (Math.trunc(arr[i]) == now.getHours()) {
                escopoMin.setHours(Math.trunc(arr[i]) - 4)
            }
        }
        const query = await SalaReserva.find({ numero: param, hMin: { $gte: escopoMin }, }).lean().populate()
            //Redirecionar para a página de reservas com o número já preenchido
        if (query.length != 0) {
            res.send(query)
        } else {
            res.send("sla")
        }

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
        return res.status(500).send("erro interno do servidor")
    }
})

//Realizar reserva
router.post('/reserva-sala', async(req, res) => {
    let { hMin, hMax, numero, consumo } = req.body

    //Hora minima
    horaMin = hMin[0] + hMin[1], minutoMin = hMin[2] + hMin[3], segunMin = hMin[4] + hMin[5], milisMin = hMin[4] + hMin[4]
    hMinCon = parseInt(horaMin, 10), mMinCon = parseInt(minutoMin, 10), sMinCon = parseInt(segunMin, 10), miMinCon = parseInt(milisMin, 10)

    let min = new Date()
    min.setHours(hMinCon)
    min.setMinutes(mMinCon)
    min.setSeconds(sMinCon)
    min.setMilliseconds(miMinCon)
    min = min.valueOf()


    //Hora máxima
    horaMax = hMax[0] + hMax[1], minutoMax = hMax[2] + hMax[3], segunMax = hMax[4] + hMax[4], milisMax = hMax[4] + hMax[4]
    hMaxCon = parseInt(horaMax, 10), mMaxCon = parseInt(minutoMax, 10), sMaxCon = parseInt(segunMax, 10), miMaxCon = parseInt(milisMax, 10)

    let max = new Date()
    max.setHours(hMaxCon)
    max.setMinutes(mMaxCon)
    max.setSeconds(sMaxCon)
    max.setMilliseconds(miMaxCon)
    max = max.valueOf()

    if (await SalaReserva.find({ numero: numero, hMin: { $eq: min } }).countDocuments() != 0 && await SalaReserva.find({ numero: numero, hMax: { $eq: max } }).countDocuments() != 0)
        return res.status(500).send("Sala já reservada, verifique disponibilidade")


    const novaReserva = new SalaReserva({
        user_id: req.user._id,
        hMin: min,
        hMax: max,
        numero: numero,
        consumoAprox: consumo
    })

    try {
        await novaReserva.save()
        res.status(200).send("Reserva salva com sucesso")
    } catch (error) {
        res.status(500).send("Houve um erro ao salvar a reserva, tente novamente, por favor")
    }

    new SalaReserva(novaReserva)
})

//Apagar reservas (get e post)
router.get('/apagar-reservas', async(req, res) => {
    const query = await SalaReserva.find({}).limit(10)
    res.render('pages/Reserva/delete', { query: query })
})
router.post('/apagar-reservas', async(req, res) => {
    const resId = req.body.id

    if (typeof resId == 'object') {
        for (let i = 0; i < resId.length; i++) {
            await SalaReserva.findOneAndRemove({ _id: resId[i] })
            if (i == resId.length - 1)
                res.status(200).send("Reservas deletadas")
        }
    } else if (typeof resId === 'string') {
        try {
            await SalaReserva.findOneAndRemove({ _id: resId })
            res.status(200).send("Reserva deletada")
        } catch (err) {
            res.status(500).send("Ocorreu um erro ao deletar a reserva")
        }
    } else {
        return res.status(500).send("Ocorreu um erro interno")
    }
})


//Atualizar Reservas


module.exports = router