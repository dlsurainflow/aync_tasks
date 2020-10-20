"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Vote, {
        foreignKey: "reportID",
      });
      this.belongsTo(models.User, {
        foreignKey: "userID",
        onDelete: "CASCADE",
      });
    }
  }
  ReportHistory.init(
    {
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      rainfall_rate: DataTypes.DOUBLE,
      flood_depth: DataTypes.DOUBLE,
      upvote: DataTypes.JSON,
      downvote: DataTypes.JSON,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ReportHistory",
      timestamp: true,
    }
  );
  return ReportHistory;
};
