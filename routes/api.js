const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Post = require("../models/Post");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const validateBlog = require("../middlewares/validateBlog");

const storage = multer.memoryStorage();
const upload = multer({
    storage,
});

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
    res.json(req.authData);
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error("Incorrect username");
        }

        const match = bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error("Incorrect password");
        }

        jwt.sign(
            { user },
            process.env.JWT_KEY,
            { expiresIn: "15m" },
            (err, token) => res.json({ token })
        );
    } catch (e) {
        res.json({ error: e.message });
    }
});

router.get("/blogs", async (req, res) => {
    const blogs = await Post.find().populate("author");

    res.json(blogs);
});

router.post(
    "/blogs",
    verifyToken,
    upload.single("image"),
    validateBlog,
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.json(result.errors);
            return;
        }

        const img = req.file
            ? {
                  data: Buffer.from(req.file.buffer).toString("base64"),
                  contentType: req.file.mimetype,
              }
            : undefined;
        const blog = new Post({
            title: req.body.title,
            author: req.body.author,
            body: req.body.body,
            published: JSON.parse(req.body.published),
            img,
        });

        await blog.save();

        res.json(blog);
    }
);

router.get("/blogs/:blogId", async (req, res) => {
    const blog = await Post.findById(req.params.blogId).populate("author");
    res.json(blog);
});

router.post(
    "/blogs/:blogId",
    verifyToken,
    upload.single("image"),
    validateBlog,
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.json(result.errors);
            return;
        }

        try {
            const img = req.file
                ? {
                      data: Buffer.from(req.file.buffer).toString("base64"),
                      contentType: req.file.mimetype,
                  }
                : undefined;

            const updatedBlog = {
                _id: req.params.blogId,
                title: req.body.title,
                author: req.body.author,
                img,
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

module.exports = router;
