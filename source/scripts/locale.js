////////////////// IMPORTS //////////////////
const osLocale = require('os-locale')
const $ = require('jquery')

////////////////// GLOBALS //////////////////
// if true, use locale 'en' instead of 'en_GB', for example
const USE_LOCALE_FALLBACK = true

/////////////////// MAIN ///////////////////
// init the strings (STRING) based on the locale
let locale = osLocale.sync()
if (USE_LOCALE_FALLBACK) {
	locale = locale.split('_')[0]
}
let locale_path = `../assets/strings/${locale}.json`
const STRING = require(locale_path)

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

