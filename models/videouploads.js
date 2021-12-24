module.exports = function (sequelize, DataTypes) {
  const videoUploads = sequelize.define("videoUploads", {
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
  });
  return videoUploads;
};
