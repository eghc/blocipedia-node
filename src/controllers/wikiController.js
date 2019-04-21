const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
var fs = require('fs');

module.exports = {
  show(req, res, next){
    wikiQueries.getAllWikis((err, wikis) => {
      if(err){
        res.redirect(500, "/");
      } else {
        //console.log(topics);
        res.render("wiki/index", {wikis});
      }
    });
  },
  new(req, res, next){
    res.render("wiki/new");
  },
  create(req, res, next){
    //#1

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
    //res.redirect("/wiki");
  },
  showWiki(req, res, next){
    //console.log(req.params.id);
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(500, "/wiki/");
      }else{
        res.render("wiki/show",{wiki: wiki});
      }
    });
  },
  edit(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(500, "/wiki/");
      }else{
        res.render("wiki/edit",{wiki: wiki});
      }
    });
  },
  update(req, res, next){
    let updateArticle = {
        title: req.body.title,
        body: req.body.body,
        private: req.body.private === 'on' ? true: false,
        userId: req.user.id
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
  }
}
