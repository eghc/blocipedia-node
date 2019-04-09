const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
var fs = require('fs');

module.exports = {
  signupForm(req, res, next){
    fs.readFile('./src/views/signup.ejs', 'utf8', function(err, contents) {
        //console.log(contents);
        res.send(contents);
    });
  },
  loginForm(req, res, next){
    fs.readFile('./src/views/login.ejs', 'utf8', function(err, contents) {
        //console.log(contents);
        res.send(contents);
    });
  },
  create(req, res, next){
  //#1
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
  // #2
    userQueries.createUser(newUser, (err, user) => {
      if(err){
        req.flash("error", err);
        res.redirect("/");
      } else {

  // #3
        passport.authenticate("local")(req, res, () => {
          //console.log("Signed in!");
          req.flash("notice", "You've successfully signed up!");
          res.redirect("/");

          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: req.body.email,
            from: 'test@example.com',
            subject: 'Welcome to Blocipedia',
            text: 'Thanks for signing up!!',
            html: '<strong>Thanks for signing up!!</strong>',
          };
          sgMail.send(msg);
        })
      }
    });
  },
  login(req, res, next){
    passport.authenticate("local")(req, res, function () {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.")
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },
  logout(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  }
}
