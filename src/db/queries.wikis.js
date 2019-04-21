const Wiki = require("./models").Wiki;
//const Authorizer = require("../policies/topic");
const User = require("./models").User;

module.exports = {

//#1
  getAllWikis(callback){
    return Wiki.all()
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
    return Wiki.findById(id)
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
       wiki.destroy()
       .then((res) =>{
         callback(null, wiki);
       });

 // // #2
 //       const authorized = new Authorizer(req.user, topic).destroy();
 //
 //       if(authorized) {
 // // #3
 //         topic.destroy()
 //         .then((res) => {
 //           callback(null, topic);
 //         });
 //
 //       } else {
 //
 // // #4
 //         req.flash("notice", "You are not authorized to do that.")
 //         callback(401);
 //       }
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

       wiki.update(updatedWiki, {
         fields: Object.keys(updatedWiki)
       })
       .then(() => {
         callback(null, wiki);
       })


// // #3
//        const authorized = new Authorizer(req.user, topic).update();
//
//        if(authorized) {
//
// // #4
//          topic.update(updatedTopic, {
//            fields: Object.keys(updatedTopic)
//          })
//          .then(() => {
//            callback(null, topic);
//          })
//          .catch((err) => {
//            callback(err);
//          });
//        } else {
//
// // #5
//          req.flash("notice", "You are not authorized to do that.");
//          callback("Forbidden");
//        }
     });
   }
}
