#!/usr/bin/env python3
import json

from tornado.web import RequestHandler
from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.web import url
from tornado.ioloop import IOLoop
from tornado.log import enable_pretty_logging

# GLOBALS
PORT_NUMBER = 80

# MAIN
class LicenseVerificationHandler (RequestHandler):
	""" This is to render main.js, passing in config options """


	def get(self):
		machine_id = self.get_argument('id', default='', strip=True)
		license = self.get_argument('license', default='', strip=True)
		# figure out if it's valid or not
		is_valid = False
		# respond
		response_string = '{}'.format(is_valid)
		self.write(response_string)


def make_app():
	return Application(
		[
			url(r'/Payout/request-license-validation.*', LicenseVerificationHandler),
		],
		#settings
		debug = True,
	)

def server_kickoff():
	enable_pretty_logging()
	application = make_app()
	application.listen(PORT_NUMBER)
	IOLoop.current().start()

def main():
	server_kickoff()

if __name__ == "__main__":
	main()
