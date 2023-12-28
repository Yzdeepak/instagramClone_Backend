const router = require("express").Router()
const Post = require("../Modal/Post")
const verifyToken = require("./verifyToken")

router.post("/new/post", verifyToken, async (req, res) => {
    try {
        const { title, image } = req.body

        const post = await Post.create({
            title: title,
            image: image,
            user: req.user.id
        })
        // console.log(post)
        res.status(200).json(post)
    } catch (error) {
        res.status(401).json("somthing went Wrong")
    }


})


router.post("/all/post/by/user", verifyToken, async (req, res) => {
    try {
        const post = await Post.find({ user: req.user.id })
        if (!post) {
            return res.status(400).json("You dont have any post")
        }
        console.log(post)
        return res.status(200).json(post)
    } catch (error) {
        res.status(401).json("somthing went Wrong")
    }


})

router.put("/:id/like", verifyToken, async (req, res) => {
    // try {
    const post = await Post.findById(req.params.id)
    if (!post.likes.includes(req.user.id)) {
        await post.updateOne({ $push: { likes: req.user.id } })
    } else {
        await post.updateOne({ $pull: { likes: req.user.id } })
    }
    console.log(post)
    return res.status(200).json("You just like this post")
    // } catch (error) {
    res.status(400).json("like not work")
    // }
})

router.put("/comment/post", verifyToken, async (req, res) => {
    try {
        const { comment, postid, profile } = req.body
        const comments = {
            user: req.user.id,
            username: req.body.username,
            profile,
            comment
        }
        const post = await Post.findById(postid)

        if (!post) {
            return res.status(401).json("Post not found")
        }
        post.comments.push(comments)
        await post.save()
        return res.status(200).json(post)
    } catch (error) {
        return res.status(401).json("server error")
    }
})



module.exports = router