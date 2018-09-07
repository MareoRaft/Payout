/* This is not the 'main' electron javascript process, but rather the 'main' point of entry for all javascript files that I wrote in this app. */

//////////////////// IMPORTS ////////////////////
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
const {getPath, $key, $value} = require('./helpers.js')
const {STRING, format, initStrings} = require('./locale.js')

//////////////////// GLOBALS ////////////////////
const prompt = new Prompt('.buttons-flex-wrapper')
const user_data = new Prefs()
// the queue of transactions to-be-sent
let queue_before = new Queue(onchange=function() {
	tables.update('before-queue', queue_before)
})
let queue_after = new Queue(onchange=function() {
	tables.update('after-queue', queue_after)
	user_data.set('history', queue_after)
})
const SECTIONS = ['settings', 'queue', 'payout', 'success', 'history']
// the 'help' explanation for each section
let SKIP_CONFIRM_CSV = true
let SKIP_CONFIRM_PAYOUT = true
let SKIP_SEND_TOKENS = true

///////////////// HELPERS /////////////////
/////////////////// MAIN ///////////////////
async function payout(num_tries=3) {
	// attempt to pay out all transactions in queue using send-tokens
	// get user input
	let [contract_address, options] = await settings.getSendTokensOptions()
	// feed into send-tokens
	let queue_fail = new Queue()
	// since transactions sometimes fail, we attempt to send multiple times
	for (let _ = 0; _ < num_tries; _++) {
		// if you ever change the type of queue, you should also change the is.nonEmptyArray(queue) line too
		is.assert.array(queue_before)
		while (is.nonEmptyArray(queue_before)) {
			let tx = queue_before.dequeue()
			try{
				// sendTokens returns a Promise
				if (SKIP_SEND_TOKENS) {
					let receipt = {transactionHash: 'tx hash here'}
					tx['time'] = getTimestamp()
					tx['status'] = STRING['fake sent']
					tx['info'] = receipt['transactionHash']
					queue_after.enqueue(tx)
				} else {
					sendTokens(contract_address, tx['to-address'], tx['amount'], options).then(function(receipt) {
						tx['time'] = getTimestamp()
						tx['status'] = STRING['sent']
						tx['info'] = receipt['transactionHash']
						queue_after.enqueue(tx)
					})
				}
			} catch(error) {
				console.log(error)
				tx['time'] = getTimestamp()
				tx['status'] = STRING['failed']
				// there is an error.name and an error.message, either of which could be useful
				tx['info'] = error.message
				queue_fail.enqueue(tx)
			}
		}
		queue_before.enqueueAll(queue_fail.dequeueAll())
	}
}

// function amountToTokens(amount) {
// 	// use the decimals setting to calculate how many tokens the 'amount' corresponds to
// 	let settings = settings.get()
// 	let decimals = parseInt(settings['decimals'])
// 	let contract = createFlexContract(token, opts)
// 	let contract_decimals = await resolveDecimals(contract)
// 	let smallest_unit = 0.1 * 10**contract_decimals
// 	let unit = smallest_unit * 10**decimals
// 	let tokens = amount * unit
// 	return tokens
// }

function requestPayout() {
	let proceed = license.requestValidation
	if (SKIP_CONFIRM_PAYOUT) {
		proceed()
	} else {
		// give the user some info and ask if they with to proceed to payout
		let amounts = _.map(queue_before, tx => BigNumber(tx['amount']))
		let amount_total = _.reduce(amounts, (x, y) => x.plus(y))
		let message = format(STRING['payout-confirm'], amount_total)
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

function populateQueue(data) {
	// add the data to the queue
	for (let row of data) {
		// create a tx object
		let tx = row
		tx['status'] = 'not sent'
		// add it to the queue
		queue_before.enqueue(tx)
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

function parseCsv(error, file_content) {
	if (error) {
		throw error
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

function importCsvFile(event, paths) {
	// read the csv file and populate the table
	let path = getPath(paths)
	fs.readFile(path, 'utf-8', parseCsv)
}

function requestImportFile() {
	ipcRenderer.send('choose-csv-file')
}

function initPrivateKey() {
	let $val = $value('private-key')
	$val.val('')
	$val.prop('type', 'text')
	let $button = $('.private-key-button')
	$button.html(STRING['hide-private-key'])
	// remove old click events if they exist
	$button.off()
	$button.click(hidePrivateKey)
}

function hidePrivateKey() {
	let $val = $value('private-key')
	$val.prop('type', 'password')
	let $button = $('.private-key-button')
	$button.html(STRING['reset-private-key'])
	// remove old click events if they exist
	$button.off()
	$button.click(initPrivateKey)
}

function exportQueue(event, paths, queue_id) {
	// export the transactions to path
	let path = getPath(paths)
	// we could pass in queue itself instead of queue id if main.js and index.js can share globals
	let queue = (queue_id === 'before')? queue_before: queue_after;
	try {
		let string = JSON.stringify(queue, null, 2)
		fs.writeFileSync(path, string)
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
		let message = STRING['export-failure']
		prompt.alert(message, [
			{
				text: STRING['ok'],
				callback: _.noop,
			},
		])
	}
}

function requestClearQueue(queue) {
	// ask the user if they really do want to clear the history!
	let message = STRING['clear-queue-confirm']
	prompt.alert(message, [
		{
			text: STRING['yes'],
			callback: () => queue.dequeueAll(),
		},
		{
			text: STRING['no'],
			callback: _.noop,
		},
	])
}

function initHistory() {
	let history = user_data.get('history')
	queue_after.enqueueAll(history)
}

function initHelpTriggers() {
	// help for each section
	for (let section in STRING['help-sections']) {
		let identifier = `section.${section} h2`
		$(identifier).click(function() {
			let message = STRING['help-sections'][section]
			prompt.alert(message, [
				{
					text: STRING['ok'],
					callback: _.noop,
				},
			])
		})
	}
	// help for each setting in Settings
	for (let name in STRING['help-settings']) {
		$key(name).click(function() {
			let message = STRING['help-settings'][name][1]
			prompt.alert(message, [
				{
					text: STRING['ok'],
					callback: _.noop,
				},
			])
		})
	}
}

function initTriggers() {
	// buttons
	initPrivateKey()
	$('.queue-button').click(requestImportFile)
	$('.payout-button').click(requestPayout)
	$('.clear-queue-button').click(function() {
		requestClearQueue(queue_before)
	})
	$('.export-queue-button').click(function() {
		ipcRenderer.send('before-save-dialog')
	})
	$('.clear-history-button').click(function() {
		requestClearQueue(queue_after)
	})
	$('.export-history-button').click(function() {
		ipcRenderer.send('after-save-dialog')
	})
	// help messages
	initHelpTriggers()
	// electron things
	ipcRenderer.on('csv-file-chosen', importCsvFile)
	ipcRenderer.on('key-file-chosen', settings.setKeyPath)
	ipcRenderer.on('export-path-chosen', exportQueue)
}

$(document).ready(function(){
	initStrings(SECTIONS)
	license.init(prompt, payout)
	initDateExtend()
	tables.initMany([
		['before-queue', queue_before],
		['after-queue', queue_after],
	])
	initTriggers()
	// AFTER triggers b/c triggers clears the private key field
	settings.init(user_data)
	initHistory()
})

