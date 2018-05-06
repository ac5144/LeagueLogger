// DEPENDENCIES
var bodyParser      = require("body-parser"),
    flash           = require("connect-flash"),
    ejs             = require("ejs"),
    express         = require("express"),
    fs              = require("fs"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local");
    
// MODELS
var Champion = require("./models/champion"),
    Post = require("./models/post"),
    User = require("./models/user");

var seedDB = require("./seed");

// LOCALS
var champions = getChampData();

mongoose.connect("mongodb://localhost/league_logger");

// APP SETUP
var app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
//seedDB("rm-posts");

// PASSPORT SETUP
app.use(require("express-session")({
    secret: "why does everybody on my team suck",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

// ROUTES
app.get("/", function(req, res){
    if(req.user) {
        res.redirect("/champions");
    } else {
        res.render("landing");
    }
});

// SIGNUP
app.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to League Logger, " + user.username);
                res.redirect("/champions");
            })
        }
    });
});

//LOGIN
app.get("/login", function(req, res){
    res.render("login");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/champions",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){});

//LOGOUT
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// CHAMPION POST ROUTES
app.get("/champions", isLoggedIn, function(req, res){
    res.render("index", {champions: getChampKeys(champions.data), static_champions: champions.data});
});

app.get("/champions/:champion", isLoggedIn, function(req, res){
    Champion.findOne({key: req.params.champion}, function(err, champion){
        if (err) {
            res.redirect("back");
        } else {
            if(champion){
                Post.find({'champion.id': champion._id, "author.id": req.user._id}, function(err, posts){
                    if (err){
                        res.redirect("back");
                    } else {
                        res.render("champion", {champion: champion, posts: posts});
                    }
                });
            } else {
                res.redirect("/");
            }
        }
    });
    
});

app.post("/champions/:champion/new", isLoggedIn, function(req, res){
    Champion.findOne({key: req.params.champion}, function(err, foundChamp){
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            Post.create(req.body.post, function(err, post){
                if (err){
                    console.log(err);
                    res.redirect("/")
                } else {
                    post.champion.id = foundChamp._id;
                    post.author.id = req.user._id;
                    post.author.username = req.user.username;
                    post.save();
                    req.user.posts.push(post);
                    req.user.save();
                    res.redirect("/champions/" + req.params.champion)
                }
            });
        }
    });
});

// OTHER FUNCTIONS
function getChampData(){
    return JSON.parse(fs.readFileSync("./data.txt", "utf8"));
}
function getChampKeys(data){
    var champs = [];
    for(var champ in data){
        champs.push(champ);
    }
    return champs.sort();
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER RUNNING...");
})