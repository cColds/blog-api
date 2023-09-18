const { Schema, model } = require("mongoose");
const format = require("date-fns/format");
const intervalToDuration = require("date-fns/intervalToDuration");
const formatDistanceToNow = require("date-fns/formatDistanceToNow");

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

postSchema.virtual("formatDate").get(function formatDate() {
    const dateDiff = intervalToDuration({
        start: new Date(this.date),
        end: new Date(),
    });

    if (!dateDiff.months) {
        const dateDistanceInWords = formatDistanceToNow(new Date(this.date));
        return `${dateDistanceInWords} ago`;
    }

    const formattedDate = format(new Date(this.date), "MMM d, y");
    return formattedDate;
});

postSchema.virtual("formatDateTitle").get(function formatDateTitle() {
    const formattedDateTitle = format(
        new Date(this.date),
        "EEEE, MMMM d, y 'at' hh:mm:ss a"
    );

    return formattedDateTitle;
});

const Post = model("Post", postSchema);

module.exports = Post;
