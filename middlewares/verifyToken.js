const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (!bearerHeader) {
        res.sendStatus(403);
        return;
    }

    // Format is Bearer <token>
    const bearer = bearerHeader.split(" "); // ["Bearer", <token>]
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            req.authData = authData;
            next();
        }
    });
}

module.exports = verifyToken;
