const jwt = require("jsonwebtoken")
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token
    if (authHeader) {
        const token = authHeader
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) {
                return res.status(401).json("User token is not valid")
            }
            req.user = user
            next()
        })
    } else {
        return res.status(402).json("You are not Authorized")
    }
}

module.exports = verifyToken