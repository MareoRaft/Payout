/* A place for simple helper/utility functions */

////////////////// IMPORTS //////////////////
const $ = require('jquery')
const is = require('check-types')

const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
/////////////////// MAIN ///////////////////
function promptNoFileSelected() {
	let message = STRING['no-file-selected']
	prompt.alert(message, [
		{
			text: STRING['ok'],
			callback: _.noop,
		},
	])
}

function getPath(paths) {
	try {
		is.assert.array(paths)
		is.assert(paths.length === 1)
	}
	catch(error) {
		promptNoFileSelected()
		throw 'no file selected'
	}
	let path = paths[0]
	return path
}

function $key(name) {
	// get a jQuery element for a settings key
	let selector = `span.${name}`
	return $(selector)
}

function $value(name) {
	// get a jQuery element for a settings value
	let selector = `.input.${name}`
	return $(selector)
}

////////////////// EXPORTS //////////////////
module.exports = {getPath, $key, $value}

