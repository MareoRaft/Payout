/* A flexible Queue object, in the sense that you can inject actions into it to take every time is enqueues or dequeues */

////////////////// IMPORTS //////////////////
const _ = require('lodash')
const is = require('check-types')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
class Queue extends Array {
	constructor(enqueue_action=_.noop) {
		// or maybe it should be this = super(), but it doesn't matter for our particular situation, since we always initialize our queue's as blank arrays
		super()
		this.enqueue_action = enqueue_action
	}

	enqueue(item) {
		this.push(item)
		this.enqueue_action(item)
	}

	enqueueAll(iterable) {
		for (let item of iterable) {
			this.enqueue(item)
		}
	}

	dequeue() {
		return this.shift()
	}

	dequeueAll() {
		// make a COPY of the array
		let items = this.slice()
		// delete everything
		this.length = 0
		// return the list
		return items
	}
}
////////////////// EXPORTS //////////////////
module.exports = Queue
