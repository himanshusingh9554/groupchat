import { DataTypes } from "sequelize";

const Group = (sequelize) => {
  return sequelize.define("group", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    creator: {
      type: DataTypes.INTEGER,
    },
  });
};

export default Group;
