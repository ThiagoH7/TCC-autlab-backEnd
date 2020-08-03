const ex = require('express')
const router = ex.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const mailer = require('../modules/nodemailer')
const crypto = require('crypto')
const path = require('path')
const { pathToFileURL } = require('url')

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
                newUser.save().then(() => {
                    req.flash('success_msg', "Usuário cadastrado com sucesso")
                    res.redirect('/')
                }).catch((err) => {
                    console.log(err)
                    req.flash('error_msg', "Houve um erro ao cadastrar, tente novamente")
                    res.redirect('/user/novo')
                })
            }
        })
    }
})

router.get('/recuperar_senha', (req, res) => {
    res.render('pages/recupSenha')
})

router.post('/recuperar_senha', async(req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }
        const token = crypto.randomBytes(20).toString('hex')
        const now = new Date()
        now.setHours(now.getHours() + 1)
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                tokenReset: token,
                tokenResetExpires: now
            }
        })
        mailer.sendMail({
            to: email,
            from: 'thiagop070@gmail.com',
            template: 'esqueceuSenha',
            context: { token },
            subject: "No reply"
        }, (err) => {
            if (err) {
                console.log(err)
                return res.status(400).send({ error: 'Erro ao enviar email, tente novamente' })
            }
            return res.send()
        })

    } catch (err) {
        res.status(400).send({ error: "Erro ao tentar recuperar a senha, tente novamente" })
    }
})

router.get('/nova_senha', (req, res) => {
    res.send("rota não definida")
})
router.post('/nova_senha', async(req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(400).send({ error: "Usuário não existe, confira suas credenciais" })

        if (token !== user.tokenReset)
            return res.status(400).send({ error: "Token inválido" })

        let now = new Date()
        now = Date.now()
        if (now > user.tokenResetExpires)
            return res.status(400).send({ error: "Token expirado" })

        user.password = password
        await user.save()
        res.send()
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Não foi possivel mudar sua senha, tente novamente" })
    }
})

module.exports = router