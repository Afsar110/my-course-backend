const { Model, DataTypes } = require('sequelize');
const { userTypeEnum } = require('../utils/constant');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generate a UUIDV4
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(userTypeEnum.ADMIN, userTypeEnum.USER, userTypeEnum.SUPER_ADMIN),
        defaultValue: userTypeEnum.USER,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      modelName: 'User',
    }
  );

  return User;
};
