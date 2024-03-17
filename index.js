import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import db from "./models/index.js";
import { dbConnect, jwtKey } from "./config.js";
import cookieSession from "cookie-session";
import defaultRouter from "./routes/index.js";
import room from "./routes/room.js";
import { Op } from "sequelize";
import serverless from 'serverless-http'

const Game = db.Games;
const Score = db.Scores;
const User = db.Users;

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(
  cookieSession({
    name: "game-session",
    secret: jwtKey,
    path: "/",
    httpOnly: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http listener
app.use("/auth", defaultRouter);
app.use("/room", room);
app.get("/getScore/:cls", async (req, res) => {
  const {cls} = req.params
  const getScore = await Score.findAll({
    where : {
      'class' : cls
    },
    order: [["score", "DESC"]],
    include: User,
  });
  return res.status(200).json({ data: getScore });
});

// end http listener

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let connectedClients = 0;
let roomClients = {};
let answers = {};
let playerReady = {};

io.on("connection", (socket) => {
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive", data);
  });
  socket.on("join_room", async (data) => {
    const { room, nim } = data;
    if (roomClients[room] && roomClients[room].length >= 2) {
      socket.emit("room-info", {
        success: false,
        message: "Room is full",
        players: roomClients[room],
      });
      socket.emit("room-full", room);
    } else {
      socket.join(room);
      if (!roomClients[room]) {
        roomClients[room] = [];
      }
      if (!roomClients[room].includes(nim)) {
        roomClients[room].push(nim);
      }
    }
    if (!playerReady[room]) {
      playerReady[room] = [];
    }
    playerReady[room].push(nim);
    if (playerReady[room] && playerReady[room].length === 2) {
      const user1 = await User.findOne({
        where: {
          nim: playerReady[room][0],
        },
        attributes: ["id"],
      });
      const user2 = await User.findOne({
        where: {
          nim: playerReady[room][1],
        },
        attributes: ["id"],
      });
    
      // Find all rooms that user1 has been in
      const roomsUser1 = await Game.findAll({
        where: {
          UserId: user1.id,
        },
        attributes: ["RoomId"],
        raw: true,
      });
      const roomsUser1Ids = roomsUser1.map((room) => room.RoomId);
    
      // Find all rooms that user2 has been in
      const roomsUser2 = await Game.findAll({
        where: {
          UserId: user2.id,
        },
        attributes: ["RoomId"],
        raw: true,
      });
      const roomsUser2Ids = roomsUser2.map((room) => room.RoomId);
    
      // Check if there is any common room between the two users
      const commonRooms = roomsUser1Ids.filter((roomId) =>
        roomsUser2Ids.includes(roomId)
      );
    
      if (commonRooms.length > 0) {
        io.to(room).emit("player-ready", { ready: false });
        roomClients[room] = [];
      }else{
        io.to(room).emit("player-ready", { ready: true });
      }
      io.to(room).emit("room-info", {
        success: true,
        players: playerReady[room] || [],
      });
      setInterval(() => {
        playerReady[room] = [];
      }, 3000);
    }
  });

  socket.on("send-answer", (data) => {
    const { answer, room, nim } = data;
    if (!answers[room]) {
      answers[room] = [];
    }
    answers[room].push([nim, answer]);
    if (answers[room].length % 2 === 0) {
      io.to(room).emit("match-results", { answers: answers[room] });
      console.log("Results send");
    }
    if (answers[room].length >= 20) {
      io.to(room).emit("match-end", { end: true });
    }
  });

  socket.once("final-score", async (data) => {
    const { userId, finalScore, room, cls } = data;
    await Game.create({
      UserId: userId,
      RoomId: room,
      score: finalScore,
    }).then(async () => {
      await Score.findOrCreate({
        where: { userId: userId },
        defaults: {
          userId: userId,
          score: finalScore,
          class: cls,
        },
      }).then(([userScore, created]) => {
        const addScore = userScore.score + finalScore;
        if (!created) {
          Score.update({ score: addScore }, { where: { userId: userId } });
        }
      });
    });
    const getScore = await Score.findAll({
      order: [["score", "DESC"]],
      include: User,
    });
    io.emit("get-score", { score: getScore });
  });

  socket.on("leave-room", (data) => {
    const { room, nim } = data;
    socket.leave(room);
    roomClients[room] = [];
    answers[room] = [];
    playerReady[room] = [];
  });

  socket.on("disconnect", () => {
    connectedClients--;
    console.log(
      `User disconnected. Total connected clients: ${connectedClients}`
    );
  });
});

try {
  await dbConnect.authenticate();
  console.log("Connection has been established successfully.");
  dbConnect.sync({ alter: false, force: false });
  server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server listening on port ${process.env.SOCKET_PORT}`);
  });
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Http Req listening on port ${process.env.SERVER_PORT}`);
  });
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports.handler = serverless(app);