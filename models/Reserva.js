const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Reserva = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    salasNumero: { type: Number },
    hMin: { type: Date },
    hMax: { type: Date }
})

mongoose.model('reservas', Reserva)