module.exports = function parseCommand (group, message) {
  let prefix = group.commands.prefix || bot.commands.prefix;
  const allowedUsers = group.commands.allowedUsers || bot.commands.allowedUsers;
  const bannedUsers = group.commands.bannedUsers || bot.commands.bannedUsers;
  const allowedAnon = group.commands.allowedAnon || bot.commands.allowedAnon;

  if (!prefix) return;

  if (!allowedAnon && user.type !== 'S') return;
  if (allowedUsers && allowedUsers.indexOf(sumUser.toLowerCase()) === -1) return;
  if (bannedUsers && bannedUsers.indexOf(sumUser.toLowerCase()) !== -1) return;

  if (!Array.isArray(prefix))
    prefix = [prefix];

  prefix.forEach(prefix => {
    if (!body.startsWith(prefix)) return;

    let [cmd, ...args] = body.slice(prefix.length).split(bot.separator);
    cmd = cmd.toLowerCase();

    emit.apply(bot.commands, ['command', group, message].concat(args));
    emit.apply(group.commands, ['command', message].concat(args));

    const botArgs = [cmd, group, message].concat(args);
    const groupArgs = [cmd, message].concat(args);

    emit.apply(bot, ['command'].concat(botArgs));
    emit.apply(group, ['command'].concat(groupArgs));

    emit.apply(bot.commands, botArgs);
    emit.apply(group.commands, groupArgs)
  });
  prefix.map(prefix => body.startsWith(prefix));
};