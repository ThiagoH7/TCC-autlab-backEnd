const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/User')
const User = mongoose.model('users')

module.exports = function(passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' },
        async function(email, password, done) {
            User.findOne({ email: email }, async function(err, user) {
                if (err)
                    return done(err)
                if (!user)
                    return done(null, false, { message: console.log("Ususário não existe") })
                if (!await bcrypt.compare(password, user.password))
                    return done(null, false, { message: console.log("Senha incorreta") })
                return done(null, user)
            })
        }
    ))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}