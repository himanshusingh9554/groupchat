import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import dotenv from "dotenv";


dotenv.config();

import sequelize from "./utils/database.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("Message Received:", data);

    socket.broadcast.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


import userRouter from "./routers/userRouter.js";
import messageRouter from "./routers/messageRouter.js";
import friendsRouter from "./routers/friendsRouter.js";
import groupRouter from "./routers/groupRouter.js";

app.use(userRouter);
app.use(messageRouter);
app.use(friendsRouter);
app.use(groupRouter);

sequelize
  .sync({force: false})
  .then(() => {
    server.listen(3000, () => {
      console.log("Listening on 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

export default app;
