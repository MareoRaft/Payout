/* In the UI, there are multiple tables that get populated with transactions.  This includes the 'queue' table, the 'success' table, and the 'history' table.  The purpose of this module is to bind the javascript transaction data to the html tables. */

////////////////// IMPORTS //////////////////
const d3 = require('d3')

////////////////// EXPORTS //////////////////
module.exports = {
	init,
	update,
}

////////////////// GLOBALS //////////////////
const COLUMNS = ['to address', 'amount', 'status']

/////////////////// MAIN ///////////////////
function generateTxId(tx) {
	// given a transaction object tx, return it's identifier
	return `${tx['to_address']}---${tx['amount']}`
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

function init(table_id) {
	console.log('initting data binding')
	// get handles
	let table = d3.select('#' + table_id)
	table.append('thead')
	table.append('tbody')
	initHeader(table_id)
}

function update(table_id, tx_queue) {
	console.log('updating')
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
		.text('not sent')
	// how to remove a row
	bound_rows.exit().remove()
}
