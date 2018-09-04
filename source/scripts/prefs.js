/* Our custom user data / user preferences object */

////////////////// IMPORTS //////////////////
const Store = require('electron-store')
const encryptor = require('simple-encryptor')(require('../assets/secrets.json')['encryption-key'])

////////////////// GLOBALS //////////////////
////////////////// HELPERS //////////////////

/////////////////// MAIN ///////////////////
class Prefs {
	constructor() {
		let defaults = {
			// history of transactions
			history: [],
			// settings in the 'Settings' section
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

	decrypt(key, value) {
		// decrypt anything in the value if necessary
		if (key === 'settings' && 'private-key' in value) {
			value['private-key'] = encryptor.decrypt(value['private-key'])
		}
		return value
	}

	get(key) {
		let value = this.storage.get(key)
		value = this.decrypt(key, value)
		return value
	}

	encrypt(key, value) {
		// encrypt anything in the value if necessary
		if (key === 'settings' && 'private-key' in value) {
			value['private-key'] = encryptor.encrypt(value['private-key'])
		}
		return value
	}

	set(key, value) {
		value = this.encrypt(key, value)
		this.storage.set(key, value)
	}
}

////////////////// EXPORTS //////////////////
module.exports = Prefs
