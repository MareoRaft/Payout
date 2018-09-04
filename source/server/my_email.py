import smtplib
import logging
import logging.handlers
from email.message import EmailMessage

# see http://mynthon.net/howto/-/python/python%20-%20logging.SMTPHandler-how-to-use-gmail-smtp-server.txt
class TlsSMTPHandler(logging.handlers.SMTPHandler):
	def emit(self, email_message):
		smtp = smtplib.SMTP(self.mailhost, self.mailport)
		# the following three lines are for TLS support
		smtp.ehlo()
		smtp.starttls()
		smtp.ehlo()
		smtp.login(self.username, self.password)
		# send the message
		smtp.send_message(email_message)
		smtp.quit()

def send(to_address, message):
	# setup
	from_address = 'mvlancellotti@gmail.com'
	password = open('password.txt').read().strip()
	# prepare message
	email_message = EmailMessage()
	email_message['Subject'] = 'Your new Payout license.'
	email_message['From'] = from_address
	email_message['To'] = to_address
	email_message.set_content(message)
	# send
	h = TlsSMTPHandler(
		('smtp.gmail.com', 587),
		'bugs@ambiafund.com',
		['admin@ambiafund.com'],
		'Error found!',
		(from_address, password)
	)
	h.emit(email_message)

