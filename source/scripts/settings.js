/* Our custom settings module.  Mainly just for organization purposes, to put all settings things in one place */

////////////////// IMPORTS //////////////////
const $ = require('jquery')
const rp = require('request-promise-native')

const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
let user_data = undefined
let SETTINGS_NAMES = ['gas-price', 'contract-address', 'private-key', 'decimals']

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
}

function get() {
	// retrieve the settings that are currently inputted in the GUI
	let settings = {}
	for (let name of SETTINGS_NAMES) {
		settings[name] = $('.' + name).val()
	}
	return settings
}

function set() {
	// take the user's preferred settings and set them into the GUI
	let settings = user_data.get('settings')
	for (let name of SETTINGS_NAMES) {
		$('.' + name).val(settings[name])
	}
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

async function getPayoutOptions() {
	// retrieves the settings and re-organizes them into the correct inputs for send-tokens
	let settings = get()
	// if no gas price is specified, use a recommended price
	let gas_price = (settings['gas-price'] === '')? await getRecommendedGasPrice(): settings['gas-price'];
	// construct inputs for send-tokens
	let options = {
		gasPrice: gas_price,
		key: settings['private-key'],
		// decimals: settings['decimals'],
		onTxId: console.log,
	}
	return [settings['contract-address'], options]
}

function showMoreLess() {
	// If just the basic settings are currently shown, show all settings.  If all the settings are shown, show only the basic settings.
	let $more_settings = $('.more-settings')
	let $button = $('.settings-button, .settings-button-invisible')
	if ($more_settings.is(':visible')) {
		$more_settings.hide()
		$button.html(STRING['show-more-settings'])
	} else {
		$more_settings.show()
		$button.html(STRING['show-less-settings'])
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, get, set, save, getPayoutOptions, showMoreLess}
