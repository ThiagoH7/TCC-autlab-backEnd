//constantes-----------//
const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const bp = require('body-parser')
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const usuario = require('./routes/usuario')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const cp = require('cookie-parser')
const moment = require('moment')
const chart = require('chart.js')
const passport = require('passport')
require('./config/auth')(passport)
const { loginReq } = require('./helpers/loginReq')

/*------------------- */
//HandleBars-------//
app.engine("handleBars", handlebars({ defaultLayout: 'main' }))
app.set("view engine", "handleBars")
    //Helper
var hbs = handlebars.create({
    helpers: {
        isAdmin: (value) => {
            if (req.isAuthenticated()) {
                if (req.user.admin == true) { return value = true }
            } else { return value = false }
        }
    }
})

//Public-------------//
app.use(express.static(path.join(__dirname, '/public')))

//cookieParser-------//
app.use(cp('secret'))

//Body-Parser------//
app.use(bp.urlencoded({ extended: true }))
app.use(bp.json())

//Sessions---------//
app.use(session({
    secret: "sitetcc",
    resave: true,
    saveUninitialized: true,
}))

//Passport---------//
app.use(passport.initialize())
app.use(passport.session())

//Flash------------//
app.use(flash())

//Mongoose---------//
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/salaControl", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .catch((erro) => { console.log(erro) })

//Model das salas------//
require('./models/Sala')
const Sala = mongoose.model("salas")
require('./models/User')
const User = mongoose.model('users')

//Midlleware-------//
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.user = req.user || null;
    next()
})

/* --------------------- */

//Rotas----------------// 
app.get('/', loginReq, (req, res) => {
    res.render('pages/home')
})

app.get('/logout', loginReq, (req, res) => {
    req.logOut()
    res.redirect('/')
})

//Rotas Externas-----------//
app.use('/ad', admin)
app.use('/user', usuario)

//Rodando-------------//
const PORTA = 8089
app.listen(PORTA, () => {
    console.log("<-------------------------------------------------------------->"), console.log("Servidor rodando na porta: " + PORTA), console.log("<-------------------------------------------------------------->")
})