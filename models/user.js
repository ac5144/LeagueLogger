var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    recent_champs: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Champion"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);