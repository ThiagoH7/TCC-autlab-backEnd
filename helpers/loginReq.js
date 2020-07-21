module.exports = {
    loginReq: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/ad/login')
    }
}