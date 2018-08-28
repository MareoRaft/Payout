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
const request = require('request')

require('./date-extend.js')
const tables = require('./queue-data-binding.js')
const section_to_message = require('../assets/help.json')
const Prompt = require('./prompt.js')
const Prefs = require('./prefs.js')
const settings = require('./settings.js')

//////////////////// GLOBALS ////////////////////
// the queue of transactions to-be-sent
let queue = []
let queue_success = []
let queue_history = []
const prompt = new Prompt('.buttons-flex-wrapper')
const prefs = new Prefs()
const sections = ['settings', 'queue', 'payout', 'success', 'reset', 'history']
// the 'help' explanation for each section
let SKIP_CSV_VERIFICATION = true

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

async function payout() {
	// get user input
	let [contract_address, options] = settings.getPayoutOptions()
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

function initPrivateKey() {
	let $key = $('.private-key')
	$key.val('')
	$key.prop('type', 'text')
	let $button = $('.private-key-button')
	$button.html('Hide private key')
	// remove old click events if they exist
	$button.off()
	$button.click(hidePrivateKey)
}

function hidePrivateKey() {
	let $key = $('.private-key')
	$key.prop('type', 'password')
	let $button = $('.private-key-button')
	$button.html('Reset private key')
	// remove old click events if they exist
	$button.off()
	$button.click(initPrivateKey)
}

function initTriggers() {
	// navigation
	$('.nav-history').click(toHistory)
	$('.nav-payout').click(toPayout)
	// buttons
	initPrivateKey()
	$('.gas-price-button').click(requestRecommendedGasPrice)
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
	settings.init(prefs)
	initTriggers()
})

