/* This is not the 'main' electron javascript process, but rather the 'main' point of entry for all javascript files that I wrote in this app. */

//////////////////// IMPORTS ////////////////////
const exec = require('child_process').exec
const fs = require('fs')

const {ipcRenderer} = require('electron')
const $ = require('jquery')
const is = require('check-types')
const {sendTokens} = require('send-tokens')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')
const request = require('request')
const BigNumber = require('bignumber.js') // 'bignumber.js' is a different library than 'bignumber'

const {initDateExtend, getTimestamp} = require('./date-extend.js')
const tables = require('./tables.js')
const settings = require('./settings.js')
const license = require('./license.js')
const Prompt = require('./prompt.js')
const Prefs = require('./prefs.js')
const Queue = require('./queue.js')
const {STRING, format, initStrings} = require('./locale.js')

//////////////////// GLOBALS ////////////////////
const prompt = new Prompt('.buttons-flex-wrapper')
const user_data = new Prefs()
// the queue of transactions to-be-sent
let queue = new Queue(onchange=function() {
	tables.update('queue-table', queue)
})
let queue_success = new Queue(onchange=function() {
	tables.update('success-table', queue_success)
})
let queue_history = new Queue(onchange=function() {
	tables.update('history-table', queue_history)
	user_data.set('history', queue_history)
})
const SECTIONS = ['settings', 'queue', 'payout', 'success', 'reset', 'history']
// the 'help' explanation for each section
let SKIP_CONFIRM_CSV = true
let SKIP_CONFIRM_PAYOUT = false

///////////////// HELPERS /////////////////

/////////////////// MAIN ///////////////////
function setRecommendedGasPrice(price) {
	// given a price (in gwei), set it as the GWEI value in settings
	// alternatively we could just put a box next to gwei that says the current recommendation
	$('.gas-price').val(price)
}

function respondToRecommendedGasPrice(error, response, body) {
	if (error) {
		throw error
	} else {
		let info = JSON.parse(body)
		let recommended_gas_price_raw = info['average']
		// add 1 because Tyler says it's a good rule of thumb
		let recommended_gas_price_in_gwei = (recommended_gas_price_raw / 10) + 1
		setRecommendedGasPrice(recommended_gas_price_in_gwei)
	}
}

function requestRecommendedGasPrice() {
	// gets the recommended gas price from https://ethgasstation.info
	request("https://ethgasstation.info/json/ethgasAPI.json", respondToRecommendedGasPrice)
}

async function payout(num_tries=3) {
	// attempt to pay out all transactions in queue using send-tokens
	// get user input
	let [contract_address, options] = settings.getPayoutOptions()
	// feed into send-tokens
	let queue_fail = new Queue()
	// since transactions sometimes fail, we attempt to send multiple times
	for (let _ = 0; _ < num_tries; _++) {
		// if you ever change the type of queue, you should also change the is.nonEmptyArray(queue) line too
		is.assert.array(queue)
		while (is.nonEmptyArray(queue)) {
			let tx = queue.dequeue()
			try{
				// let receipt = await sendTokens(contract_address, tx['to-address'], tx['amount'], options)
				let receipt = {transactionHash: 'tx hash here'}
				console.log(receipt)
				tx['time'] = getTimestamp()
				tx['status'] = STRING['sent']
				tx['info'] = receipt['transactionHash']
				queue_success.enqueue(tx)
			} catch(error) {
				console.log(error)
				tx['time'] = getTimestamp()
				tx['status'] = STRING['failed']
				// there is an error.name and an error.message, either of which could be useful
				tx['info'] = error.message
				queue_fail.enqueue(tx)
			}
		}
		queue.enqueueAll(queue_fail.dequeueAll())
	}
}

function requestPayout() {
	let proceed = license.requestValidation
	if (SKIP_CONFIRM_PAYOUT) {
		proceed()
	} else {
		// give the user some info and ask if they with to proceed to payout
		let amounts = _.map(queue, tx => BigNumber(tx['amount']))
		console.log(amounts)
		let amount_total = _.reduce(amounts, (x, y) => x.plus(y))
		let message = format(STRING['payout-confirm'], amount_total)
		prompt.alert(message, [
			{
				text: 'Yes',
				callback: proceed,
			},
			{
				text: 'No',
				callback: _.noop,
			},
		])
	}
}

function reset() {
	// this function empties the queue and success queue, moving the transactions to the history queue
	queue_history.enqueueAll(queue_success.dequeueAll())
	queue_history.enqueueAll(queue.dequeueAll())
}

function populateQueue(data) {
	// add the data to the queue
	for (let row of data) {
		// create a tx object
		let tx = row
		tx['status'] = 'not sent'
		// add it to the queue
		queue.enqueue(tx)
	}
}

function verifyCsv(data) {
	let proceed = () => populateQueue(data)
	if (SKIP_CONFIRM_CSV) {
		proceed()
	} else {
		// first verify that the inputted data is correct, by asking the user
		let message = STRING['look-okay'] +
			'<br /><br />' +
			'<table>' +
			`<tr class="header-row"><th>${STRING['table']['to-address']}</th><th>${STRING['table']['amount']}</th>`
		for (let row of data) {
			let to_address = row['to-address']
			let amount = row['amount']
			message += `<tr><td>${to_address}</td><td>${amount}</td></tr>`
		}
		message += '</table>'
		prompt.alert(message, [
			{
				text: STRING['yes'],
				callback: proceed,
			},
			{
				text: STRING['no'],
				callback: _.noop,
			},
		])
	}
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

function readCsvFile(event, paths) {
	is.assert.array(paths)
	is.assert(paths.length === 1)
	let path = paths[0]
	fs.readFile(path, 'utf-8', parseCsv)
}

function importFile() {
	ipcRenderer.send('open-file-dialog')
}

function toHistory() {
	$('.main-container-history').css('z-index', '1')
}
function toPayout() {
	$('.main-container-history').css('z-index', '-1')
}

function initPrivateKey() {
	let $key = $('.private-key')
	$key.val('')
	$key.prop('type', 'text')
	let $button = $('.private-key-button')
	$button.html(STRING['hide-private-key'])
	// remove old click events if they exist
	$button.off()
	$button.click(hidePrivateKey)
}

function hidePrivateKey() {
	let $key = $('.private-key')
	$key.prop('type', 'password')
	let $button = $('.private-key-button')
	$button.html(STRING['reset-private-key'])
	// remove old click events if they exist
	$button.off()
	$button.click(initPrivateKey)
}

function exportHistory(event, path) {
	// export the history to path
	if (!path) {
		let message = STRING['no-file-selected']
		prompt.alert(message, [
			{
				text: STRING['ok'],
				callback: _.noop,
			},
		])
		return false
	}
	try {
		let history_string = JSON.stringify(queue_history, null, 2)
		fs.writeFileSync(path, history_string)
		let message = format(STRING['export-success'], path)
		prompt.alert(message, [
			{
				text: STRING['ok'],
				callback: _.noop,
			},
		])
	}
	catch(error) {
		console.log(error)
		let message = 'An error occured.  Failed to export history.'
		prompt.alert(message, [
			{
				text: STRING['ok'],
				callback: _.noop,
			},
		])
	}
}

function clearHistory() {
	queue_history.dequeueAll()
}

function requestClearHistory() {
	// ask the user if they really do want to clear the history!
	let message = STRING['clear-history-confirm']
	prompt.alert(message, [
		{
			text: 'Yes',
			callback: clearHistory,
		},
		{
			text: 'No',
			callback: _.noop,
		},
	])
}

function initHistory() {
	let history = user_data.get('history')
	queue_history.enqueueAll(history)
}

function initTriggers() {
	// navigation
	$('.nav-history').click(toHistory)
	$('.nav-payout').click(toPayout)
	// buttons
	initPrivateKey()
	$('.gas-price-button').click(requestRecommendedGasPrice)
	$('.queue-button').click(importFile)
	$('.payout-button').click(requestPayout)
	$('.reset-button').click(reset)
	$('.clear-history-button').click(requestClearHistory)
	$('.export-history-button').click(function() {
		ipcRenderer.send('history-save-dialog')
	})
	// help messages
	$('.nav-help').click(function() {
		let message = STRING['help']['help']
		prompt.alert(message, [
			{
				text: STRING['ok'],
				callback: _.noop,
			},
		])
	})
	for (let section of SECTIONS) {
		let identifier = `section.${section} h2`
		$(identifier).click(function() {
			let message = STRING['help'][section]
			prompt.alert(message, [
				{
					text: STRING['ok'],
					callback: _.noop,
				},
			])
		})
	}
	// electron things
	ipcRenderer.on('selected-file', readCsvFile)
	ipcRenderer.on('history-path-chosen', exportHistory)
}

$(document).ready(function(){
	initStrings(SECTIONS)
	license.init(prompt, payout)
	initDateExtend()
	tables.initMany(['queue-table', 'success-table', 'history-table'])
	// settings.init(user_data)
	initTriggers()
	settings.init(user_data) // temporary, so we can store the private key
	initHistory()
	readCsvFile(event, ['/Users/Matthew/programming/webwrap/Payout/test/test.csv'])
})

