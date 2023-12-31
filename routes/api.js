const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const verifyToken = require("../middlewares/verifyToken");
const isLoggedIn = require("../middlewares/isLoggedIn");
const validateBlog = require("../middlewares/validateBlog");
const validateComment = require("../middlewares/validateComment");

const storage = multer.memoryStorage();
const upload = multer({
    storage,
});

const router = express.Router();

router.get("/user", verifyToken, async (req, res) => {
    const user = await User.findOne(
        { username: req.query.username },
        "username"
    );

    res.json(user);
});

router.get("/login", isLoggedIn, (req, res) => {
    res.json(req.isLoggedIn);
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error("Incorrect username");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error("Incorrect password");
        }

        jwt.sign(
            { user },
            process.env.JWT_KEY,
            { expiresIn: "1d" },
            (err, token) => res.json({ token })
        );
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
});

router.get("/blogs", async (req, res) => {
    const blogs = await Post.find().populate("author", "username");
    res.json(blogs);
});

router.get("/blogs/published", async (req, res) => {
    const publishedBlogs = await Post.find({ published: true }).populate(
        "author",
        "username"
    );

    res.json(publishedBlogs);
});

router.post(
    "/blogs",
    verifyToken,
    upload.single("image"),
    validateBlog,
    async (req, res, next) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                res.status(422).json(result.errors);
                return;
            }

            const img = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };

            const blog = new Post({
                title: req.body.title,
                description: req.body.description,
                author: req.authData.user._id,
                body: req.body.body,
                published: JSON.parse(req.body.published),
                img,
            });

            await blog.save();

            res.json(blog);
        } catch (e) {
            console.error(e.message);
            next(e.message);
        }
    }
);

router.get("/blogs/:blogId", async (req, res) => {
    const blog = await Post.findById(req.params.blogId)
        .populate("author")
        .populate({ path: "comments", options: { sort: { date: -1 } } });

    res.json(blog);
});

router.get("/blogs/:blogId/comments/:commentId", async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        res.json(comment);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete("/blogs/:blogId", verifyToken, async (req, res) => {
    const deletedBlog = await Post.findByIdAndDelete(req.params.blogId);
    await Comment.deleteMany({ _id: { $in: deletedBlog.comments } });

    res.send(`Deleted ${deletedBlog.title}`);
});

router.post("/blogs/:blogId/comment", validateComment, async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400).json(result.errors);
        return;
    }

    const comment = new Comment({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
    });
    await comment.save();

    const blog = await Post.findById(req.params.blogId);

    blog.comments.push(comment);

    await blog.save();

    res.json(blog);
});

router.put(
    "/blogs/:blogId",
    verifyToken,
    upload.single("image"),
    validateBlog,
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(422).json(result.errors);
            return;
        }

        try {
            const img = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };

            const { title, description, body, published } = req.body;

            const updatedBlog = {
                _id: req.params.blogId,
                title,
                description,
                body,
                published: JSON.parse(published),
                img,
                author: req.authData.user._id,
            };

            if (req.file) {
                updatedBlog.img = img;
            } else if (!req.img) {
                updatedBlog.$unset = { img: 1 }; // This will remove the 'file' field from the document
            }

            const blog = await Post.findByIdAndUpdate(
                req.params.blogId,
                updatedBlog
            );
            res.json(blog);
        } catch (e) {
            console.error(e);
            res.sendStatus(404);
        }
    }
);

router.delete(
    "/blogs/:blogId/comments/:commentId",
    verifyToken,
    async (req, res) => {
        try {
            const { commentId, blogId } = req.params;

            const commentObjectId = new mongoose.Types.ObjectId(commentId);

            const updatedPostComment = await Post.findByIdAndUpdate(
                blogId,
                { $pull: { comments: commentObjectId } },
                { new: true }
            );

            await Comment.findByIdAndDelete(commentId);

            res.json(updatedPostComment);
        } catch (err) {
            console.error(err);
            res.status(403).json(err);
        }
    }
);

module.exports = router;
