/* This is not the 'main' electron javascript process, but rather the 'main' point of entry for all javascript files that I wrote in this app. */

//////////////////// IMPORTS ////////////////////
const exec = require('child_process').exec
const fs = require('fs')

const {ipcRenderer} = require('electron')
const $ = require('jquery')
const is = require('check-types')
require('./lib/date.js')
const {sendTokens} = require('send-tokens')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')

require('./date-extend.js')
const tables = require('./queue-data-binding.js')
const section_to_message = require('../assets/help.json')
const Prompt = require('./prompt.js')


//////////////////// GLOBALS ////////////////////
// the queue of transactions to-be-sent
let queue = []
let queue_success = []
let queue_history = []
const prompt = new Prompt('.buttons-flex-wrapper')
const sections = ['settings', 'queue', 'payout', 'success', 'reset', 'history']
// the 'help' explanation for each section
let SKIP_CSV_VERIFICATION = true


///////////////// HELPERS /////////////////


/////////////////// MAIN ///////////////////
function getSettings() {
	let gwei = $('.gwei').val()
	let contract_address = '0x2e98a6804e4b6c832ed0ca876a943abd3400b224' //$('.contract-address').val()
	// let private_key = //$('.private-key').val()
	// construct inputs for send-tokens
	let options = {
		gasPrice: '20', //gwei,
		key: '0x14459019f82f53ad0d2dd45d4a16f47dc1c008cbf361ba442ac44c19452dd053', // private_key,
		onTxId: console.log,
	}
	return [contract_address, options]
}

async function payout() {
	// get user input
	let [contract_address, options] = getSettings()
	// feed into send-tokens
	let receipts = []
	let queue_fail = []
	while (is.nonEmptyArray(queue)) {
		let tx = queue.shift()
		try{
			// let receipt = await sendTokens(contract_address, tx['to-address'], tx['amount'], options)
			let receipt = null
			// mark transaction as sent immediately
			tx['status'] = 'sent'
			tables.update('queue-table', queue)
			receipts.push(receipt)
			queue_success.push(tx)
			tables.update('success-table', queue_success)
		} catch(error) {
			console.log(error)
			queue_fail.push(tx)
		}
	}
	while (is.nonEmptyArray(queue_fail)) {
		let tx = queue_fail.shift()
		queue.push(tx)
	}
	tables.updateMany([
		['queue-table', queue],
		['success-table', queue_success],
	])
}

function reset() {
	// this function empties the queue and success queue, moving the transactions to the history queue
	while (is.nonEmptyArray(queue_success)) {
		let tx = queue_success.shift()
		queue_history.push(tx)
	}
	while (is.nonEmptyArray(queue)) {
		let tx = queue.shift()
		queue_history.push(tx)
	}
	tables.updateMany([
		['queue-table', queue],
		['success-table', queue_success],
		['history-table', queue_history],
	])
}

function populateQueue(data) {
	// add the data to the queue
	for (let row of data) {
		// create a tx object
		let tx = row
		tx['status'] = 'not sent'
		// add it to the queue
		queue.push(tx)
	}
	tables.update('queue-table', queue)
}

function verifyCsv(data) {
	let proceed = () => populateQueue(data)
	if (SKIP_CSV_VERIFICATION) {
		proceed()
	} else {
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
	fs.readFile(path, 'utf-8', parseCsv)
}

function importFile() {
	console.log('before')
	ipcRenderer.send('open-file-dialog')
	console.log('after')
}

function toHistory() {
	$('.main-container-history').css('z-index', '1')
}
function toPayout() {
	$('.main-container-history').css('z-index', '-1')
}

function showMoreLessSettings() {
	// If just the basic settings are currently shown, show all settings.  If all the settings are shown, show only the basic settings.
	let $more_settings = $('.more-settings')
	let $button = $('.settings-button, .settings-button-invisible')
	if ($more_settings.is(':visible')) {
		$more_settings.hide()
		$button.html('Show more settings')
	} else {
		$more_settings.show()
		$button.html('Show less settings')
	}
}

function initTriggers() {
	// navigation
	$('.nav-history').click(toHistory)
	$('.nav-payout').click(toPayout)
	// buttons
	$('.settings-button').click(showMoreLessSettings)
	$('.queue-button').click(importFile)
	$('.payout-button').click(payout)
	$('.reset-button').click(reset)
	// help messages
	$('.help').click(function() {
		let message = section_to_message['help']
		prompt.alert(message, [
			{
				text: 'Okay',
				callback: _.noop,
			},
		])
	})
	for (let section of sections) {
		let identifier = `section.${section} h2`
		$(identifier).click(function() {
			let message = section_to_message[section]
			prompt.alert(message, [
				{
					text: 'Okay',
					callback: _.noop,
				},
			])
		})
	}
	// electron things
	ipcRenderer.on('selected-file', readFile)
}

$(document).ready(function(){
	tables.initMany(['queue-table', 'success-table', 'history-table'])
	initTriggers()
})

