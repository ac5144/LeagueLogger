var fs          = require("fs"),
    mongoose    = require("mongoose");

var Champion    = require("./models/champion"),
    Post        = require("./models/post");

function seedDB(option="none") {
    var data = JSON.parse(fs.readFileSync("./data.txt", "utf8")).data;
    
    if(option === "none") {
        Champion.remove({}, function(err){
            if(err){
               console.log(err);
            } else {
               for(var champ in data) {
                   Champion.create(data[champ], function(err, champion){
                       if(err){
                           console.log(err);
                       } else {
                           champion.save();
                       }
                   });
               }
            }
        });
    } else if(option === "rm-posts") {
        console.log("removing posts");
        Post.remove({}, function(err){});
    }
}

module.exports = seedDB;