import express from "express";
import db from "../models/index.js";
import { jwtKey } from "../config.js";
import jwt from "jsonwebtoken";
import bodyParser from 'body-parser';
import { Rooms } from "../models/roomsModel.js";

const router = express.Router();
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const Room = db.Rooms;

router.get("/:class", async (req, res) => {
    try {
      const { class: cls } = req.params;
      
      const rooms = await Room.findAll({
        where: {
          class: cls,
        },
        order : [["name","DESC"]]
      });
  
      return res.status(200).json({
        success: true,
        message: "Request successful",
        rooms: rooms,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

router.post("/",async(req,res)=>{
    try {
        const { cls,name } = req.body;
        
        if (cls === undefined ||name ===undefined) {
            return res.status(500).json({
                success : false,
                message:"Missing parameter"
            })
        }

        const rooms = await Rooms.create(req.body);

        return res.status(200).json({
          success: true,
          message: "Request successful",
          rooms: rooms,
        });
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
})

export default router;
