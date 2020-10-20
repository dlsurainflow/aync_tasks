"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Report, {
        foreignKey: "userID",
      });
      this.hasMany(models.ReportHistory, {
        foreignKey: "userID",
      });
      this.hasMany(models.Vote, {
        foreignKey: "userID",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      roleIntID: DataTypes.INTEGER,
      tenantID: DataTypes.STRING,
      points: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
      timestamp: true,
    }
  );
  return User;
};
