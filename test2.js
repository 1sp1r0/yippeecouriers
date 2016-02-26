var events = require('events');
var eventEmitter = new events.EventEmitter();

var listener1 = function listener1() {
	console.log('listener1 executed');
}

var listener2 = function listener2() {
	console.log('listeners executed');
}

eventEmitter.addListener('connection', listener1);

eventEmitter.on('connection', listener2);

var eventListeners = require('events').EventEmitter.listenerCount(eventEmitter, 'connection');
console.log(eventListeners + "Listeners listening to connection event");

eventEmitter.emit('connection');

eventEmitter.removeListener('connection', listener1);
console.log("Listener1 will not listen now");

eventEmitter.emit('connection');

eventListeners = require('events').EventEmitter.listenerCount(eventEmitter, 'connection');
console.log(eventListeners + 'Listeners listening to connection event');

console.log("Program Ended");