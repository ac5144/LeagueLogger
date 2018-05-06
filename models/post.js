var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    title: String,
    content: String,
    created: {
        type: Date,
        default: Date.now()
    },
    champion: {
        id: mongoose.Schema.Types.ObjectId
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Post", postSchema);