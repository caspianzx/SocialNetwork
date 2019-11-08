// importing routing from express
const express = require('express');
const router = express.Router();

//importing validation functions from express-validator using ES6 deconstruction assignment
const {
    check,
    validationResult
} = require('express-validator');

//@router POST api/users  
//@desc   POST route
//access  Public
router.post('/', [check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more letters').isLength({
            min: 6
        })
    ],
    (req, res) => {
        //response handling after validations
        const errors = validationResult(req);
        // if isEmpty is false return bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        console.log(req.body);
        res.send('User route')
    });





module.exports = router;