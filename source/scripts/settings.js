/* Our custom settings module.  Mainly just for organization purposes, to put all settings things in one place */

////////////////// IMPORTS //////////////////
const $ = require('jquery')
const _ = require('lodash')
const rp = require('request-promise-native')
const {ipcRenderer} = require('electron')

const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
let user_data = undefined
let SETTINGS_NAMES = ['gas-price', 'contract-address', 'key', 'decimals']

/////////////////// MAIN ///////////////////
function init(preferences) {
	// create pref handle
	user_data = preferences
	// restore saved settings to GUI
	set()
	// init triggers
	$('.settings-button').click(showMoreLess)
	for (let name of SETTINGS_NAMES) {
		// when it's value is changed, save it
		// unfortunately this excludes changes from $().val(new_val)
		$('.' + name).change(save)
	}
	// triggers to update private key input fields
	$('.key-type, .key-input-type').change(function(){
		updateKeyInputFields()
		save()
	})
	$('.key-button').click(() => ipcRenderer.send('choose-key-path'))
	$('input.key, input.key-extra').change(save)
}

function updateKeyInputFields() {
	let type = $('.key-type').val()
	let input_type = $('.key-input-type').val()
	let $button = $('.key-button')
	let $extra_wrapper = $('.key-extra-wrapper')
	let $extra_prompt = $('span.key-extra')
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
		$extra_prompt.html('index')
		$extra_wrapper.show()
	}
	else throw 'bad type'
}

function getKey() {
	// retrieve the key settings that are currently inputted in the GUI
	let type = $('.key-type').val()
	let input_type = $('.key-input-type').val()
	let value = $('input.key').val()
	let key_settings = {}
	key_settings['type'] = type
	key_settings['input-type'] = input_type
	key_settings['value'] = value
	if (type === 'hex') {
		// pass
	}
	else if (type === 'mnemonic') {
		let value_extra = $('input.key-extra').val()
		key_settings['value-extra'] = value_extra
	}
	else throw 'bad type'
	return key_settings
}

function get() {
	// retrieve the settings that are currently inputted in the GUI
	let settings = {}
	for (let name of SETTINGS_NAMES) {
		settings[name] = $('.' + name).val()
	}
	// deal with key settings
	settings['key'] = getKey()
	// return
	return settings
}

function setKey(key_settings) {
	// retrieve the key settings that are currently inputted in the GUI
	// setup
	let $type = $('.key-type')
	let $input_type = $('.key-input-type')
	let $value = $('input.key')
	let $value_extra = $('input.key-extra')
	let type = key_settings['type']
	let input_type = key_settings['input-type']
	let value = key_settings['value']
	// set things in common
	$type.val(type)
	$input_type.val(input_type)
	$value.val(value)
	// set things not in common
	if (type === 'hex') {
		// pass
	}
	else if (type === 'mnemonic') {
		let value_extra = key_settings['value-extra']
		$value_extra.val(value_extra)
	}
	else throw 'bad type'
}

function set() {
	// take the user's preferred settings and set them into the GUI
	let settings = user_data.get('settings')
	for (let name of SETTINGS_NAMES) {
		$('.' + name).val(settings[name])
	}
	// deal with key settings
	setKey(settings['key'])
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
			throw 'not yet supported'
		}
		else throw 'bad input type'
	}
	else if (type === 'mnemonic') {
		// mnemonic
		if (input_type === 'text') {
			options['mnemonic'] = value
		}
		else if (input_type === 'path') {
			throw 'not yet supported'
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
	console.log(options)
	return [settings['contract-address'], options]
}

function showMoreLess() {
	// If just the basic settings are currently shown, show all settings.  If all the settings are shown, show only the basic settings.
	let $more_settings = $('.more-settings')
	let $button = $('.settings-button, .settings-button-invisible')
	if ($more_settings.height() === 0) {
		// need fixed height to get transition animation :(
		$more_settings.height('396px')
		$button.html(STRING['show-less-settings'])
	} else {
		$more_settings.height('0px')
		$button.html(STRING['show-more-settings'])
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, get, set, save, getSendTokensOptions, showMoreLess}
