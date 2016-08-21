'use strict';

const debug = require('debug')('chjs:events:participant');
const User = require('../../user');

module.exports = function onParticipant (bot, group, args) {
  let event = parseInt(args[1]);
  let data = args.slice(2);
  const user = User.fromParticipant(data);

  // TODO: optimize
  if (event === 0 || event === 2) {
    let userIndex = getUserIndex(group.users, user);
    let userRemoved = group.users.splice(userIndex, 1)[0];

    if (event === 0 && !compareUsers(userRemoved, user)) {
      debug(`WEIRD,
        old user ${JSON.stringify(userRemoved)}
        new user ${JSON.stringify(user)} in ${group.handler}`);
    }

    bot.users.emit('exit', group, userRemoved);
    group.users.emit('exit', userRemoved);

    if (event === 2) {
      bot.users.emit('change', group, user, userRemoved);
      group.users.emit('change', user, userRemoved);
    }
  }

  if (event === 1 || event === 2) {
    group.users.push(user);
    bot.users.emit('enter', group, user);
    group.users.emit('enter', user);
  }
};

function compareUsers (userA, userB) {
  return JSON.stringify(userA) === JSON.stringify(userB);
}
/* TODO: V8 optimization needed */
function getUserIndex (arr, user) {
  for (let i = 0; i < arr.length; i++) {
    if (user.sessionId == arr[i].sessionId)
      return i;
  }
  return -1;
}