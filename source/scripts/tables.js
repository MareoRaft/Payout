/* In the UI, there are multiple tables that get populated with transactions.  This includes the 'queue' table, the 'success' table, and the 'history' table.  The purpose of this module is to bind the javascript transaction data to the html tables. */

////////////////// IMPORTS //////////////////
const $ = require('jquery')
const _ = require('lodash')
const d3 = require('d3')
const is = require('check-types')

const {STRING} = require('./locale.js')

////////////////// GLOBALS //////////////////
const COLUMNS = _.map(
	['to-address', 'amount', 'status', 'info', 'time'],
	key => STRING['table'][key]
)

/////////////////// MAIN ///////////////////
function generateTxId(tx) {
	// given a transaction object tx, return it's identifier
	return `${tx['to_address']}--${tx['amount']}--${tx['status']}--${tx['info']}`
}

function updateEmpty(table_id, tx_queue) {
	let $table = $('#' + table_id)
	let $placeholder = $('#' + table_id + '-empty')
	// detect if a table is empty.  If it is, hide it and show an image instead
	is.assert.array(tx_queue)
	if (is.nonEmptyArray(tx_queue)) {
		// table is not empty
		$placeholder.hide()
		$table.show()
	} else {
		// table is empty
		$table.hide()
		$placeholder.show()
	}
}

function update(table_id, tx_queue) {
	is.assert.assigned(table_id)
	is.assert.assigned(tx_queue)
	let rows = d3.select('#' + table_id).select('tbody').selectAll('tr')
	// what to bind, and uniqueness
	let bound_rows = rows.data(tx_queue, generateTxId)
	// how to enter a new row
	let new_row = bound_rows.enter()
		.append('tr')
		.classed('tx', true)
	new_row
		.append('td')
		.classed('to-address', true)
		.text(tx => tx['to-address'])
	new_row
		.append('td')
		.classed('amount', true)
		.text(tx => tx['amount'])
	new_row
		.append('td')
		.classed('status', true)
		.text(tx => tx['status'])
	new_row
		.append('td')
		.classed('info', true)
		.text(tx => tx['info'])
	new_row
		.append('td')
		.classed('time', true)
		.text(tx => tx['time'])
	// how to remove a row
	bound_rows.exit().remove()
	// finally, if the table is empty, show an image instead
	updateEmpty(table_id, tx_queue)
}

function updateMany(list) {
	is.assert.array(list)
	for (let [table_id, tx_queue] of list) {
		update(table_id, tx_queue)
	}
}

function initHeader(table_id){
	let thead = d3.select('#' + table_id).select('thead')
	// populate the header
	let header_row = thead.append('tr')
	let header_cells = header_row.selectAll('th')
	// enter data into header
	let bound_header_cells = header_cells.data(COLUMNS)
	bound_header_cells.enter()
		.append('th')
		.text(function(col){ return col })
}

function init(table_id, tx_queue) {
	// get handles
	let table = d3.select('#' + table_id)
	table.append('thead')
	table.append('tbody')
	initHeader(table_id)
	update(table_id, tx_queue)
}

function initMany(lists) {
	for (let lis of lists) {
		let table_id = lis[0]
		let tx_queue = lis[1]
		init(table_id, tx_queue)
	}
}

////////////////// EXPORTS //////////////////
module.exports = {init, initMany, update, updateMany}

