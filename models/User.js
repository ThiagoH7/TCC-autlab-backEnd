const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
    nome: { type: String, requierd: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }
})

mongoose.model("users", user)