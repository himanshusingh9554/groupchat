import { DataTypes } from "sequelize";

const GroupUser = (sequelize) => {
  return sequelize.define(
    "groupUser",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", 
          key: "id",
        },
        onDelete: "CASCADE",
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "groups", 
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    { timestamps: true }
  );
};

export default GroupUser;
