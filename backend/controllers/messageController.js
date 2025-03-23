// controllers/messageController.js
import sequelize from "../utils/database.js";
import { Op } from "sequelize";

const Message = sequelize.models.message;
const User = sequelize.models.user; 

export const storeMessage = async (req, res) => {
  try {
 
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { message, to } = req.body;
    if (!message || !to) {
      return res
        .status(400)
        .json({ status: "error", message: "Message and recipient are required" });
    }

    const newMessage = await Message.create({
      userId: req.user.userId,
      message,
      toUser: to,
    });

    res.status(201).json({ status: "success", data: { id: newMessage.id } });
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};


export const getAllMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { to, skip = 0 } = req.body;
    const userId = req.user.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { userId, toUser: to },
          { userId: to, toUser: userId },
        ],
        id: { [Op.gt]: skip },
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      data: {
        user: userId,
        messages,
      },
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};
