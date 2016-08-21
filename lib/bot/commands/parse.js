'use strict';

const emit = require('events').prototype.emit;
module.exports = function parseCommand (group, message, sumUser) {
  const {user, body} = message;

  let prefix = this.commands.prefix;
  const allowedUsers = this.commands.allowedUsers;
  const bannedUsers = this.commands.bannedUsers;
  const allowedAnon = this.commands.allowedAnon;

  if (!prefix) return;

  if (!allowedAnon && user.type !== 'S') return;
  if (allowedUsers && allowedUsers.indexOf(sumUser.toLowerCase()) === -1) return;
  if (bannedUsers && bannedUsers.indexOf(sumUser.toLowerCase()) !== -1) return;

  if (!Array.isArray(prefix))
    prefix = [prefix];

  prefix.forEach(prefix => {
    if (!body.startsWith(prefix)) return;

    let [cmd, ...args] = body.slice(prefix.length).split(this.separator);
    cmd = cmd.toLowerCase();

    emit.apply(this.commands, ['command', group, message].concat(args));

    const botArgs = [cmd, group, message].concat(args);
    const groupArgs = [cmd, message].concat(args);

    emit.apply(this, ['command'].concat(botArgs));

    emit.apply(this.commands, botArgs);
  });
  prefix.map(prefix => body.startsWith(prefix));
};