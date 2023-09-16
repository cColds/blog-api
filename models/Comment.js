const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now() },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
