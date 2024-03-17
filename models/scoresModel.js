import { DataTypes, Sequelize } from "sequelize";
import { dbConnect } from "../config.js";

export const Scores = dbConnect.define(
  "Scores",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class : {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    dbConnect,
    tableName: "scores",
    timestamps: true,
  }
);
