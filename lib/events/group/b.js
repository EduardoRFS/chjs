'use strict';

const MAX_FIELDS = 11;
const TXT_FIELD = 10;
const CHANNEL_FLAGS = [0, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
const he = require('he');
const emit = require('events').prototype.emit;

const regex = /<\/?[^>]+(>|$)/g;

module.exports = function onMessage (bot, group, args) {
  args[TXT_FIELD] = args.splice(TXT_FIELD).join(':');
  let message = {};

  message.date = new Date(parseInt(args[1]) * 1e3);
  message.shortSid = parseInt(args[4]);
  message.id = args[6];
  message.ip = args[7];
  message.flags = args[8];
  message.rawBody = args[TXT_FIELD];
  const user = message.user = getUser(args);
  const body = message.body = stripesTags(message.rawBody);
  const sumUser = message.userName = sumNameType(user.name, user.type);

  bot.emit('message', group, message, sumUser);
  group.emit('message', message, sumUser);

  let prefix = group.commands.prefix || bot.commands.prefix;
  const usersAllowed = group.commands.usersAllowed || bot.commands.usersAllowed;
  const usersBanned = group.commands.usersBanned || bot.commands.usersBanned;

  if (!prefix) return;

  if (usersAllowed && usersAllowed.indexOf(sumUser.toLowerCase()) === -1) return;
  if (usersBanned && usersBanned.indexOf(sumUser.toLowerCase()) !== -1) return;

  if (!Array.isArray(prefix))
    prefix = [prefix];

  prefix.forEach(prefix => {
    if (!body.startsWith(prefix)) return;

    let [cmd, ...args] = body.slice(prefix.length).split(bot.separator);
    cmd = cmd.toLowerCase();

    emit.apply(bot.commands, [cmd, group, message].concat(args));
    emit.apply(group.commands, [cmd, message].concat(args))
  });
  prefix.map(prefix => body.startsWith(prefix));
};

function sumNameType (name, type) {
  switch (type) {
    case 'S': return name;
    case 'T': return '#'+name;
    case 'A': return '!'+name;
  }
}
function stripesTags (body) {
  body = body.replace(regex, '');
  body = he.decode(body);
  return body;
}
function getUser (args) {
  let user = {
    name: args[2],
    type: 'S'
  };
  if (!user.name && args[3]) {
    user.name = args[3].toLowerCase();
    user.type = 'T';
  }
  if (!user.name) {
    user.name = getAnonNumber(args[TXT_FIELD]);
    user.type = 'A';
  }
  return user;
}
function getTsid (message) {
  let matches = message.match(/<n\d\d\d\d\/>/);
  if (matches) return matches.substring(2, 6);
  return 3452;
}

/* extracted from chattanga source code */
function getAnonNumber (message) {
  let ts_id = getTsid(message.rawBody);
  let aid = message.shortSid;
  if (!aid || !ts_id) {
    return "";
  }
  var num = aid.substr(4, 4);
  var out = "";
  var n1;
  var n2;
  var sum;
  var i;
  for (i = 0;i < num.length;i++) {
    n1 = Number(num.substr(i, 1));
    n2 = Number(ts_id.substr(i, 1));
    sum = String(n1 + n2);
    out = out + sum.substr(sum.length - 1);
  }
  return out;
}
function getChannelIds (flags) {
  var result = [];
  for (var i = 1;i < CHANNEL_FLAGS.length;i++) {
    if (flags & CHANNEL_FLAGS[i]) {
      result.push(i);
    }
  }
  return result;
}