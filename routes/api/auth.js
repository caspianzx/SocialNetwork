const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

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





module.exports = router;