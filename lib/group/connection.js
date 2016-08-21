'use strict';

const PING_DELAY = 15000;
const Promise = require('bluebird');
const GroupSocket = require('./socket');
const EventEmitter = require('events');

const getServer = require('./tagserver')('chatango.com');

module.exports = exports = GroupConnection;

function GroupConnection (groupHandler, server, port) {
  if (!(this instanceof GroupConnection)) {
    return new GroupConnection(groupHandler, server, port);
  }

  this.groupHandler = groupHandler;
  this.port = port || 443;
  this.server  = server || getServer(this.groupHandler);

  this.socket = new GroupSocket(this.server, this.port);
  this.socket.on('data', onData.bind(this));

  this.pingTimer = 0;
  this.buffer = '';
  this.ping = this.ping.bind(this);
}
const proto = GroupConnection.prototype = {
  send (...args) {
    let msg = args.join(':');
    msg += '\n\x00';
    return this.socket.write(msg);
  },

  ping () {
    if (this.pingTimer)
      clearInterval(this.pingTimer);
    let date = Date.now();
    this.send();
    setTimeout(this.ping, PING_DELAY);
    return this
      .onceAsync('ping')
      .then(_ => this.latency = Date.now() - date);
  },

  onceAsync (event) {
    return new Promise(resolve => this.once(event, resolve));
  },

  then (resolve) {
    // TODO: rejectable
    if (this.socket.connected)
      return Promise.resolve().then(resolve);
    return new Promise(resolve => this.socket.once('connect', resolve));
  }
};
Object.assign(proto, EventEmitter.prototype, proto);

function onData (chunk) {
  chunk = chunk.toString();
  this.buffer += chunk;

  let position;
  while ((position = this.buffer.indexOf('\x00')) != -1) {
    let line = this.buffer.slice(0, position);

    try {
      if (line.length === 0)
        this.emit('ping');
      else {
        this.emit('receive-command', line);
        let [cmd, ...args] = line.split(':');
        this.emit('cmd-' + cmd, args);
      }
    } catch (err) {
      console.error(err.stack)
    }

    this.buffer = this.buffer.slice(position+1);
  }
}