const express = require("express");
const session = require("express-session");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const app = express();

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useUnifiedTopology: true, //required for initialise
    useNewUrlParser: true, //required for initialise
    useCreateIndex: true, //use to enable unique data type
    useFindAndModify: false, // use findOneAndUpdate instead of findAndModify
  })
  .then(() => console.log("mongodb connecteddddddddddd"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//middleware
app.engine("hbs", hbs({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static(__dirname + " /public"));
app.use(
  session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  //setup user model
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new localStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: " Incorrect username." });
      }

      bcrypt.compare(password, user.password, function (err, res) {
        if (err) return done(err);
        if (res === flase) {
          return done(null, false, { message: "incorrect password." });
        }
        return done(null, user);
      });
    });
  })
);

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.listen(3000, () => {
  console.log(`listening on post 3000`);
});
