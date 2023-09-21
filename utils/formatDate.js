const format = require("date-fns/format");
const intervalToDuration = require("date-fns/intervalToDuration");
const formatDistanceToNowStrict = require("date-fns/formatDistanceToNowStrict");

function formatDate(date) {
    const dateDiff = intervalToDuration({
        start: date,
        end: new Date(),
    });

    if (!dateDiff.months) {
        const dateDistanceInWords = formatDistanceToNowStrict(date, {
            addSuffix: true,
        });
        return dateDistanceInWords;
    }

    const formattedDate = format(date, "MMM d, y");
    return formattedDate;
}

module.exports = formatDate;
