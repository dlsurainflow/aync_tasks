"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "userID",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Report, {
        foreignKey: "reportID",
        onDelete: "CASCADE",
      });
    }
  }
  Vote.init(
    {
      action: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Vote",
      timestamp: true,
    }
  );
  return Vote;
};
