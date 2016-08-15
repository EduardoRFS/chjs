'use strict';

module.exports = function onFloodWarning (bot, group, args) {
  // TODO: make better
  bot.emit('flood_warning', group);
  group.emit('flood_warning');
};