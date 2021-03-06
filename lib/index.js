'use strict';
const Bot = require('./bot');

/**
 * Create a Bot instance with groups
 * @param {String[]} groups
 * @param {String} user
 * @param {String} password
 * @returns {Bot}
 */
module.exports = function start (groups, user, password) {
  if (!Array.isArray(groups))
    groups = [groups];
  let bot = new Bot(user, password);
  groups.forEach(group => bot.joinGroup(group));

  return bot;
};
