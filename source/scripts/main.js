/* This is not the 'main' electron javascript process, but rather the 'main' point of entry for all javascript files that I wrote in this app. */

//////////////////// IMPORTS ////////////////////
const exec = require('child_process').exec
const fs = require('fs')

const {ipcRenderer} = require('electron')
const $ = require('./lib/jquery.js')
const is = require('./lib/check-types.js')
require('./lib/date.js')
const {sendTokens} = require('send-tokens')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')

require('./date-extend.js')
const tables = require('./queue-data-binding.js')


//////////////////// GLOBALS ////////////////////
// the queue of transactions to-be-sent
let queue = []
let callback_ok = _.noop
const sections = ['settings', 'queue', 'payout', 'success', 'reset']
// the 'help' explanation for each section
const section_to_message = {
	'settings': 'Please input all transaction settings here.<br /><br />The \'amount\' is in 10^(-18) of a token.',
	'queue': 'this yo\' txs bro',
}


///////////////// HELPERS /////////////////


/////////////////// MAIN ///////////////////
async function payout() {
	// get user input
	let gwei = $('.gwei').val()
	let contract_address = '0x2e98a6804e4b6c832ed0ca876a943abd3400b224' //$('.contract-address').val()
	// let private_key = //$('.private-key').val()
	// construct inputs for send-tokens
	let options = {
		gasPrice: '20', //gwei,
		key: '0x14459019f82f53ad0d2dd45d4a16f47dc1c008cbf361ba442ac44c19452dd053', // private_key,
		onTxId: console.log,
	}
	// feed into send-tokens
	console.log('paying out')
	try {
		let receipts = []
		for (let row of queue) {
			// let receipt = await sendTokens(contract_address, row.to_address, row.amount, options)
			// receipts.push(receipt)
		}
		console.log(receipts)
	} catch(error) {
		alert(error)
	}
}

function alertPretty(message) {
	console.log('hi')
	// Just like 'alert', but prettier for the user
	$('.message').html(message)
	$('.overlay').css('opacity', '1')
	$('.overlay').css('pointer-events', 'auto')
}

function hideOverlay() {
	$('.overlay').css('opacity', '0')
	$('.overlay').css('pointer-events', 'none')
}


function populateQueue(data) {
	// add the data to the queue
	for (let row of data) {
		queue.push(row)
	}
	console.log('done populating queue')
	tables.update('queue-table', queue)
}

function verifyCsv(data) {
	// first verify that the inputted data is correct, by asking the user
	let message = 'Does this look okay?' +
		'<br /><br />' +
		'<table>' +
		'<tr class="header-row"><th>To address</th><th>Amount</th>'
	for (let row of data) {
		let to_address = row['to-address']
		let amount = row['amount']
		message += `<tr><td>${to_address}</td><td>${amount}</td></tr>`
	}
	message += '</table>'
	callback_ok = () => populateQueue(data)
	alertPretty(message)
}

function parseCsv(err, file_content) {
	if (err) {
		throw err
	} else {
		let options = {
			columns: ['to-address', 'amount'],
			comment: '#',
			skip_empty_lines: true,
			trim: true,
		}
		let data = parse(file_content, options)
		verifyCsv(data)
	}
}

function readFile(event, paths) {
	is.assert(paths.length === 1)
	let path = paths[0]
	console.log(path)
	fs.readFile(path, 'utf-8', parseCsv)
}

function importFile() {
	ipcRenderer.send('open-file-dialog')
}

function initTriggers() {
	$('.payout-button').click(payout)
	$('.queue-button').click(importFile)
	$('.cancel-button').click(hideOverlay)
	$('.okay-button').click(function(){
		hideOverlay()
		callback_ok()
	})
	console.log('initting triggers')
	for (let section of sections) {
		let identifier = `section.${section} h2`
		$(identifier).click(function() {
			let message = section_to_message[section]
			alertPretty(message)
		})
	}
	ipcRenderer.on('selected-directory', readFile)
}

function initGlobals() {
	// here we init any globals that needed to wait for document.ready
}

$(document).ready(function(){
	console.log('start')
	initGlobals()
	tables.init('queue-table')
	initTriggers()
	readFile(undefined, ['/Users/Matthew/programming/webwrap/Payout/test/test.csv'])
})

