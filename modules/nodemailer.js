const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "2f36ddbb3c8b80",
        pass: "338f4edd548bd0"
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