const Wiki = require("./models").Wiki;
const Collaborators = require("./models").Collaborators;
const Authorizer = require("../policies/wiki");
//const collaboratorsQueries = require("./queries.collaborators.js");


module.exports = {

//#1
  getAllWikis(callback){
    return Wiki.findAll({
      where:{
        private: false
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    })
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getAllPrivateWikis(callback){
    return Wiki.findAll({
      where:{
        private: true
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    })
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addWiki(newArticle, callback){
    return Wiki.create({
      title: newArticle.title,
      body: newArticle.body,
      private: newArticle.private,
      userId: newArticle.userId
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getWiki(id, callback){
    return Wiki.findById(id, {
      include: [{
        model: Collaborators,
        as: "collaborators"
      }]
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },
  deleteWiki(req, callback){
    return Wiki.findById(req.params.id)
     .then((wiki) => {
       const authorized = new Authorizer(req.user, wiki).destroy();

      if(authorized) {
         wiki.destroy()
         .then((res) =>{
           callback(null, wiki);
         });
      }else {

         req.flash("notice", "You are not authorized to do that.")
         callback(401);
       }

     })
     .catch((err) => {
       callback(err);
     });
  },
  updateWiki(req, updatedWiki, callback){

// #1
     return Wiki.findById(req.params.id)
     .then((wiki) => {

// #2
       if(!wiki){
         return callback("Wiki not found");
       }

       const authorized = new Authorizer(req.user, wiki).update();

       if(authorized){
         wiki.update(updatedWiki, {
           fields: Object.keys(updatedWiki)
         })
         .then(() => {
           callback(null, wiki);
         }).catch((err) => {
           callback(err);
         });
       }else{
         req.flash("notice", "You are not authorized to do that.");
         callback("Forbidden");
       }
     }).catch((err) => {
       callback(err);
     });;
   },
   getMyPrivateWikis(req, callback){
     return Wiki.findAll({
        where: {
          userId: req.user.id,
          private: true
        }
      })
     .then((wikis) => {
       callback(null, wikis);
     })
     .catch((err) => {
       callback(err);
     });
   },
   getCollabWikis(req, callback){
     return Collaborators.findAll({
       where:{
         userId: req.user.id
       }
     }).then((wikiIds) => {
       let wikis = [];

       console.log(wikiIds.length);
       //let count = 0;
       for(let i = 0; i < wikiIds.length; i++){
         Wiki.findById(wikiIds[i].wikiId)
         .then((wiki) => {
           //console.log(wiki);
           if(wiki){
             wikis.push(wiki);
          }
           if(i === wikiIds.length-1){
             callback(null, wikis);
           }
         })
         .catch((err) => {
           callback(err);
         });

       }
         //console.log(w);
      // console.log(wikis);
      // callback(null, wikis);


     })
     .catch((err) => {
       callback(err);
     });

   },
   makePublic(req, callback){
     return Wiki.findAll({
        where: {
          userId: req.user.id,
          private: true
        }
      })
     .then((wikis) => {
       if(!wikis){
         return callback("Nothing to update");
       }
       wikis.forEach((wiki) =>{
         let updatedWiki = {
           title: wiki.title,
           body: wiki.body,
           private: false
         }
         wiki.update(updatedWiki, {
           fields: Object.keys(updatedWiki)
         })
       });
     })
     .catch((err) => {
       callback(err);
     });
   }
}
