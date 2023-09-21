const { Schema, model } = require("mongoose");
const formatDate = require("../utils/formatDate");
const formatDateTitle = require("../utils/formatDateTitle");

const commentSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now() },
    },

    { toJSON: { virtuals: true } }
);

commentSchema.virtual("formatDate").get(function formatCommentDate() {
    return formatDate(this.date);
});
commentSchema.virtual("formatDateTitle").get(formatDateTitle);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
