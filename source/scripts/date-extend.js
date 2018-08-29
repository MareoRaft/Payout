/* extend the Date object MORE than Date.js does */

////////////////// IMPORTS //////////////////
require('datejs')

////////////////// GLOBALS //////////////////

/////////////////// MAIN ///////////////////
function initDateExtend() {
	let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	Date.prototype.getWeekdayName = function() {
	    return weekdays[ this.getDay() ]
	}
	let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	Date.prototype.getMonthName = function() {
	    return months[ this.getMonth() ]
	}
}

function getTimestamp() {
	// get a human friendly timestamp
	let datetime = new Date()
	let datetime_string = datetime.toString("yyyy, MMM dd, HH:mm, ss") + " sec"
	return datetime_string
}

////////////////// EXPORTS //////////////////
module.exports = {initDateExtend, getTimestamp}
