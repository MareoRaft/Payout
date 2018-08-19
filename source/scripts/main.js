//This is a TEMPLATE (notice the "{{privacy}}" variable drop-in).
// once we finish writing in python, we will then translate that to JS, so that a new request to the server won't need to be made every time the user wants to view more info on the calendar.
// Define websocket to be used for server interaction
const exec = require('child_process').exec

const $ = require('./lib/jquery.js')
const is = require('./lib/check-types.js')
require('./lib/date.js')

require('./date_extend.js')
// const Socket = require('./socket.js')


//////////////////// GLOBALS ////////////////////
// let socket = undefined


///////////////// HELPERS /////////////////


/////////////////// MAIN ///////////////////
function sendTokens() {
	let gwei = $('.gwei').val()
	let to_address = $('.to-address').val()
	let amount_string = $('.amount').val()
	let command = 'send-tokens -k' + ' ' + private_key + ' ' + to_address + ' ' + amount_string + ' ' + '-G' + ' ' + gwei
	exec(command, function (err, stdout, stderr) {
		console.log(stdout)
		console.log(stderr)
		// cb(err)
	})
}


function initTriggers() {
	$('.submit').click(sendTokens)
}

function initGlobals() {
	// socket = new Socket(onmessage)
}

$(document).ready(function(){
	initGlobals()
	initTriggers()
})
