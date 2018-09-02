/* Our custom settings module.  Mainly just for organization purposes, to put all settings things in one place */

////////////////// IMPORTS //////////////////
const $ = require('jquery')
const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
let user_data = undefined
let SETTINGS_NAMES = ['gas-price', 'contract-address', 'private-key']

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

function getPayoutOptions() {
	// retrieves the settings and re-organizes them into the correct inputs for send-tokens
	let settings = get()
	let contract_address = settings['contract-address']
	// construct inputs for send-tokens
	let options = {
		gasPrice: settings['gas-price'],
		key: settings['private-key'],
		onTxId: console.log,
	}
	return [contract_address, options]
}

function showMoreLess() {
	// If just the basic settings are currently shown, show all settings.  If all the settings are shown, show only the basic settings.
	let $more_settings = $('.more-settings')
	let $button = $('.settings-button, .settings-button-invisible')
	if ($more_settings.height() === 0) {
		// need fixed height to get transition animation :(
		$more_settings.height('429px')
		$button.html(STRING['show-less-settings'])
	} else {
		$more_settings.height('0px')
		$button.html(STRING['show-more-settings'])
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, get, set, save, getPayoutOptions, showMoreLess}
