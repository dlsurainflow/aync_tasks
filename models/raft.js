"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RAFT extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RAFT.init(
    {
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      altitude: DataTypes.FLOAT,
      flood_depth: DataTypes.FLOAT,
      rainfall_amount: DataTypes.FLOAT,
      rainfall_rate: DataTypes.FLOAT,
      temperature: DataTypes.FLOAT,
      pressure: DataTypes.FLOAT,
      humidity: DataTypes.FLOAT,
      deviceID: DataTypes.STRING,
      tenantID: DataTypes.STRING,
      polyID: DataTypes.STRING,
      username: DataTypes.STRING,
      position: DataTypes.GEOMETRY("POINT", 4326),
      address: DataTypes.STRING,
      water_level: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "RAFT",
    }
  );
  return RAFT;
};
