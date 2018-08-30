/* All of our license related things.  Grouped together merely for organization. */

////////////////// IMPORTS //////////////////
const _ = require('lodash')
const request = require('request')
const is = require('check-types')
const {machineId} = require('node-machine-id')

////////////////// GLOBALS //////////////////
const HOSTNAME = 'localhost' // learnnation.org
let payout = undefined
let prompt = undefined

/////////////////// MAIN ///////////////////
function init(prompt_obj, payout_func) {
	is.assert.assigned(prompt_obj)
	prompt = prompt_obj
	is.assert.assigned(payout_func)
	payout = payout_func
}

function promptRequest() {
	// form that user can fill out to request a new license
	console.log('prompting user again')
	let message = 'To request a license, input your email address and click \'Request\'.<br /><br />A license grants you usage of the Payout application on the particular computer that you request from.  If you need to use Payout on multiple computers or need assistance, feel free to email us at <a href="mailto:mvlancellotti+payout@gmail.com">mvlancellotti+payout@gmail.com</a>.'
	prompt.alert(message, [
		{
			text: 'Request',
			callback: requestNew,
		},
		{
			text: 'Cancel',
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
	// TODO
	alert('got a license yo')
}

async function requestValidation() {
	// request a server response that indicates whether user has purchased a license
	// get computer id
	let id = await machineId()
	let license = 'testme' // also requested from server
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
			console.log('first messaging user')
			console.log(prompt)
			let message = 'You are either disconnected from the internet or you have not purchased a license.  Payout cannot proceed.'
			prompt.alert(message, [
				{
					text: 'Okay',
					callback: _.noop,
				},
				{
					text: 'Request a license',
					callback: promptRequest,
				},
			])
		}
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, requestValidation, respondToRequest, requestNew, promptRequest, respondToValidation}
