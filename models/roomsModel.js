import { DataTypes, Sequelize } from "sequelize";
import { dbConnect } from "../config.js";

export const Rooms = dbConnect.define("Rooms", {
    id:{
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:true
    },
    name : {
        type: DataTypes.STRING,
        allowNull:false
    },
    class : {
        type: DataTypes.STRING,
        allowNull:false
    }
},{
    dbConnect,
    tableName: "rooms",
    timestamps: true,
  });
