const format = require("date-fns/format");

function formatDateTitle() {
    const formattedDateTitle = format(
        new Date(this.date),
        "EEEE, MMMM d, y 'at' hh:mm:ss a"
    );

    return formattedDateTitle;
}

module.exports = formatDateTitle;
