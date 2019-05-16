const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const collaboratorQueries = require("../db/queries.collaborators.js");
const passport = require("passport");
const Authorizer = require("../policies/wiki");
var fs = require('fs');
const markdown = require( "markdown" ).markdown;

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
    const authorized = new Authorizer(req.user).create();

    if(authorized) {
      let newArticle = {
          title: req.body.title,
          body: markdown.toHTML(req.body.body),
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
          //console.log(wiki.collaborators[0]);
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
      wiki.body = wiki.body.replace(/<p>/g,"");
      wiki.body = wiki.body.replace(/<\/\p>/g,"");
      //console.log(wiki.body);
      //console.log(wiki);
      if(err || wiki == null){
        res.redirect(500, "/wiki/");
      }else{
        const authorized = new Authorizer(req.user, wiki).edit();
        if(authorized){
          console.log(wiki.collaborators);
          if(wiki.private && wiki.collaborators.length != 0){
            console.log(wiki.collaborators);
            //since private, get collaborators
            let collaborators = [];
            //console.log(wiki.collaborators);
            wiki.collaborators.forEach((collab) => {
              console.log("checking if collaborators exist");
              if(err){
                res.redirect(`/wiki/${req.params.id}`);
              }else{
                userQueries.getUser(collab.userId, (err, user) => {
                  if(err){
                    res.redirect(`/wiki/${req.params.id}`);
                  }else{
                    //console.log(user);
                    collaborators.push(user.email);
                    //when we have all collaborators
                    if(collaborators.length === wiki.collaborators.length){
                      //console.log(collaborators);
                      res.render("wiki/edit",{wiki: wiki, collaborators:collaborators.toString()});
                    }
                  }
              });
              }
            });

          }else{
            res.render("wiki/edit",{wiki: wiki, collaborators: ""});
          }
        }else{
          req.flash("You are not authorized to do that.")
          res.redirect(`/wiki/${req.params.id}`);
        }
      }
    });
  },
  update(req, res, next){
    //const privacyAuthorized = new Authorizer(req.user, wiki).updatePrivacy();
    //console.log(req.body.privateTrue);
    wikiQueries.getWiki(req.params.id, (err, w) => {

      let updateArticle = {
          title: req.body.title,
          body: markdown.toHTML(req.body.body),
          private: (req.body.private === 'on')  ? true : ((w.private) ? true : false )
      };

      //console.log(collaborators);
      //check if the users exist first

      wikiQueries.updateWiki(req, updateArticle, (err, wiki) => {
        console.log(err);
        if(err || wiki == null){
          res.redirect(404, `/wiki/${req.params.id}/edit`);
        } else {

            //if update successful and it is private, update collaborators
          if(wiki.private){
            //get collaborators
            let collaborators = [];
            if(req.body.collaborators && req.body.collaborators.length != 0){
              console.log("test");
              collaborators = req.body.collaborators.split(",");
              for(let i = 0; i<collaborators.lenth; i++){
                collaborators[i] = collaborators[i].trim();
              }
              userQueries.getUsers(collaborators, (err, users) => {
                  //console.log(users);
                if(err || collaborators.length !== users.length){
                      //TODO: redirect does not work
                  res.flash("Invalid email for collaborator");
                  res.redirect(`/wiki/${req.params.id}/edit`);
                }else{
                  //confirm that users are standard
                  users.forEach((u) => {
                    if(u.role < 1){
                      res.flash("Invalid email for collaborator");
                      res.redirect(`/wiki/${req.params.id}/edit`);
                    }
                  });

                  collaboratorQueries.updateCollaborators(users, req.params.id,  (err, collab ) =>{
                    if(err){
                      req.flash("notice", err);
                      res.redirect(404, `/wiki/${req.params.id}/edit`);
                    }else{
                      res.redirect(`/wiki/${wiki.id}`);
                    }
                  });
                }
            });
            }else{
              res.redirect(`/wiki/${wiki.id}`);
            }
          }else{
            res.redirect(`/wiki/${wiki.id}`);
          }
        }
      });

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
        //console.log("1");
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
  },
  getCollabWikis(req,res,next){
    const authorized = new Authorizer(req.user).private();
    if(authorized){
      console.log("authorized");
      wikiQueries.getCollabWikis(req, (err, wikis) => {
        //console.log("1");
        if(err){
          //console.log(err);
          res.send(null);
        } else {
          //console.log(wikis[0].dataValues);
          //console.log(wikis);
          console.log("successful load");
          res.send(wikis);
        }
      });
    }else{
      req.flash("You are not authorized to do that.")
      res.redirect(`/`);
    }
  }
}
