'use strict';

const Group = require('../group');
const EventEmitter = require('events');
const commandParser = require('../events');

class Bot extends EventEmitter {
  constructor (user, password, parser) {
    super();

    this.user = {
      name: user,
      password: password
    };

    this.users = new EventEmitter();
    this.commands = new EventEmitter();
    this.commands.prefix = '/';
    this.separator = ' ';

    this.on('receive_command', commandParser);
    this.groups = [];
  }

  joinGroup (group) {
    if (!(group instanceof Group))
      group = new Group(group, this.user);
    bindEvent('receive_command', this, group);
    bindEvent('send_command', this, group);
    this.groups.push(group);
    return group.start();
  }
}

function bindEvent(event, target, source) {
  source.on(event, function (...args) {
    args = [event, source].concat(args);
    target.emit.apply(target, args);
  })
}

module.exports = Bot;
