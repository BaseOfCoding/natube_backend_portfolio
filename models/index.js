"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

console.log(config);

const DATA_BASE_URL =
  "postgres://yayhfoizruvvhd:608887976c3155d72e87feea8fbc178f4783e503f5b3e6e801174dd948764e06@ec2-35-153-35-94.compute-1.amazonaws.com:5432/dbc5r4cjb6ejvf";

let sequelize;
sequelize = new Sequelize(DATA_BASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .authenticate()
  .then(() => {})
  .catch((err) => {});

// if (DATA_BASE_URL) {
//   sequelize = new Sequelize(DATA_BASE_URL, {
//     dialect: "postgres",
//     native: true,
//     protocol: "postgres",
//   });
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// postgres://yayhfoizruvvhd:608887976c3155d72e87feea8fbc178f4783e503f5b3e6e801174dd948764e06@ec2-35-153-35-94.compute-1.amazonaws.com:5432/dbc5r4cjb6ejvf
