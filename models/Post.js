const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    published: { type: Boolean, required: true },
    img: {
        data: Buffer,
        contentType: String,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

const Post = model("Post", postSchema);

module.exports = Post;
