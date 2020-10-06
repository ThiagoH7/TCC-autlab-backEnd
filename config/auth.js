const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/User')
const User = mongoose.model('users')

module.exports = function(passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                return done(null, false, { message: "Essa conta não existe" })
            } else {
                bcrypt.compare(password, user.password, (erro, batem) => {
                    if (batem) {
                        return (null, user)
                    } else {
                        return (null, false, { message: " Senha incorreta" })
                    }
                })
            }
            return done(null, user)
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}