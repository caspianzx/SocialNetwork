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
        //fetching user name and avatar from db using id from token
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

//@router GET api/posts  
//@desc   Get all post
//access  Private

router.get('/', auth, async (req, res) => {
    try {
        //find all and sort by most recent
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router GET api/posts/:id 
//@desc   Get post by id
//access  Private

router.get('/:id', auth, async (req, res) => {
    try {

        //find post using id from url
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        //same as no profile found
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error');
    }
});

//@router DELETE api/posts/:id
//@desc   Delete post by Id
//access  Private

router.delete('/:id', auth, async (req, res) => {
    try {
        //Delete post 
        const post = await Post.findById(req.params.id);

        //If post not found

        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }

        //Check on the user to ensure it is same user
        //Need to stringfy as post.user is an obj
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        } else {
            await post.remove();
        }

        res.json({
            msg: 'Post removed'
        });

    } catch (err) {
        console.error(err.message);
        //same as no profile found
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error');
    }
});


//@router PUT api/posts/like/:id
//@desc   Like a post
//access  Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post has been liked by the user 
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            });
        }

        post.likes.unshift({
            user: req.user.id
        });

        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router PUT api/posts/unlike/:id
//@desc   Unlike a post
//access  Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        //Search by Post Id, not likes ID
        const post = await Post.findById(req.params.id);

        //check if post has been likes
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not been liked.'
            });
        }

        //Get remove Index of liked post
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router Post api/posts/comment/:id
//@desc   Comment on a post
//access  Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        //fetching user name and avatar from db using id from token
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };


        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }

});

//@router DELELTE api/posts/comment/:id/:comment_id
//@desc   Delete comment
//access  Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        //Pull out comment 

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        //Make sure comment exists
        if (!comment) {
            return res.status(404).json({
                msg: 'Comment does not exist'
            });
        }

        //Check User
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User is not authorized'
            });
        }

        //Get remove Index of comment
        // const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        //get index of comment as one user can comment multiple times
        const removeIndex = post.comments.map(comment => comment._id).indexOf(req.params.comment_id);
        console.log(removeIndex);

        if (removeIndex === -1) {
            res.status(404).json({
                msg: 'Comment does not exist.'
            })
        }

        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }
})


module.exports = router;