const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (!bearerHeader) {
        req.isLoggedIn = false;
        next();
        return;
    }

    // Format is Bearer <token>
    const bearer = bearerHeader.split(" "); // ["Bearer", <token>]
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, process.env.JWT_KEY, (err) => {
        if (!err) {
            req.isLoggedIn = true;
        } else {
            req.isLoggedIn = false;
        }

        next();
    });
}

module.exports = isLoggedIn;
