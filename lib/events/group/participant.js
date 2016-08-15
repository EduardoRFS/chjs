'use strict';

/*
 g_participants:30687456:1471236105.92:68481286:Rafa:None:;91323280:1471236203.38:44517694:RufflesE:None:
 participant:1:57873256:51737573:None:None::1471236213.16
 n:3
 participant:1:98866456:77943761:None:None::1471236214.06
 n:4
 participant:2:57873256:51737573:None:Teest::1471236213.16
 participant:2:57873256:51737573:Rafa:None::1471236213.16
 participant:0:57873256:51737573:Rafa:None::1471236213.16
 n:3
 participant:0:98866456:77943761:None:None::1471236214.06

 */
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
        new user ${JSON.stringify(user)}`);
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