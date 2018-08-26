/* This is the 'pretty' version of alerting a user through the UI.  You can also control which choices are given to the user to respond to the alert. */

////////////////// IMPORTS //////////////////
const _ = require('lodash')
const is = require('check-types')
const $ = require('jquery')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
class Prompt {
	constructor(selector) {
		this.buttons_container_selector = selector
		this.choices = []
	}

	html(message_html) {
		// replace the html of the message
		$('.message').html(message_html)
	}

	show() {
		$('.overlay').css('opacity', '1')
		$('.overlay').css('pointer-events', 'auto')
	}

	hide() {
		$('.overlay').css('opacity', '0')
		$('.overlay').css('pointer-events', 'none')
	}

	clearChoices() {
		// clear all callbacks
		for (let choice of this.choices) {
			choice['callback'] = _.noop
		}
		// remove all buttons for the choices
		$(this.buttons_container_selector).html('')
		// detach the choices themselves
		this.choices = []
	}

	verifyChoice(choice) {
		// verify the choice is okay
		// choice is an object that looks like
		// {
		//	text: Okay,
		//	callback: somefunction,
		// }
		is.assert.object(choice)
		is.assert('text' in choice)
		is.assert('callback' in choice)
	}

	initChoice(choice) {
		// verify the choice is good input
		this.verifyChoice(choice)
		// remember the choice for later
		this.choices.push(choice)
		// setup
		let button_class = choice['text'].toLowerCase().replace(' ', '-') + '-button'
		let button_selector = '.' + button_class
		// create the button for the choice in the html
		$(this.buttons_container_selector).append(
			`<button class="${button_class} btn">${choice['text']}</button>`
		)
		// add the trigger to the button with the appropriate callback
		let action = (function() {
			this.hide()
			choice['callback']()
			// clear all actions immediately to ensure idempotence of the action
			this.clearChoices()
		}).bind(this)
		$(button_selector).click(action)
	}

	initChoices(choices) {
		// initialize the choices
		for (let choice of choices) {
			this.initChoice(choice)
		}
	}

	alert(message, choices) {
		// Similar to builtin 'alert', but using our prompt
		this.html(message)
		this.initChoices(choices)
		this.show()
	}
}

////////////////// EXPORTS //////////////////
module.exports = Prompt

