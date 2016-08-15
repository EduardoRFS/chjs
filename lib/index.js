'use strict';
const Bot = require('./bot');

module.exports = function start (groups, user, password) {
  if (!Array.isArray(groups))
    groups = [groups];
  let bot = new Bot(user, password);
  groups.forEach(group => bot.joinGroup(group));

  return bot;
};
