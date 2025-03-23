import sequelize from "../utils/database.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SALT = 10;
const SECRET_KEY = process.env.SECRET_KEY;
const User = sequelize.models.user;

const signUpValidator = (body) => {
  return body &&
    validator.isEmail(body.email) &&
    body.name &&
    body.password &&
    body.phone;
};

const loginValidator = (body) => {
  return body && validator.isEmail(body.email) && body.password;
};

export const signup = async (req, res, next) => {
  const body = req.body;
  if (!signUpValidator(body)) {
    return res.status(400).json({ status: "error", message: "Invalid input" });
  }
  try {
    const existingUser = await User.findOne({ where: { email: body.email } });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email is already registered. Please use a different email.",
      });
    }
    const hashedPassword = await bcrypt.hash(body.password, SALT);
    const newUser = await User.create({ ...body, password: hashedPassword });
    res.status(201).json({
      status: "success",
      user: { id: newUser.id, name: newUser.name },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const login = async (req, res, next) => {
  const body = req.body;
  if (!loginValidator(body)) {
    return res.status(400).json({ status: "error", message: "Invalid input" });
  }
  try {
    const user = await User.findOne({ where: { email: body.email } });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: "error", message: "Password is incorrect" });
    }
    const token = jwt.sign(
      { userId: user.id, name: user.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.set({ "Access-Control-Expose-Headers": "token" });
    res.set("token", token);
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      self: user.id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};
