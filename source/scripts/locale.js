////////////////// IMPORTS //////////////////
const osLocale = require('os-locale')
const $ = require('jquery')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
// init the strings (STRING) based on the locale
let locale = osLocale.sync()
try {
	// try loading the specific locale
	const STRING = require(`../assets/strings/${locale}.json`)
} catch(error) {
	try {
		// try loading the generic locale
		const STRING = require(`../assets/strings/${locale.split('_')[0]}.json`)
	} catch(error) {
		// fallback to english
		const STRING = require('../assets/strings/en.json')
	}
}

// define the format function, like python's "format", but dumber
function format(string, ...inputs) {
	for (let input of inputs) {
		// replaces the FIRST occurence each time
		string = string.replace('{}', input)
	}
	return string
}

// inject strings into the html
function initStrings(section_keys) {
	// init section titles
	for (let key of section_keys) {
		let $el = $(`section.${key} h2`)
		$el.html(STRING['sections'][key])
	}
	// init classed items whose class matches json key
	for (let key in STRING) {
		$('.' + key).html(STRING[key])
	}
}

////////////////// EXPORTS //////////////////
module.exports = {STRING, format, initStrings}

