const { body } = require("express-validator");

const validateComment = [
    body("name").trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").trim().isEmail().withMessage("Email is invalid"),
    body("message").trim().notEmpty().withMessage("Message cannot be empty"),
];

module.exports = validateComment;
