/* All of our license related things.  Grouped together merely for organization. */

////////////////// IMPORTS //////////////////
const _ = require('lodash')
const request = require('request')
const is = require('check-types')
const {machineId} = require('node-machine-id')
const Store = require('electron-store')

const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
const HOSTNAME = 'localhost' // learnnation.org
let payout = undefined
let prompt = undefined
let user_data = undefined
let storage = undefined

/////////////////// MAIN ///////////////////
function init(prompt_obj, payout_func) {
	// populate globals
	is.assert.assigned(prompt_obj)
	prompt = prompt_obj
	is.assert.assigned(payout_func)
	payout = payout_func
	// license storage
	let defaults = {
		license: '',
	}
	let options = {
		name: 'license',
		defaults: defaults,
	}
	storage = new Store(options)
}

function promptRequest() {
	// form that user can fill out to request a new license
	let message = STRING['prompt-license-request']
	prompt.alert(message, [
		{
			text: STRING['request'],
			callback: requestNew,
		},
		{
			text: STRING['cancel'],
			callback: _.noop,
		},
	])
}

async function requestNew() {
	// request a new license
	// retrieve their inputted email somehow
	let email = undefined
	// make the request
	let id = await machineId()
	let url = `http://${HOSTNAME}/Payout/request-license?id=${id}`
	request(url, respondToRequest)
}

function respondToRequest(error, response, body) {
	// save the license that the server sends you
	let license = body
	storage.set('license', license)
}

async function requestValidation() {
	// request a server response that indicates whether user has purchased a license
	// get computer id
	let id = await machineId()
	let license = storage.get('license')
	// request license validation from server
	let url = `http://${HOSTNAME}/Payout/request-license-validation?id=${id}&license=${license}`
	request(url, respondToValidation)
}

function respondToValidation(error, response, body) {
	// if user has purchased a license, payout
	if (error) {
		throw error
	} else {
		let has_license = (body === 'True')
		if (has_license) {
			payout()
		} else {
			let message = STRING['no-license']
			prompt.alert(message, [
				{
					text: STRING['ok'],
					callback: _.noop,
				},
				{
					text: STRING['request-a-license'],
					callback: promptRequest,
				},
			])
		}
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, requestValidation, respondToRequest, requestNew, promptRequest, respondToValidation}
