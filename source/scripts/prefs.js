/* Our custom user preferences object */

////////////////// IMPORTS //////////////////
const Store = require('electron-store')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
class Prefs {
	constructor() {
		let defaults = {
			// misc user prefs

			// settings
			settings: {
				'gwei': 20,
				'contract-address': '0x2e98a6804e4b6c832ed0ca876a943abd3400b224',
				'private-key': '0x14459019f82f53ad0d2dd45d4a16f47dc1c008cbf361ba442ac44c19452dd053',
			},
		}
		let options = {
			name: 'prefs',
			defaults: defaults,
		}
		this.storage = new Store(options)
	}

	get(key) {
		let value = this.storage.get(key)
		if (key === 'private-key') {
			// decrypt the private key
		}
		return value
	}

	set(key, value) {
		if (key === 'private-key') {
			// encrypt the private key
		}
		this.storage.set(key, value)
	}
}

////////////////// EXPORTS //////////////////
module.exports = Prefs
