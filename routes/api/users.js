// importing routing from express
const express = require('express');
const router = express.Router();
//importing validation functions from express-validator using ES6 deconstruction assignment
const {
    check,
    validationResult
} = require('express-validator');
// import model
const User = require('../../models/User');
// import gravatar
const gravatar = require('gravatar');
// import encryption module
const bcrypt = require('bcryptjs');
//import jsonwebtoken
const jwt = require('jsonwebtoken');

const config = require('config');



//@router POST api/users  
//@desc   POST route
//access  Public
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more letters'
        ).isLength({
            min: 6
        })
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
            name,
            email,
            password
        } = req.body;

        try {
            //See if user exists
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Email already exists!'
                    }]
                })
            }
            //Get user Gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            // new instance  using model
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //encrypting password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            //save user
            await user.save();
            // return json webtoken
            //user.id comes from the promise of user.save
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