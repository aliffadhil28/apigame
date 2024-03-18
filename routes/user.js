import express from "express";
import db from "../models/index.js";
import { jwtKey } from "../config.js";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
// import { Users } from "../models/usersModel.js";

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const User = db.Users;

router.get("/:nim", async (req, res) => {
  try {
    const { nim: nim } = req.params;

    const userData = await User.findOne({
      where: {
        nim: nim,
      },
      order: [["name", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Request successful",
      user: userData,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
