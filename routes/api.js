const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, check, validationResult } = require("express-validator");
const Post = require("../models/Post");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");

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
            (err, token) => {
                res.json({
                    token,
                });
            }
        );
    } catch (e) {
        res.json({ error: e.message });
    }
});

router.get("/blogs", async (req, res) => {
    const blogs = await Post.find();

    res.json(blogs);
});

router.post(
    "/blogs",
    verifyToken,
    upload.single("image"),
    body("title").trim().notEmpty().withMessage("Title cannot be empty"),
    body("author").trim().notEmpty().withMessage("Author cannot be empty"),
    body("body").trim().notEmpty().withMessage("Body cannot be empty"),
    check("image").custom((value, { req }) => {
        const validImageExts = [
            "image/webp",
            "image/png",
            "image/jpeg",
            "image/avif",
        ];

        if (req.file && !validImageExts.includes(req.file.mimetype)) {
            throw new Error(
                "File extension must be .webp, .png, .jpg/jpeg, or .avif"
            );
        }

        return true;
    }),
    body("published")
        .isIn(["true", "false"])
        .withMessage("Published must be true/false"),
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

module.exports = router;
