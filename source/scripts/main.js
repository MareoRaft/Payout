//This is a TEMPLATE (notice the "{{privacy}}" variable drop-in).
// once we finish writing in python, we will then translate that to JS, so that a new request to the server won't need to be made every time the user wants to view more info on the calendar.
// Define websocket to be used for server interaction
const exec = require('child_process').exec

const $ = require('./lib/jquery.js')
const is = require('./lib/check-types.js')
require('./lib/date.js')
// const sendTokensUserFacing = require('~send-tokens/src/send-tokens').run
const sendTokensUserFacing = require('send-tokens').run

require('./date_extend.js')
// const Socket = require('./socket.js')


//////////////////// GLOBALS ////////////////////
// let socket = undefined


///////////////// HELPERS /////////////////


/////////////////// MAIN ///////////////////
async function sendTokens() {
	// get user input
	let gwei = $('.gwei').val()
	let contract_address = $('.contract-address').val()
	let to_address = $('.to-address').val()
	let amount = $('.amount').val()
	let private_key = $('.private-key').val()
	// construct inputs for send-tokens
	let args = {
		token: contract_address,
		to: to_address,
		amount: amount,
	}
	let optional_args = {
		gasPrice: gwei,
		key: private_key,
	}
	// feed into send-tokens
	try {
		await sendTokensUserFacing(optional_args, args)
	} catch(error) {
		alert(error)
	}
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
