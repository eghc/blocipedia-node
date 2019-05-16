const Collaborators = require("./models").Collaborators;
//const bcrypt = require("bcryptjs");
//const wikiQueries = require("./queries.wikis.js");
//const userQueries = require("./queries.users.js");


module.exports = {
  updateCollaborators(users, wikiId, callback){
    //destroy all collaborators
    return Collaborators.findAll({
      where:{
        wikiId: wikiId
      }
    })
    .then((collaborators) => {
      //destroy each collaborator
      collaborators.forEach((collab) => {
        collab.destroy();
      });

      //add all new collaborators
      users.forEach((user) => {
         Collaborators.create({
           userId: user.id,
           wikiId: wikiId
         })
         .then((collab) => {
           callback(null, collab);
         })
         .catch((err) => {
           callback(err);
         })
      });
    })
    .catch((err) => {
      callback(err);
    })

  },

  deleteCollaboration(req){
    return Collaborators.findAll({
       where: {
         userId: req.user.id
       }
     })
    .then((collabs) => {
      if(!collabs){
        return callback("Nothing to update");
      }

      collabs.forEach((collab) =>{
        collab.destroy();
      });
    });
  }
}
