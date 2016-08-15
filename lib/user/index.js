'use strict';

class User {

  static fromParticipant (args) {
    args.splice(1, 0, args[5]);
    return this.fromGParticipant(args);
  }
  static fromGParticipant (args) {
    let user = {
      sessionId: args[0],
      date: new Date(parseInt(args[1]) * 1e3),
      shortSid: parseInt(args[2]),
      name: args[3],
      type: 'S',
      ip: args[5]
    };
    if (!user.name || user.name === 'None') {
      user.name = args[4];
      user.type = 'T';
    }
    if (!user.name || user.name === 'None') {
      user.name = 'anon';
      user.type = 'A';
    }
    return user;
  }
}
module.exports = User;