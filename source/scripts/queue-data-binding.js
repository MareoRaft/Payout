/* In the UI, there are multiple tables that get populated with transactions.  This includes the 'queue' table, the 'success' table, and the 'history' table.  The purpose of this module is to bind the javascript transaction data to the html tables. */

////////////////// IMPORTS //////////////////
const d3 = require('d3')

////////////////// EXPORTS //////////////////
module.exports = {
	init,
	update,
}

////////////////// GLOBALS //////////////////
const COLUMNS = ['to address', 'amount']
let table, thead, tbody

/////////////////// MAIN ///////////////////
function generateTxId(tx) {
	// given a transaction object tx, return it's identifier
	return `${tx['to_address']}---${tx['amount']}`
}

function init() {
	console.log('initting data binding')
	table = d3.select('#queue-table')
	thead = table.append('thead')
	tbody = table.append('tbody')
	// populate the header
	let header_row = thead.append('tr')
	let header_cells = header_row.selectAll('th')
	// enter data
	let bound_header_cells = header_cells.data(COLUMNS)
	bound_header_cells.enter()
		.append('th')
		.text(function(col){ return col })
}

function update(tx_queue) {
	console.log('updating')
	let rows = tbody.selectAll('tr')
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
			.text('2')
	// how to remove a row
	bound_rows.exit().remove()
}
