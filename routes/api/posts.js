const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
//Import middleware
const auth = require('../../middleware/auth');
//
//Import all models
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
//
const {
    check,
    validationResult
} = require('express-validator');


//@router Post api/posts  
//@desc   Create a post
//access  Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        //fetching user name and avatar from db
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post)


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }

});





module.exports = router;