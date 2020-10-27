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
//Página de adastro de consumo
router.get('/cadast', adControl, (req, res) => {
    res.render('pages/registro')
})

//Registar novo consumo
router.post('/regsala/cons', (req, res) => {
    const salaReg = {
        numero: req.body.numero,
        consumoAprox: req.body.consumoAprox,
        contSem: req.body.contSem
    }
    new SalaReserva(salaReg).save().then(() => {
        req.flash('success_msg', "Usuário criado com sucesso")
    }).catch((err) => {
        req.flash('error_msg', "Erro ao cadastrar usuários")
    })
    res.redirect('/')
})

//Buscar sala e filtrando pelo número da sala
router.get('/reqsala:Sala', loginReq, async(req, res) => {
    var paramSala = req.params.Sala
    try {
        var salas = await SalaReserva.find({ numero: paramSala }).limit(15)
        return res.render('pages/info', { salas: salas.map(salas => salas.toJSON()) })
    } catch (err) {
        req.flash("error_msg", "Houve um erro")
    }
})

router.get('/login', (req, res) => {
    res.render("pages/login", { layout: 'login' })
})
router.post('/login', (req, res, next) => {
    next()
}, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/ad/login',
    failureFlash: true
}))

module.exports = router