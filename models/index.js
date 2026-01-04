const { sequelize } = require('../db/postgress');

const User = require('./User.model')(sequelize);
const Course = require('./Course.model')(sequelize);

module.exports = {
    sequelize,
    User,
    Course,
};
