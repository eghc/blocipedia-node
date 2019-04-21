'use strict';

 const faker = require("faker");
 const bcrypt = require("bcryptjs");
 const salt = bcrypt.genSaltSync();

let users= [];

for(let i = 1 ; i <= 15 ; i++){
    users.push({
      email: "test_" + i.toString() + "@gmail.com",
      password: bcrypt.hashSync(faker.hacker.noun(), salt),
      role: Math.random() * Math.floor(3),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Users", null, {});
  }
};
