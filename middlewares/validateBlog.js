const { body, check } = require("express-validator");

const validateBlog = [
    body("title").trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").custom((value) => {
        const description = value.trim();

        if (description.length > 300)
            throw new Error("Description must be 300 characters or fewer");

        return true;
    }),
    body("body").trim().notEmpty().withMessage("Body cannot be empty"),
    check("image").custom((value, { req }) => {
        if (!req.file) throw new Error("Image is required");

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
];

module.exports = validateBlog;
