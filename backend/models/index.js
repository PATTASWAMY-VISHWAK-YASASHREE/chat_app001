const User = require('./User');
const Channel = require('./Channel');
const Message = require('./Message');

// Define associations
User.hasMany(Channel, {
  foreignKey: 'creatorId',
  as: 'createdChannels'
});

Channel.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator'
});

User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages'
});

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Channel.hasMany(Message, {
  foreignKey: 'channelId',
  as: 'messages'
});

Message.belongsTo(Channel, {
  foreignKey: 'channelId',
  as: 'channel'
});

module.exports = {
  User,
  Channel,
  Message
};