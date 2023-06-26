const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();


const sequelize = new Sequelize('groupchatapp', "root" ,"Umesh@123", {
  dialect: 'mysql',
  host: "localhost",
  database: 'groupchatapp'
});

module.exports = sequelize;
