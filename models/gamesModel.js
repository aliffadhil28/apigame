import { DataTypes, Sequelize } from "sequelize";
import { dbConnect } from "../config.js";

export const Games = dbConnect.define(
  "Games",
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
  },
  {
    dbConnect,
    tableName: "games",
    timestamps: true,
  }
);
