import sequelize from "../utils/database.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const User = sequelize.models.user;
const Message = sequelize.models.message;
const Friends = sequelize.models.friendsRelation;

export const allFriends = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ status: "error", message: "Token is missing" });
  }

  jwt.verify(token, SECRET_KEY, async function (err, decryptToken) {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ status: "error", message: "Invalid or expired token" });
    }

    try {
      const friends = await User.findAll({
        where: {
          id: {
            [Op.ne]: decryptToken.userId, 
          },
        },
        attributes: ["id", "name"], 
      });

      res.status(200).json({
        status: "success",
        data: { user: decryptToken.name, friends },
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ status: "error", message: "Server Error" });
    }
  });
};
