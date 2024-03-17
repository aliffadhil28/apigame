import { Sequelize } from "sequelize";;

export const dbConnect = new Sequelize(
  "bxpgppxwgalgbjlcgems",
  "uuzykfx8e7flyys5",
  "fxGngsQE09MKucH8jzTw",
  {
    host: "bxpgppxwgalgbjlcgems-mysql.services.clever-cloud.com",
    dialect: "mysql",
    timezone: "Asia/Jakarta",
  }
);

export const jwtKey = "game1v1Hebat2024";

export function ValidateToken(token, res, key = jwtKey) {
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Error!Token was not provided.",
    });
  }
  console.log("tokenize");
  //Decoding the token
  try {
    const decodedToken = jwt.verify(token, key);
    return decodedToken;
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err,
    });
  }
}