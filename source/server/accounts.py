import random

import pymongo

from mongo import Mongo

## Create global db object
db = Mongo('payout', 'accounts')


def generate_license():
	""" generate a new license using machine id as a random seed """
	# note: 9 digits is plenty, and rand doesn't seem to need a random seed.  it must use the system clock or something
	num = random.randint(1, 10**9)
	license = 'LIC{}'.format(num)
	return license

def is_valid(machine_id, license):
	""" see if `license` is indeed the correct license for the machine """
	find_dic = {
		'_id': machine_id,
	}
	account = db.find_one(find_dic)
	return license == account['license']

def save(machine_id, license, email_address):
	""" store the info in a dictionary in the database, for future reference """
	# the machine id also operates as the id of the dictionary
	dic = {
		'_id': machine_id,
		'license': license,
		'email': email_address,
	}
	try:
		db.insert_one(dic)
	except(pymongo.errors.DuplicateKeyError):
		raise Exception('That machine already has a license.')

