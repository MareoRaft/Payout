// Wrapper around WebSocket class that sets up convenient communication.  This is a TEMPLATE (notice the "{{host}}" variable drop-in).

class Socket {

	constructor(onmessage_func) {
		// manually extend WebSocket, because WebSocket didn't want to use "super"
		this.ws = new WebSocket("ws://localhost/mySocket")
		this.ws.socket = this
		this.ws.onmessage = function(event) {
			// Convert things to be more friendly.  Check for good input.
			let dic = JSON.parse(event.data)
			if ('message' in dic) {
				message = dic['message']
				console.log('got message: ' + message)
			}
			// Check to ensure a command is received
			if (!('command' in dic)) {
				console.log("Key 'command' is missing. It is mandatory!")
			}
			return onmessage_func(dic)
		}
		// Once the socket is successfully open, do anything that needs to be done
		this.ws.onopen = function(event) {
			// do stuff
		}
	}

	send(outData) {
		// Send data through websocket
		// outData: object to be translated into a string for websocket transfer
		let outDataStr = JSON.stringify(outData)
		this.ws.send(outDataStr)
	}
}

module.exports = Socket
