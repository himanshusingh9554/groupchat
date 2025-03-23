
import { Sequelize } from "sequelize";


const DB_NAME = "chat_app";
const DB_UN = "root";
const DB_P = "rootnode";
const DB_H = "localhost";

const sequelize = new Sequelize(DB_NAME, DB_UN, DB_P, {
  dialect: "mysql",
  host: DB_H,
});


import defineUser from "../models/user.js";
import defineMessage from "../models/message.js";
import defineGroup from "../models/group.js";
import defineGroupMessage from "../models/groupMessage.js";
import defineGroupUser from "../models/groupUser.js";
import defineFriend from "../models/friends.js";

const User = defineUser(sequelize);
const Message = defineMessage(sequelize);
const Group = defineGroup(sequelize);
const GroupMessage = defineGroupMessage(sequelize);
const GroupUser = defineGroupUser(sequelize);
const Friend = defineFriend(sequelize);

User.hasMany(Message, { foreignKey: "userId", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(GroupUser, { foreignKey: "groupId", onDelete: "CASCADE" });
GroupUser.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(GroupUser, { foreignKey: "userId", onDelete: "CASCADE" });
GroupUser.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(GroupMessage, { foreignKey: "groupId", onDelete: "CASCADE" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(GroupMessage, { foreignKey: "userId", onDelete: "CASCADE" });
GroupMessage.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Friend, { foreignKey: "userId", onDelete: "CASCADE" });
Friend.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

Friend.belongsTo(User, { foreignKey: "toUser", onDelete: "CASCADE" });

sequelize.models.user = User;
sequelize.models.message = Message;
sequelize.models.group = Group;
sequelize.models.groupMessage = GroupMessage;
sequelize.models.groupUser = GroupUser;
sequelize.models.friend = Friend;

export default sequelize;
