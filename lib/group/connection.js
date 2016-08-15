'use strict';

const PING_DELAY = 15;
const Promise = require('bluebird');
const EventEmitter = require('events');
const net = require('net');
const getServer = require('./tagserver')('chatango.com');

Promise.promisifyAll(net.Socket.prototype);

class GroupConnection extends EventEmitter {
	constructor (opts) {
    super();
    if (typeof opts === 'string')
      opts = { group: opts };

    this.on('ping', onPing.bind(this));
    this.latency = -1;
    this.server = opts.server || getServer(opts.groupHandler);
    this.port = opts.port || 443;

    this.fail = 0;
    this.then = this.start;

    // TODO: use module 'buffer'
		this.buffer = '';
	}

	send (...args) {
    let offset = args.length;
    let last = args[args.length-1] || '';

    let endsWith = last.toString().endsWith('\x00');

    if (endsWith)
      offset--;
		let msg = args.slice(0, offset).join(':');

    this.emit('send_command', msg);

    if (endsWith)
      msg += '\x00';

    if (!endsWith) msg += '\r\n\x00';

		return this.socket.writeAsync(msg);
	}

  start (resolve, reject) {
    this.then = undefined;

    // TODO: promise running
    return Promise
      .race([
        this.createSocket(),
        this.onceError()
      ])
      .then(_ => this.fail = 0)
      .then(_ => this)
      .then(resolve, reject);
  }
  ping () {
    clearTimeout(this.pingTimer);
    let date = Date.now();
    this.send();
    return this
      .onceAsync('ping')
      .then(_ => this.latency = Date.now() - date);
  }

  createSocket () {
    return new Promise(resolve => {
      let sock = this.socket = net.createConnection(this.port, this.server, resolve);
      sock.on('data', onData.bind(this));
      sock.on('error', onError.bind(this));
    });
  }

  onceError () {
    return Promise.fromNode(this.socket.once.bind(this, 'error'));
  }
  onceAsync (event) {
    return new Promise(resolve => this.once(event, resolve));
  }
}

module.exports = GroupConnection;

function onPing () {
  this.pingTimer = setTimeout(_ => this.ping(), PING_DELAY * 1000);
}
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
        this.emit('receive_command', line);
        let [cmd, ...args] = line.split(':');
        this.emit('cmd_' + cmd, args);
      }
    } catch (err) {
      console.error(err.stack)
    }

    this.buffer = this.buffer.slice(position+1);
  }
}
function onError (err) {
  console.error(err);
  if (this.fail < 5)
    setTimeout(_ => this.start(), 3000);
  this.fail++;
  this.error = err;
}