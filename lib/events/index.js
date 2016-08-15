'use strict';

const GroupCommands = require('require-dir')('group');
const Group = require('../group');

module.exports = function parse (group, line) {
  const args = line.split(':');
  const cmd = args[0];

  group.processingCommand = line;

  if (group instanceof Group) {
    let fn = GroupCommands[cmd];
    try {
      if (fn)
        fn(this, group, args);
    } catch (err) {
      console.error(err.stack);
    }
  }
};