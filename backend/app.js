import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import your Sequelize instance
import sequelize from "./utils/database.js";

// 1) Create Express app
const app = express();

// 2) Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 3) Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 4) Serve static files from the current directory
app.use(express.static(__dirname));

// (Optional) If you have a single-page app, you can fallback to index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// 5) Socket.IO events
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

// 6) Import your routes
import userRouter from "./routers/userRouter.js";
import messageRouter from "./routers/messageRouter.js";
import friendsRouter from "./routers/friendsRouter.js";
import groupRouter from "./routers/groupRouter.js";

// 7) Use the routes
app.use(userRouter);
app.use(messageRouter);
app.use(friendsRouter);
app.use(groupRouter);

// 8) Sync DB and start server
sequelize
  .sync({ force: false })
  .then(() => {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log("Listening on port " + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// 9) Export app (if needed elsewhere)
export default app;
