module.exports = function (sequelize, DataTypes) {
  const users = sequelize.define("users", {
    user_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    profileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  });
  return users;
};
