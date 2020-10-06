const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const data = new Date();
let dia = data.getDate();

const Reserva = new Schema({
    users_id: { type: Number },
    salasNumero: { type: Number },
    hMin: { type: Date },
    hMax: { type: Date }
})

mongoose.model('reservas', Reserva)