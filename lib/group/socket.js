'use strict';

const BINDED_EVENTS = ['drain', 'timeout', 'data', 'connect'];

const Duplex = require('stream').Duplex;
const Socket = require('net').Socket;

module.exports = class GroupSocket extends Duplex {
  constructor (server, port) {
    super();
    this.server = server;
    this.port = port;
    this.socket = null;
    this.running = true;

    this.closeHandler = this.start.bind(this);
    this.monitorSocket = this.monitorSocket.bind(this);
    this.start();
  }

  get connected () {
    const sock = this.socket;
    return sock && sock.writable && !sock.destroyed;
  }

  start (err) {
    if (err) console.error(err.stack);

    if (!this.running) return;
    if (this.socket && !this.socket.connecting) {
      this.socket.destroy();
      this.emit('reconnect');
    }

    const sock = this.socket = new Socket();

    bindFunction('_write', this, sock);
    bindFunction('_writev', this, sock);
    bindFunction('_read', this, sock);

    sock.on('error', this.closeHandler);
    sock.on('close', this.closeHandler);
    BINDED_EVENTS
      .map(event => bindEvents(event, this, sock));

    sock.connect(this.port, this.server);
  }

  close () {
    this.running = false;
    this.socket.destroy();
  }

  monitorSocket () {
    if (this.socket && !this.socket.connecting && !this.socket.writable) {
      this.start();
    }
    process.nextTick(this.monitorSocket);
  }
};

function bindFunction (name, target, source) {
  target[name] = source[name].bind(source);
}
function bindEvents (event, target, source) {
  source.on(event, listener);
  return { name: event, listener: listener };

  function listener () {
    const args = [event].concat(Array.from(arguments));
    target.emit.apply(target, args);
  }
}