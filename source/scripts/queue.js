/* A flexible Queue object, in the sense that you can inject actions into it to take every time is enqueues or dequeues */

////////////////// IMPORTS //////////////////
const _ = require('lodash')
const is = require('check-types')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
class Queue extends Array {
	constructor(onchange=_.noop) {
		// or maybe it should be this = super(), but it doesn't matter for our particular situation, since we always initialize our queue's as blank arrays
		super()
		this.onchange = onchange
	}

	enqueue(item) {
		this.push(item)
		this.onchange(item)
	}

	enqueueAll(iterable) {
		for (let item of iterable) {
			this.enqueue(item)
		}
	}

	dequeue() {
		let item = this.shift()
		this.onchange(item)
		return item
	}

	dequeueAll() {
		// make a COPY of the array
		let items = this.slice()
		// delete everything
		// could be faster with this.length = 0, but simplicity is more valuable than speed here
		is.assert.array(this)
		while (is.nonEmptyArray(this)) {
			this.dequeue()
		}
		// return the list
		return items
	}
}
////////////////// EXPORTS //////////////////
module.exports = Queue
