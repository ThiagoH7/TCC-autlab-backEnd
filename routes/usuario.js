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
    res.render('pages/cadastroMobile', {
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
        var ua = req.headers['user-agent'].toLowerCase();
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
            res.render('pages/cadastroMobile')
        }
        res.render('pages/login', { layout: 'login' })
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
    res.render('pages/recupSenha', { layout: false })
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
            return res.redirect('/user/nova_senha')
        })

    } catch (err) {
        res.status(400).send({ error: "Erro ao tentar recuperar a senha, tente novamente" })
    }
})

router.get('/nova_senha', (req, res) => {
    res.render('pages/mudarSenha', { layout: false })
})
router.post('/nova_senha', async(req, res) => {
    const { email, token, password, confirmPassword } = req.body

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

        if (password != confirmPassword)
            return res.status(400).send({ error: "as senhas não batem" })

        user.password = password
        await user.save()
        res.send()
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Não foi possivel mudar sua senha, tente novamente" })
    }
})

module.exports = router