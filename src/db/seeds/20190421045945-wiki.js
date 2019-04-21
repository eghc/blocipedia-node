'use strict';

 const faker = require("faker");

 //#2
let articles= [];

for(let i = 1 ; i <= 15 ; i++){
    articles.push({
      title: faker.hacker.noun(),
      body: faker.hacker.phrase(),
      private: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: i
    });
  }

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Wikis", articles, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Wikis", null, {});
  }
};
