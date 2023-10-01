const { body, check } = require("express-validator");

const validateBlog = [
    body("title").trim().notEmpty().withMessage("Title cannot be empty"),
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
];

module.exports = validateBlog;
