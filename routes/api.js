const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

router.get("/blogs", async (req, res) => {
    const blogs = await Post.find();

    res.json(blogs);
});

module.exports = router;
