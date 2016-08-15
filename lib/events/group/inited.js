'use strict';

module.exports = function onConnect (bot, group) {
  bot.emit('connect', group);
  group.emit('connect');
};