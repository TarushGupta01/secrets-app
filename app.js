//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const passport = require("passport");
const session = require("express-session");
const passportlocalmongoose = require("passport-local-mongoose");

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(('public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersdb", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
});
const userschema = new mongoose.Schema({
    username: String,
    password: String
});

userschema.plugin(passportlocalmongoose);
const User = new mongoose.model("User", userschema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////////////SUBMIT///////////////////////////////////

app.route("/submit")
    .get((req, res) => {
        res.render("submit");
    });

//////////////////////LOGOUT//////////////////////////////////////////

app.route("/logout")
    .get((req, res) => {
        req.logout();
        res.redirect("/");    
    });

//////////////////////SECRETS////////////////////////////////////////////////

app.route("/secrets")
    .get((req, res) => {
        if(req.isAuthenticated())  {
            res.render("secrets");
        }else {
            res.redirect("/login");
        }    
    });

////////////////////REGISTER////////////////////////////////

app.route("/register")
    .get((req, res) => {
        res.render('register');
    })

    .post((req, res) => {
        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if(!err) {
                passport.authenticate('local')(req, res, () => { // to setup cookie to save their logged in session
                    res.redirect('/secrets');
                });
            } else {
                console.log(err);
                console.log(req.body.username);
                res.redirect('/register');
            }
        });
    });

/////////////////////LOGIN////////////////////////////////////

app.route("/login")
    .get((req, res) => {
        res.render('login');
    })

    .post((req, res) => {
        const uname = req.body.username;
        const pass = req.body.password;

        const user1 = new User({
            username: uname,
            password: pass
        });

        req.login(user1, (err) => {
            if(!err)  {
                passport.authenticate('local')(req, res, ()=> {
                    console.log("redirected");
                    res.redirect('/secrets');
                })
            }else {
                console.log(err);
            }
        })

    });

/////////////HOME/////////////////////

app.get("/", (req, res) => {
    res.render("home");
});

app.listen(3000, function() {
    console.log("Server listening!");
});

