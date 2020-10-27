const mongoose = require('mongoose')
const schema = mongoose.Schema

const SalaReserva = new schema({
    numero: { type: Number, required: true },
    hMin: { type: Date, required: true },
    hMax: { type: Date, required: true },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    consumoAprox: { type: Number, required: true },
    //contSem: { type: Number, required: true }
})

mongoose.model('salasReserva', SalaReserva)