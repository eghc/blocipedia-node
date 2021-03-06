const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const collaboratorsQueries = require("../db/queries.collaborators.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
const Authorizer = require("../policies/application");
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
    passport.authenticate('local', function(err, user, info) {
       if (err) { return next(err); }
       if (!user) {
         req.flash("notice", "Your password is incorrect.");
         return res.redirect('/');
       }
       req.logIn(user, function(err) {
         if (err) { return next(err); }
         req.flash("notice", "You've successfully signed in!");
         return res.redirect('/');
       });
     })(req, res, next);

    // passport.authenticate("local")(req, res, function () {
    //     req.flash("notice", "You've successfully signed in!");
    //     res.redirect("/");
    // })
  },
  logout(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  },
  showProfile(req,res,next){
    const authorized = new Authorizer(req.user)._isUser();
    if(authorized) {
      res.render("profile/index");
    }else{
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/");
    }
  },
  charge(req,res,next){
    const authorized = new Authorizer(req.user)._isUser();
    if(authorized) {
      userQueries.upgradeUser(req, (err, user) => {
        if(err){
          //console.log(err);
          //req.flash("notice", "There was an error upgrading your account.");
          res.redirect(500, "/profile");
        }else{
          res.redirect(303,"/profile");
        }
      });
    }else{
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/");
    }
  },
  downgrade(req,res,next){
    const authorized = new Authorizer(req.user)._isUser();
    if(authorized) {
      userQueries.downgradeUser(req, (err, user) => {
        if(err){
          //console.log(err);
          req.flash("notice", "There was an error downgrading your account.");
          res.redirect(500, "/profile");
        }else{
          wikiQueries.makePublic(req);
          collaboratorsQueries.deleteCollaboration(req);
          res.redirect(303,"/profile");
        }
      });
    }else{
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/");
    }
  }
}
