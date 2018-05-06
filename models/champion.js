var mongoose = require("mongoose");

var championSchema = {
    key: String,
    name: String
}

module.exports = mongoose.model("Champion", championSchema);