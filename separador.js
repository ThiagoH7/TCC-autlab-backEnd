var split = {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.19.0",
    "chart.js": "^2.9.3",
    "connect-flash": "^0.1.1",
    "express": "^4.17.1",
    "express-handlebars": "^4.0.4",
    "express-session": "^1.17.1",
    "handlebars": "^4.7.6",
    "mongoose": "^5.9.12",
    "mongose": "^0.0.2-security",
    "nodemailer": "^6.4.10",
    "nodemailer-express-handlebars": "^4.0.0",
    "nodemon": "^2.0.4",
    "passport": "^0.4.1",
    "passport-local": "^1.0.0"
}

function table(stringToSplit) {
    console.log(Object.keys(stringToSplit))
    console.log(Object.values(stringToSplit))

    for (var version in stringToSplit) {
        var ver = stringToSplit[version]
        var mod = version
        verStr = toString(ver)
        console.log(mod + " " + verStr)
    }
}

table(split)