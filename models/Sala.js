/*Criação do model
    Lê: Sala - Schema
        salas - instância
*/
const mongoose = require('mongoose')
const schema = mongoose.Schema

const Sala = new schema({
    numero: { type: Number, Required: true },
    hAbert: { type: Date, default: Date.now },
    hFech: { type: Date, default: Date.now },
    consAprox: { type: Number, Required: true },
    contSem: { type: Number }
})

mongoose.model("salas", Sala);