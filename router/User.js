const router = require("express").Router()
const User = require("../Modal/User")
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const verifyToken = require("./verifyToken")
const Post = require("../Modal/Post")

router.post("/new/post", async (req, res) => {

    try {
        const { email, password, username, profile } = req.body

        const salt = bcrypt.genSaltSync(saltRounds)
        const hash = bcrypt.hashSync(password, salt)


        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(200).json("Login with correct password")
        } else {


            const user = await User.create({ email: email, password: hash, profile: profile, username: username })
            const accessToken = jwt.sign({
                id: user._id,
                username: user.username
            }, process.env.JWT_SEC)

            res.status(200).json({ user, accessToken })

        }



    } catch (error) {
        return res.status(404).json("Internal server error")
    }



})

router.get("/login", async (req, res) => {

    try {

        let user = await User.findOne({ email: req.body.email })
        if (user) {
            const comparepassword = await bcrypt.compare(req.body.password, user.password)
            if (!comparepassword) {
                return res.status(400).json("Password incorrect")
            }


            const accessToken = jwt.sign({
                id: user._id,
                username: user.username
            }, process.env.JWT_SEC)
            const { password, ...others } = user._doc;
            return res.status(200).json({ others, accessToken })

        }

    } catch (error) {
        return res.status(404).json("Internal server error")
    }

})

router.put("/:id/follow", verifyToken, async (req, res) => {
    try {
        console.log(req.body.user)
        console.log(req.params.id)
        if (req.params.id !== req.body.user) {
            const user = await User.findById(req.params.id)
            const otheruser = await User.findById(req.body.user)

            if (!user.followers.includes(req.body.user)) {
                await user.updateOne({ $push: { followers: req.body.user } })
                await otheruser.updateOne({ $push: { following: req.params.id } })
                return res.status(200).json("User has follow")
            } else {
                await user.updateOne({ $pull: { followers: req.body.user } })
                await otheruser.updateOne({ $pull: { following: req.params.id } })
                return res.status(200).json("User has unfollow")
            }
        }
    } catch (error) {
        return res.status(500).json("server error")
    }

})

router.get("/flw/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const followersPost = await Promise.all(
            user.following.map((item) => {
                return Post.find({ user: item })
            })
        )
        const userPost = await Post.find({ user: user._id })
        const filterProduct = userPost.concat(...followersPost)

        filterProduct.forEach((post) => {
            const postAge = new Date - new Date(post.createdAt)
            const ageWeight = 1 - postAge / (1000 * 60 * 60 * 24)
            const likeWeight = post.likes.length / 100
            const commentWeight = post.comments.length / 100
            post.weight = ageWeight + likeWeight + commentWeight
        })

        filterProduct.sort((a, b) => b.weight - a.weight)
        return res.status(200).json(filterProduct)
    } catch (error) {
        return res.status(500).json("server error")
    }


})

//get a user for follow
router.get("/all/user/:id", verifyToken, async (req, res) => {
    try {
        const alluser = await User.find()
        const user = await User.findById(req.params.id)
        const followinguser = await Promise.all(
            user.following.map((item) => {
                return item
            })
        )
        let userToFollow = alluser.filter((val) => {
            return !followinguser.find((item) => {
                return val._id.toString() === item
            })
        })

        let filterUser = await Promise.all(
            userToFollow.map((item) => {
                const { email, followers, following, password, ...others } = item._doc
                return others
            })
        )
        res.status(200).json(filterUser)
    } catch (error) {

    }
})

router.put("/update/password/:id", verifyToken, async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        console.log(user)
        if (!user) {
            return res.status(400).json("User not found")
        }
        const isPasswordMatch = await bcrypt.compare(req.body.oldpassword, user.password)
        console.log(isPasswordMatch)
        if (!isPasswordMatch) {
            return res.status(400).json("Old Password does not match")
        }
        if (req.body.newPassword !== req.body.comfirmPassword) {
            return res.status(400).json("Password does not match")
        }
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(req.body.newPassword, salt)
        await user.save()
        return res.status(200).json("Your password is Update")
    } catch (error) {
        return res.status(500).json("Server error")
    }

})

router.get("/get/search/user", verifyToken, async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { username: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },

                ]
            } : {}
        const users = await User.find(keyword).find({ _id: { $ne: req.user.id } })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json("Server error")
    }
})

//Explore post

router.get("/explore", verifyToken, async (req, res) => {
    try {

        const userPost = await Post.find()

        userPost.forEach((post) => {
            const postAge = new Date - new Date(post.createdAt)
            const ageWeight = 1 - postAge / (1000 * 60 * 60 * 24)
            const likeWeight = post.likes.length / 100
            const commentWeight = post.comments.length / 100
            post.weight = ageWeight + likeWeight + commentWeight
        })

        userPost.sort((a, b) => b.weight - a.weight)
        return res.status(200).json(userPost)
    } catch (error) {
        return res.status(500).json("server error")
    }


})






module.exports = router

