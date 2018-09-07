/* Our custom settings module.  Mainly just for organization purposes, to put all settings things in one place */

////////////////// IMPORTS //////////////////
const fs = require('fs')

const $ = require('jquery')
const _ = require('lodash')
const rp = require('request-promise-native')
const {ipcRenderer} = require('electron')

const {getPath, $key, $value} = require('./helpers.js')
const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
let user_data = undefined
let prompt = undefined
let SETTINGS_NAMES = Object.keys(require('../assets/strings/en.json')['help-settings'])

/////////////////// MAIN ///////////////////
function init(preferences, theprompt) {
	// create pref handle
	user_data = preferences
	prompt = theprompt
	// restore saved settings to GUI
	set()
	// init triggers
	$('.settings-button').click(showMoreLess)
	for (let name of SETTINGS_NAMES) {
		// when it's value is changed, save it
		// unfortunately this excludes changes from $().val(new_val)
		$value(name).change(save)
	}
	// triggers to update private key input fields
	$('.key-type, .key-input-type').change(function(){
		updateKeyInputFields()
		save()
	})
	$('.key-button').click(() => ipcRenderer.send('choose-key-file'))
	$value('private-key').change(save)
	$value('key-extra').change(save)
}

function setKeyPath(event, paths) {
	// populate the key field with the file PATH
	let path = getPath(paths, prompt)
	$value('private-key').val(path)
}

function updateKeyInputFields() {
	// update boxes in key area based on what the user selected in the dropdowns
	let type = $('.key-type').val()
	let input_type = $('.key-input-type').val()
	setKeyInputFields(type, input_type)
}

function setKeyInputFields(type, input_type) {
	let $button = $('.key-button')
	let $extra_wrapper = $('.key-extra-wrapper')
	let $extra_prompt = $key('key-extra')
	// deal with button
	if (input_type === 'text') {
		$button.hide()
	}
	else if (input_type === 'path') {
		$button.show()
	}
	else throw 'bad input type'
	// deal with extra inputs
	if (type === 'hex') {
		$extra_wrapper.hide()
	}
	else if (type === 'mnemonic') {
		$extra_prompt.html(STRING['key-extra-mnemonic'])
		$extra_wrapper.show()
	}
	else if (type === 'keystore') {
		$extra_prompt.html(STRING['key-extra-keystore'])
		$extra_wrapper.show()
	}
	else throw 'bad type'
}

function setKey(key_settings) {
	// take the user's preferred *key* settings and set them into the GUI
	// setup
	let type = key_settings['type']
	let input_type = key_settings['input-type']
	let value = key_settings['value']
	// update key area itself to show correct boxes
	setKeyInputFields(type, input_type)
	// set things in common
	$('.key-type').val(type)
	$('.key-input-type').val(input_type)
	$value('private-key').val(value)
	// set things not in common
	if ('value-extra' in key_settings) {
		let value_extra = key_settings['value-extra']
		$value('key-extra').val(value_extra)
	}
}

function set() {
	// take the user's preferred settings and set them into the GUI
	let settings = user_data.get('settings')
	for (let name of SETTINGS_NAMES) {
		$value(name).val(settings[name])
	}
	// deal with key settings
	setKey(settings['key'])
}

function getKey() {
	// retrieve the key settings that are currently inputted in the GUI
	let type = $('.key-type').val()
	let input_type = $('.key-input-type').val()
	let value = $value('private-key').val()
	let value_extra = $value('key-extra').val()
	let key_settings = {}
	key_settings['type'] = type
	key_settings['input-type'] = input_type
	key_settings['value'] = value
	key_settings['value-extra'] = value_extra
	return key_settings
}

function get() {
	// retrieve the settings that are currently inputted in the GUI
	let settings = {}
	for (let name of SETTINGS_NAMES) {
		settings[name] = $value(name).val()
	}
	// deal with key settings
	settings['key'] = getKey()
	// return
	return settings
}

function save() {
	// take the settings currently inputted in the GUI and save them to disk
	let settings = get()
	user_data.set('settings', settings)
}

async function getRecommendedGasPrice() {
	// gets the recommended gas price from https://ethgasstation.info
	let body = await rp("https://ethgasstation.info/json/ethgasAPI.json")
	let info = JSON.parse(body)
	let recommended_gas_price_raw = info['average']
	// add 1 because Tyler says it's a good buffer
	let recommended_gas_price_in_gwei = (recommended_gas_price_raw / 10) + 1
	return recommended_gas_price_in_gwei
}

function getSendTokensKeyOptions(settings) {
	// retrieves the *key* settings and re-organizes them into the correct inputs for send-tokens
	// setup
	let options = {}
	let type = settings['type']
	let input_type = settings['input-type']
	let value = settings['value']
	let value_extra = settings['value-extra']
	// cases
	if (type === 'hex') {
		if (input_type === 'text') {
			options['key'] = value
		}
		else if (input_type === 'path') {
			options['key'] = fs.readFileSync(value)
		}
		else throw 'bad input type'
	}
	else if (type === 'mnemonic') {
		// mnemonic
		if (input_type === 'text') {
			options['mnemonic'] = value
		}
		else if (input_type === 'path') {
			options['key'] = fs.readFileSync(value)
		}
		else throw 'bad input type'
		// mnemonic index
		options['mnemonicIndex'] = value_extra
	}
	else if (type === 'keystore') {
		// keystore
		if (input_type === 'text') {
			options['keystore'] = value
		}
		else if (input_type === 'path') {
			options['keystoreFile'] = value
		}
		else throw 'bad input type'
		// keystore password
		options['password'] = value_extra
	}
	else throw 'bad type'
	return options
}

async function getSendTokensOptions() {
	// retrieves the settings and re-organizes them into the correct inputs for send-tokens
	let settings = get()
	// if no gas price is specified, use a recommended price
	let gas_price = (settings['gas-price'] === '')? await getRecommendedGasPrice(): settings['gas-price'];
	// construct inputs for send-tokens
	let options = {
		gasPrice: gas_price,
		// decimals: settings['decimals'],
		onTxId: console.log,
	}
	// deal with key options
	let key_options = getSendTokensKeyOptions(settings['key'])
	_.extend(options, key_options)
	// return
	return [settings['contract-address'], options]
}

function showMoreLess() {
	// If just the basic settings are currently shown, show all settings.  If all the settings are shown, show only the basic settings.
	let $more_settings = $('.more-settings')
	let $button = $('.settings-button, .settings-button-invisible')
	if ($more_settings.height() === 0) {
		// need fixed height to get transition animation :(
		$more_settings.height('206px')
		$button.html(STRING['show-less-settings'])
	} else {
		$more_settings.height('0px')
		$button.html(STRING['show-more-settings'])
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, get, set, save, getSendTokensOptions, showMoreLess, setKeyPath}
