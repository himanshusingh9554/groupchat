import sequelize from "../utils/database.js";
import { Op } from "sequelize";

const Group = sequelize.models.group;
const GroupUser = sequelize.models.groupUser;
const User = sequelize.models.user;
const GroupMessage = sequelize.models.groupMessage;


export const addGroup = async (req, res) => {
  try {
    const { users = [], name: groupName } = req.body;
    if (!groupName) {
      return res
        .status(400)
        .json({ status: "error", message: "Group name is required" });
    }

    const creator = req.user.userId;
  
    const group = await Group.create({ name: groupName, creator });
    console.log("Created group:", group.toJSON()); 

    const allUsers = [...new Set([...users, creator])];

    const groupUsersData = allUsers.map((u) => ({
      groupId: group.id,
      userId: u,
      admin: u === creator,
    }));
    await GroupUser.bulkCreate(groupUsersData);
    console.log("Created group users:", groupUsersData); 

    return res
      .status(201)
      .json({ status: "success", message: "Group created successfully" });
  } catch (err) {
    console.error("Error creating group:", err);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const getUserGroupInformation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupUsers = await GroupUser.findAll({
      where: { userId },
      include: [{ model: Group }],
    });
    console.log("Fetched group users for user", userId, ":", groupUsers); 

    const responseGroups = groupUsers
      .filter((gu) => gu.group)
      .map((gu) => ({
        group: {
          id: gu.group.id,
          name: gu.group.name,
        },
        isAdmin: gu.admin,
      }));
      
      console.log("Final responseGroups:", responseGroups);
      return res.status(200).json(responseGroups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const getSingleGroupInformation = async (req, res) => {
  try {
    const groupId = req.params.id;
    if (!groupId) {
      return res
        .status(400)
        .json({ status: "error", message: "Group ID is required" });
    }

    const groupUsers = await GroupUser.findAll({ where: { groupId } });
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res
        .status(404)
        .json({ status: "error", message: "Group not found" });
    }

    return res
      .status(200)
      .json({ status: "success", data: { group, users: groupUsers } });
  } catch (err) {
    console.error("Error fetching group information:", err);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};


export const storeMessage = async (req, res) => {
  try {
    const { groupId, message } = req.body;
    if (!groupId || !message) {
      return res.status(400).json({
        status: "error",
        message: "Group ID and message are required",
      });
    }

    const userId = req.user.userId;
    const messageObj = await GroupMessage.create({
      groupId,
      message,
      userId,
    });

    return res
      .status(201)
      .json({ status: "success", data: { id: messageObj.id } });
  } catch (err) {
    console.error("Error storing group message:", err);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};


export const getAllMessages = async (req, res) => {
  try {
    const groupId = req.query.id;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    if (!groupId) {
      return res
        .status(400)
        .json({ status: "error", message: "Group ID is required" });
    }

    const messages = await GroupMessage.findAll({
      where: { groupId, id: { [Op.gt]: skip } },
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    return res.status(200).json({
      status: "success",
      data: { messages, self: req.user.userId },
    });
  } catch (err) {
    console.error("Error fetching group messages:", err);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const groupFriends = async (req, res) => {
  try {
    const groupId = req.query.id;
    if (!groupId) {
      return res
        .status(400)
        .json({ status: "error", message: "Group ID is required" });
    }

    const userId = req.user.userId;
    const group = await GroupUser.findAll({
      where: { groupId },
      include: [{ model: Group }],
    });

    const friends = [];
    const friendsId = [];
    for (const dt of group) {
      if (Number(dt.userId) !== Number(userId)) {
        const user = await User.findOne({
          where: { id: dt.userId },
          attributes: ["id", "name"],
        });
        if (user) {
          friends.push({ user, isAdmin: dt.admin });
          friendsId.push(user.id);
        }
      }
    }

    const nonFriends = await User.findAll({
      where: {
        id: {
          [Op.and]: {
            [Op.notIn]: friendsId,
            [Op.not]: userId,
          },
        },
      },
      attributes: ["id", "name"],
    });

    return res
      .status(200)
      .json({ status: "success", data: { friends, notFriends: nonFriends } });
  } catch (err) {
    console.error("Error fetching group friends:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

export const removeGroupUser = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Group ID and user ID are required",
      });
    }

    await GroupUser.destroy({ where: { groupId, userId } });
    return res
      .status(200)
      .json({ status: "success", message: "User removed from group" });
  } catch (err) {
    console.error("Error removing user from group:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

export const addGroupUser = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Group ID and user ID are required",
      });
    }

    await GroupUser.create({ groupId, userId, admin: false });
    return res
      .status(201)
      .json({ status: "success", message: "User added to group" });
  } catch (err) {
    console.error("Error adding user to group:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

export const adminModify = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Group ID and user ID are required",
      });
    }

    const groupUser = await GroupUser.findOne({ where: { groupId, userId } });
    if (!groupUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found in group" });
    }

    groupUser.admin = !groupUser.admin;
    await groupUser.save();
    return res
      .status(200)
      .json({ status: "success", message: "User admin status updated" });
  } catch (err) {
    console.error("Error modifying admin status:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    if (!groupId) {
      return res
        .status(400)
        .json({ status: "error", message: "Group ID is required" });
    }

    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res
        .status(404)
        .json({ status: "error", message: "Group not found" });
    }

    if (group.creator !== req.user.userId) {
      return res
        .status(403)
        .json({ status: "error", message: "Not authorized to delete this group" });
    }

    await Group.destroy({ where: { id: groupId } });
    return res
      .status(200)
      .json({ status: "success", message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
