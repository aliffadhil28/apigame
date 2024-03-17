import { dbConnect } from "../config.js";
import { Scores } from "./scoresModel.js";
import { Games } from "./gamesModel.js";
import { Rooms } from "./roomsModel.js";
import { Users } from "./usersModel.js";

const db = {}

db.dbConnect = dbConnect;
db.Scores = Scores
db.Games = Games
db.Rooms = Rooms
db.Users = Users

db.Scores.belongsTo(db.Users,{foreignKey: 'userId'})
db.Rooms.hasMany(db.Games)
db.Users.hasMany(db.Games)

export default db;