const ex = require('express')
const router = ex.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')

//Cadastrar novo usuário
router.get('/novo', (req, res) => {
    res.render('pages/usuario', {
        helpers: {
            isAdmin: (value) => {
                if (req.isAuthenticated()) {
                    if (req.user.admin == true) { return value = true }
                } else { return value = false }
            }
        }
    })
})

router.post('/novo', (req, res) => {
    // validação de cadastro de usuário
    var erros = []
    if (!req.body.name || typeof req.body.name == undefined) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined) {
        erros.push({ texto: "Email inválido" })
    }
    if (!req.body.password || typeof req.body.password == undefined) {
        erros.push({ texto: "Senha inválida" })
    }
    if (req.body.password.length < 8) {
        erros.push({ texto: "Senha  muito curta" })
    }
    if (req.body.password != req.body.confirmPassword) {
        erros.push({ texto: "As senhas não batem" })
    }

    //Caso erros=0, cadastra o usuário
    if (erros.length > 0) {
        res.render('pages/usuario', {
            erros: erros,
            helpers: {
                isAdmin: (value) => {
                    if (req.isAuthenticated()) {
                        if (req.user.admin == true) { return value = true }
                    } else { return value = false }
                }
            }
        })
    } else {
        User.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', "Já existe este email cadastrado em nosso sistema")
                res.redirect('/user/novo')
            } else {
                const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                        admin: req.body.admin
                    })
                    //hasheando a senha
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            req.flash('error_msg', "Houve um ero ao salvar usuário")
                            res.redirect('/user/novo')
                        }
                        newUser.password = hash
                        newUser.save().then(() => {
                            req.flash('success_msg', "Usuário criado com sucesso ")
                            console.log('Sucesso beibe')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', "Houve um erro ao cadastrar usuário no sistema")
                            console.error(err)
                            res.redirect('/user/novo')
                        })
                    })
                })
            }
        })
    }
})

module.exports = router