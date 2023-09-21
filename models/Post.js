const { Schema, model } = require("mongoose");
const formatDate = require("../utils/formatDate");
const formatDateTitle = require("../utils/formatDateTitle");

const postSchema = new Schema(
    {
        title: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        body: { type: String, required: true },
        date: { type: Date, default: Date.now() },
        published: { type: Boolean, required: true },
        img: { data: Buffer, contentType: String },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    },
    { toJSON: { virtuals: true } }
);

postSchema.virtual("imgUrl").get(function getImgUrl() {
    if (!this.img.data) return "";
    const base64 = this.img.data.toString("base64");
    return `data:${this.img.contentType};base64,${base64}`;
});

postSchema.virtual("formatDate").get(function formatPostDate() {
    formatDate(this.date);
});

postSchema.virtual("formatDateTitle").get(formatDateTitle);

const Post = model("Post", postSchema);

module.exports = Post;
