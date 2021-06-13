const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next){
    console.log('cookie data is');
    console.log(req.cookies);
    const token = req.cookies.token;
    if(!token) return res.status(401).send("Access denied. No token provided");

    try {
        const payload = jwt.verify(token, config.get("jwtPrivateKey"));
        req.user = payload;
        next();
    }catch (e) {
        res.status(400).send("Invalid token");
    }

}

module.exports = auth;
