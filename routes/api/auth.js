const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');
// import gravatar
const gravatar = require('gravatar');
// import encryption module
const bcrypt = require('bcryptjs');
//import jsonwebtoken
const jwt = require('jsonwebtoken');
const config = require('config');


//@router GET api/auth  
//@desc   TEST route
//access  Public
//auth will protect this route by checking and verifying jwtoken
router.get('/', auth, async (req, res) => {
    try {
        //find by request id and omit out the password when sending to client
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@router POST api/auth  
//@desc   User Authentication and web token
//access  Public
router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Password is required'
        ).exists()
    ],
    async (req, res) => {
        //response handling after validations
        const errors = validationResult(req);
        // if isEmpty is false return bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        console.log(req.body);
        //Using deconstruction assignment to keep things DRY
        const {
            email,
            password
        } = req.body;

        try {
            //See if user exists
            let user = await User.findOne({
                email
            });
            //if doesn't exist
            if (!user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                })
            }
            // bcrypt to match pw from req.body and user pw from db
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                })
            }
            // return json webtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            // signing payload, return token if no err
            jwt.sign(payload, config.get("jwtSecret"), {
                expiresIn: 360000
            }, (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });

            })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });





module.exports = router;