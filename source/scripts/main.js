//This is a TEMPLATE (notice the "{{privacy}}" variable drop-in).
// once we finish writing in python, we will then translate that to JS, so that a new request to the server won't need to be made every time the user wants to view more info on the calendar.
// Define websocket to be used for server interaction
const exec = require('child_process').exec

const $ = require('./lib/jquery.js')
const is = require('./lib/check-types.js')
require('./lib/date.js')
const {sendTokens} = require('send-tokens')
const parse = require('csv-parse')

require('./date_extend.js')
// const Socket = require('./socket.js')


//////////////////// GLOBALS ////////////////////
// let socket = undefined
const sections = ['settings', 'queue', 'payout', 'success', 'reset']
// the 'help' explanation for each section
const section_to_message = {
	'settings': 'Please input all transaction settings here.<br /><br />The \'amount\' is in 10^(-18) of a token.',
	'queue': 'this yo\' txs bro',
}


///////////////// HELPERS /////////////////


/////////////////// MAIN ///////////////////
async function run() {
	// get user input
	let gwei = $('.gwei').val()
	let contract_address = '0x2e98a6804e4b6c832ed0ca876a943abd3400b224' //$('.contract-address').val()
	let to_address = '0x1e512fc62f01b6becf955b673a72085ca0e2ec2c' //$('.to-address').val()
	let amount = '1' //$('.amount').val()
	// let private_key = //$('.private-key').val()
	// construct inputs for send-tokens
	let options = {
		gasPrice: '20', //gwei,
		key: '0x14459019f82f53ad0d2dd45d4a16f47dc1c008cbf361ba442ac44c19452dd053', // private_key,
		onTxId: console.log,
	}
	// feed into send-tokens
	try {
		let receipt = await sendTokens(contract_address, to_address, amount, options)
	} catch(error) {
		alert(error)
	}
}

function alertPretty(message) {
	alert('hi')
	// Just like 'alert', but prettier for the user
	$('.message').html(message)
	$('.overlay').css('opacity', '1')
	$('.overlay').css('pointer-events', 'auto')
}

function hideOverlay() {
	$('.overlay').css('opacity', '0')
	$('.overlay').css('pointer-events', 'none')
}

// function populateQueue(

function parseCsv(err, file_content) {
	if (err) {
		throw err
	} else {
		let result = parse(file_content)
		alertPretty(result)
	}
}


function readCsv() {
	let path_file = prompt
	fs.readFile(path_file, 'utf-8', parseCsv)
}



function initTriggers() {
	$('.submit').click(run)
	$('.okay-button').click(hideOverlay)
	console.log('initting triggers')
	for (let section of sections) {
		let identifier = `section.${section} h2`
		$(identifier).click(function() {
			console.log('section')
			let message = section_to_message[section]
			alertPretty(message)
		})
	}
}

function initGlobals() {
	// socket = new Socket(onmessage)
}

$(document).ready(function(){
	console.log('start')
	initGlobals()
	initTriggers()
})
