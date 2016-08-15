'use strict';

const User = require('../../user');
const push = Array.prototype.push;

module.exports = function (bot, group, args) {
  group.users.splice(0, group.users.length);

  let users = args
    .slice(1)
    .join(':')
    .split(';')
    .map(data => data.split(':'))
    .map(User.fromGParticipant);

  push.apply(group.users, users);

  group.users.emit('reset');
  bot.users.emit('reset', group);
};

