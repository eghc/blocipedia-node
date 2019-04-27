const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
const Authorizer = require("../policies/wiki");
var fs = require('fs');

module.exports = {
  show(req, res, next){
    wikiQueries.getAllWikis((err, wikis) => {
      console.log(err);
      if(err){
        res.redirect(500, "/");
      } else {
          let authorized= new Authorizer(req.user)._isUser();
          console.log(authorized);
          if(authorized){
            authorized = new Authorizer(req.user).private();
            console.log(authorized);
            wikiQueries.getAllPrivateWikis((err, privateWikis) => {
              console.log(err);
              if(err){
                res.redirect(500, "/");
              }else{
                res.render("wiki/index", {wikis: wikis, privateWikis:privateWikis});
              }
            });
          } else{
             res.render("wiki/index", {wikis: wikis, privateWikis:[{id:null, title:null, body: ''}]});
          }
      }
    });
  },
  new(req, res, next){
    const authorized = new Authorizer(req.user).new();
    if(authorized) {
      res.render("wiki/new");
    }else{
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wiki");
    }
  },
  create(req, res, next){
    //#1
    const authorized = new Authorizer(req.user, wiki).create();

    if(authorized) {
      let newArticle = {
          title: req.body.title,
          body: req.body.body,
          private: req.body.private === 'on' ? true: false,
          userId: req.user.id
      };
      //console.log(newArticle);

      wikiQueries.addWiki(newArticle, (err, wiki) => {
        //console.log(err);
          if(err){
            res.redirect(500, "/wiki/new");
          } else {
            res.redirect(303, `/wiki/${wiki.id}`);
          }
      });
    } else{
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wiki");
    }
    //res.redirect("/wiki");
  },
  showWiki(req, res, next){
    //console.log(req.params.id);
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(500, "/wiki/");
      }else{
        if(wiki.private){
          let authorized = new Authorizer(req.user, wiki).privateRecord();
          if(authorized){
            res.render("wiki/show",{wiki: wiki});
          }else{
            req.flash("notice", "You are not authorized to do that.");
            res.redirect("/wiki");
          }
        }else{
          res.render("wiki/show",{wiki: wiki});
        }
      }
    });
  },
  edit(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(500, "/wiki/");
      }else{
        const authorized = new Authorizer(req.user, wiki).edit();
        if(authorized){
          res.render("wiki/edit",{wiki: wiki});
        }else{
          req.flash("You are not authorized to do that.")
          res.redirect(`/wiki/${req.params.id}`);
        }
      }
    });
  },
  update(req, res, next){
    let updateArticle = {
        title: req.body.title,
        body: req.body.body,
        private: req.body.private === 'on' ? true: false,
    };
    wikiQueries.updateWiki(req, updateArticle, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, `/wiki/${req.params.id}/edit`);
      } else {
        res.redirect(`/wiki/${wiki.id}`);
      }
    });
  },
  delete(req, res, next){
    wikiQueries.deleteWiki(req, (err, wiki) => {
      if(err){
        res.redirect(500, `/wiki/${wiki.id}`)
      } else {
        res.redirect(303, "/wiki")
      }
    });
  },
  getPrivateWikis(req,res,next){
    const authorized = new Authorizer(req.user).private();
    if(authorized){
      wikiQueries.getMyPrivateWikis(req, (err, wikis) => {
        console.log("1");
        if(err){
          //do something
          res.send(null);
        } else {
          //console.log(wikis[0].dataValues);
          res.send(wikis);
        }
      });
    }else{
      req.flash("You are not authorized to do that.")
      res.redirect(`/`);
    }
  }
}
