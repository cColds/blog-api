const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    published: { type: Boolean, required: true },
    img: { data: Buffer, contentType: String },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

postSchema.virtual("imgUrl").get(function getImgUrl() {
    if (!this.img.data) return "";
    const base64 = this.img.data.toString("base64");
    return `data:${this.img.contentType};base64,${base64}`;
});

const Post = model("Post", postSchema);

module.exports = Post;
