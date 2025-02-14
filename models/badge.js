"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Badge.init(
    {
      title: DataTypes.STRING,
      photo: DataTypes.BLOB,
      criteria: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Badge",
      timestampe: true,
    }
  );
  return Badge;
};
