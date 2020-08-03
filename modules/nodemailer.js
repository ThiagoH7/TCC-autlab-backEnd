const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "thiagop070@gmail.com",
        pass: "thiago19072001"
    }
})

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewEngine: {
        defaultLayout: '',
        partialsDir: './views/email/'
    },
    viewPath: './views/email/',
    extName: '.html'
}))

module.exports = transport