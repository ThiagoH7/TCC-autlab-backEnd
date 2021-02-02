//declararção----------------//
const ex = require('express')
const router = ex.Router()
const mongoose = require('mongoose')
require('../models/SalaReserva')
const SalaReserva = mongoose.model("salasReserva")
const passport = require('passport')
const { adControl } = require('../helpers/adControl')
const { loginReq } = require('../helpers/loginReq')

//rotas----------------------//
//Buscar sala e filtrando pelo número da sala
router.get('/reqsala:Sala', loginReq, async(req, res) => {
    var paramSala = req.params.Sala

    var agora = new Date()
    var escopoMin = new Date()
    var escopoMax = new Date()

    escopoMin = agora.setHours(agora.getHours() - 1)
    escopoMax = agora.setHours(agora.getHours() + 1)

    try {
        var salas = await SalaReserva.find({ numero: paramSala }).limit(15)

        var inf = await SalaReserva.findOne({ numero: paramSala }).sort({ $natural: -1 }).populate('user_id')

        //var statusQuery = await SalaReserva.findOne({ numero: paramSala, hMin: { $lte: new Date(escopoMin) }, hMax: { $gte: new Date(escopoMax) } }).sort({ $natural: -1 }).lean().populate()
        return res.render('pages/geral/info', {
            salas: salas.map(salas => salas.toJSON()),
            inf: inf,
            helper: {
                queryValid: function(valid) {
                    for (let i = 0; i < arr.length; i++) {
                        if (Math.trunc(arr[i]) == now.getHours()) {
                            escopoMin.setHours(Math.trunc(arr[i]) - 4)
                        }
                    }
                    if (SalaReserva.find({ numero: param, hMin: { $gte: escopoMin }, })) {
                        return valid = "Sala reservada"
                    } else {
                        return valid = "Sala lirve"
                    }
                }
            }
        })

    } catch (err) {
        req.flash("error_msg", "Houve um erro")
    }
})

//login
router.get('/login', (req, res) => {
    res.render("pages/geral/login", { layout: 'login' })
})

router.post('/login', (req, res, next) => {
    next()
}, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/ad/login',
    failureFlash: true
}))

module.exports = router