// #1
const User = require("./models").User;
const bcrypt = require("bcryptjs");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = {
  getUser(id,callback){
    return User.findById(id)
    .then((user) =>{
      callback(null,user);
    });
  },
  getUsers(emails, callback){
      //let result = {};
      return User.findAll({
        where:{
          email: {
            [Op.in]: emails
          }
        }
      })
      .then((users) => {
        callback(null, users);
      })

    },
// #2
  createUser(newUser, callback){

// #3
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

// #4
    return User.create({
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  upgradeUser(req, callback){

// #1
     return User.findById(req.user.id)
     .then((user) => {
       //console.log(user);
// #2
       if(!user){
         return callback("User not found");
       }

       let updatedUser = {
         email: user.email,
         password: user.password,
         role: 1
       }
         user.update(updatedUser, {
           fields: Object.keys(updatedUser)
         })
         .then(() => {
           callback(null, user);
         })

     });
   },

  downgradeUser(req, callback){

 // #1
      return User.findById(req.user.id)
      .then((user) => {
        //console.log(user);
 // #2
        if(!user){
          return callback("User not found");
        }

        let updatedUser = {
          email: user.email,
          password: user.password,
          role: 0
        }
          user.update(updatedUser, {
            fields: Object.keys(updatedUser)
          })
          .then(() => {
            callback(null, user);
          })

      });
    }

}
