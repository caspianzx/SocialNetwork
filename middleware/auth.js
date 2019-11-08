const jwt = require('jsonwebtoken');
const config = require('config');

//used to protect the route using custom middleware path

module.exports = function (req, res.next) {
    //GET token from header
    const token = req.header('x-auth-token');

    // If token dont exist
    if (!token) {
        //401 not authorised
        return res.status(401).json({
            msg: "No token, authorisation denied"
        })
    }
    //If exits, verify token
    try {
        //decode token using jtw verify
        const decoded = jtw.verify(token, config.get('jwtSecret'));
        //set req body user to a decoded token
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({
            msg: " Token is not valid"
        })

    }
}