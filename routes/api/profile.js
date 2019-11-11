const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');


//@router GET api/profile/me
//@desc   GET current user profile 
//access  Private
router.get('/me', auth, async (req, res) => {
    try {
        //user is pertaining to user field in profile schema
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', ' avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }

        res.json(profile);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router POST api/profile
//@desc   Create or update user profile
//access  Private

router.post('/', [auth,
        [
            check('status', 'Status is required')
            .not().isEmpty(),
            check('skills', 'Skills is required')
            .not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        //deconstructing assignment from body
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Build profile Object
        const profileFields = {};
        //check for if value exist
        profileFields.user = req.user.id;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        //map skills into array
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        console.log(profileFields.skills);
        // res.send('hello');

        // Build social Object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        console.log(profileFields.social.twitter)

        try {
            //user field is the object id
            let profile = await Profile.findOne({
                user: req.user.id
            });
            if (profile) {
                //Update if profile exist
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });
                return res.json(profile);
            }
            //Else create new profile
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })


//@router GET api/profile
//@desc   Create all profiles
//access  Public (no middleware auth)

router.get('/', async (req, res) => {
    try {
        //populate from user collection is similar to sql join
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@router GET api/profile/user/:user_id
//@desc   Create profile by user id
//access  Public (no middleware auth)

router.get('/user/:user_id', async (req, res) => {
    try {
        //populate from user collection is similar to sql join
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);


        if (!profile) {
            return res.status(400).json({
                msg: 'Profile not found.'
            });
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                msg: 'Profile not found.'
            });
        }
        res.status(500).send('Server Error');
    }
});

//@router DELETE api/profile
//@desc   DELETE profile, user & post
//access  Private

router.delete('/', auth, async (req, res) => {
    try {

        //@todo - remove user's post
        //Remove profile    
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        //Remove user
        await User.findOneAndRemove({
            _id: req.user.id
        });

        res.json({
            msg: "User deleted."
        })


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});






module.exports = router;