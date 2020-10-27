const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    nome: { type: String, requierd: true },
    email: { type: String, required: true },
    admin: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
    tokenReset: { type: String, required: false, select: false },
    tokenResetExpires: { type: Date, required: false, select: false }
})

userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})
const User = mongoose.model("users", userSchema)

module.exports = User