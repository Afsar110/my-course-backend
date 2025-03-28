const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}

  Course.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generates a UUIDv4
        primaryKey: true,
      },
      courseTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseOverview: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      courseStructure: {
        type: DataTypes.JSONB, // Stores the nested course structure as JSON
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'courses',
      timestamps: true, // Adds createdAt and updatedAt fields
      paranoid: true,   // Enables soft deletes with a deletedAt field
      modelName: 'Course',
    }
  );

  return Course;
};
