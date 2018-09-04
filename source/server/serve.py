#!/usr/bin/env python3
import json

from tornado.web import RequestHandler
from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.web import url
from tornado.ioloop import IOLoop
from tornado.log import enable_pretty_logging

import my_email

# GLOBALS
PORT_NUMBER = 80

# MAIN
class NewLicenseHandler (RequestHandler):
	""" Creates a new license, and responds with it as well as emailing the user """


	def get(self):
		print('getting a new license')
		machine_id = self.get_argument('id', default='', strip=True)
		# email_address = self.get_argument('email', default='', strip=True)
		email_address = 'mvlancellotti@icloud.com'
		# create the license
		license = 'newlicense'
		# email the license
		my_email.send(email_address, 'Your new Payout license is:\n\n{}\n\n!  Save this for your records in case you ever need to transfer the license to a new/different computer.'.format(license))
		# respond
		response_string = '{}'.format(license)
		self.write(response_string)


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
			url(r'/Payout/request-new-license.*', NewLicenseHandler),
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
