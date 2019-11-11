const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
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

//@router PUT api/profile/experience
//@desc   ADD profile experience
//access  Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    // console.log(newExp)
    // console.log(req.user.id)
    try {
        //fetch profile
        const profile = await Profile.findOne({
            user: req.user.id
        });
        //pushes exp to the front so that it will show up first
        //experience is an array
        profile.experience.unshift(newExp);
        // console.log(profile);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router DELETE api/profile/experience/:exp_id
//@desc   DELETE experience from profile 
//access  

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        // console.log(removeIndex);
        //prevent removal of experience if it does not exist
        if (removeIndex === -1) {
            res.status(404).send('Experience not found');
        } else {
            profile.experience.splice(removeIndex, 1);
            await profile.save();
            res.json(profile);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@router PUT api/profile/education
//@desc   ADD profile education
//access  Private

router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        //fetch profile
        const profile = await Profile.findOne({
            user: req.user.id
        });
        //pushes exp to the front so that it will show up first
        //experience is an array
        profile.education.unshift(newEdu);
        // console.log(profile);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@router DELETE api/profile/education/:exp_id
//@desc   DELETE education from profile 
//access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        // console.log(removeIndex);
        //prevent removal of education if it does not exist
        if (removeIndex === -1) {
            res.status(404).send('Education not found');
        } else {
            profile.education.splice(removeIndex, 1);
            await profile.save();
            res.json(profile);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@router GET api/profile/github/:username
//@desc   Get repos from github user
//access  Public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `http://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(404).json({
                    msg: 'github profile not found'
                })
            }

            //parsing as body is in string format
            res.json(JSON.parse(body));

        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;