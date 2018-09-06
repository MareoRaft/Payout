/* A place for simple helper/utility functions */

////////////////// IMPORTS //////////////////
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

////////////////// EXPORTS //////////////////
module.exports = {getPath}

