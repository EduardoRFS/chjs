'use strict';

const Promise = require('bluebird');
const Connection = require('./connection');
const EventEmitter = require('events');
let parse;

class Group extends EventEmitter {
  constructor (opts = {}, user, password) {
    super();
    if (typeof user === 'string')
      user = { name: user, password: password };
    if (typeof opts === 'string')
      opts = { handler: opts };

    let connection = opts.connection || {};
    connection.groupHandler = connection.groupHandler || opts.handler;

    this.handler = opts.handler;
    this.user = opts.user || user || {};
    this.password = this.user.password;
    this.sid = opts.sid;
    this.connection = new Connection(connection);

    bindEvent('receive_command', this, this.connection);
    bindEvent('send_command', this, this.connection);
    this.commands = new EventEmitter();

    this.users = [];
    // fake extends EventEmitter
    EventEmitter.call(this.users);
    Object.assign(this.users, EventEmitter.prototype);

    this.owner = '';
    this.loginType = '';
    this.connectedAs = '';
    this.connectedAt = new Date(0);
    this.ip = '';
    this.mods = [];
    this.flags = -1;

    this.then = this.start;
  }

  auth () {
    let conn = this.connection;
    if (this.password)
      conn.send('bauth', this.handler, this.sid, this.user.name, this.password, '\x00');
    else
      conn.send('bauth', this.handler, this.sid, '\x00');
    return conn
      .onceAsync('cmd_ok')
      .then(args => {
        if (args[2] === 'N' && this.user.name)
          conn.send('blogin', this.user.name);
          return Promise.race([
            conn.onceAsync('badalias'),
            conn.onceAsync('aliasok')
          ]);
      })
      .then(_ => conn.ping());
  }

  start (resolve, reject) {
    this.then = undefined;
    return this.connection
      .then(_ => this.auth())
      .then(_ => this)
      .then(resolve, reject);
  }

  send () {
    let conn = this.connection;
    return conn.send.apply(conn, arguments)
  }

  message (msg, channel = 2304) {
    return this.send('bm', 'tere', channel, msg);
  }
}

function bindEvent(event, target, source) {
  source.on(event, function (...args) {
    args = [event].concat(args);
    target.emit.apply(target, args);
  })
}

module.exports = Group;

parse = require('../events');