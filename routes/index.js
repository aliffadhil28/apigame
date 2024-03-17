import express from "express";
import db from "../models/index.js";
import { jwtKey } from "../config.js";
import jwt from "jsonwebtoken";
import bodyParser from 'body-parser';

const router = express.Router();
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const User = db.Users;

router.post("/login", async (req, res) => {
  try {
    const { nim } = req.body;
    
    const userExist = await User.findOne({
      where: {
        nim: nim,
      },
    });
    
    if (!userExist || userExist == null) {
      console.log("user not found");
      return res.status(404).json({
        success: false,
        message: "User not found please check your credential again",
      });
    }

    let token;

    token = await jwt.sign(
      {
        nim: userExist.nim,
        admin: userExist.admin,
        class: userExist.class,
      },
      jwtKey,
      { expiresIn: "2h" }
    );

    req.session.token = token;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userExist,
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
