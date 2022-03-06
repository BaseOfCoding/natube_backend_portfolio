module.exports = function (sequelize, DataTypes) {
  const users = sequelize.define("users", {
    user_id: {
      type: DataTypes.STRING(2040),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(2040),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(2040),
      allowNull: false,
    },
    profileUrl: {
      type: DataTypes.STRING(2040),
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING(2040),
      allowNull: true,
    },
  });

  return users;
};
