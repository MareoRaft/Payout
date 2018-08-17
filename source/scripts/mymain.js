//This is a TEMPLATE (notice the "{{privacy}}" variable drop-in).
// once we finish writing in python, we will then translate that to JS, so that a new request to the server won't need to be made every time the user wants to view more info on the calendar.
// Define websocket to be used for server interaction
let $ = require('./lib/jquery.js')
let is = require('./lib/check-types.js')
require('./lib/date.js')
require('./date_extend.js')
let Socket = require('./socket.js')

//////////////////// GLOBALS ////////////////////
let socket = undefined
let HOUR_HEIGHT = 54
let PRIVACY = false
let SHOW_WEATHER_TEXT = true
let dayshift = 0
let forecasts = []
let events = []
let NUM_DAYS_TO_SHIFT = 1
let forecast_text_to_colors = {
	'Cloudy': ['#888888', '#121212'],
	'Partly Cloudy': ['#99AACC', '#041C3A'],
	'Mostly Cloudy': ['#AAAAAA', '#202020'],
	'Scattered Showers': ['#2277CC', '#000520'],
	'Rain': ['#0055AA', '#000520'],
	'Sunny': ['#FFFF44', '#343401'],
	'Mostly Sunny': ['#EEFF99', '#304409'],
	'Clear': ['#0080FF', '#001034'],
	'Mostly Clear': ['#0080D0', '#001028'],
	'Thunderstorms': ['#444400', '#010100'],
	'Scattered Thunderstorms': ['#666644', 'black'],
}


///////////////// DRAW FUNCTIONS /////////////////
// all of the draw functions also ERASE/REPLACE previously things drawn
function drawMonthAndYear(dayshift=0) {
	let date = Date.today().add({ days: dayshift })
	// retrieve month and year
	let month_name = date.getMonthName()
	let year_string = '' + date.getFullYear()
	// update month and year
	$('.month').html(month_name + ' ')
	$('.year').html(year_string)
}

function getWeekdatesToDraw(dayshift=0) {
	let weekdates = []
	for (let daychange = 0; daychange < 7; daychange++) {
		// we are using Date.js (www.datejs.com) to shift the day
		let date = Date.today().add({ days: dayshift + daychange })
		weekdates.push(date)
	}
	return weekdates
}

function drawWeekday(datetime, slot_num) {
	// slot_num is the number of the column where to draw the weekday and daynumber in month
	let weekday = datetime.getWeekdayName()
	let weekday_short = weekday.slice(0, 3)
	let day_num = datetime.getDate().toString()
	// put the info in the slot
	let weekday_id = "weekday-header-" + slot_num + " " + ".weekday"
	let $weekday = $('#' + weekday_id)
	$weekday.html(weekday_short)
	let day_num_id = "weekday-header-" + slot_num + " " + ".day-num"
	let $day_num = $('#' + day_num_id)
	$day_num.html(day_num)
	// iff the day is today, classify the day number as "today-num"
	if (datetime.equals(Date.today())) {
		if (day_num.length === 1) {
			// our way of making the 'skinny' numbers still have a round background circle
			$day_num.html('<font color="red">.</font>' + day_num + '<font color="red">.</font>')
		}
		$day_num.addClass("today-num")
	} else {
		$day_num.removeClass("today-num")
	}
}

function drawWeekdays(dayshift=0) {
	let weekdates_to_draw = getWeekdatesToDraw(dayshift)
	for (let index in weekdates_to_draw) {
		let date = weekdates_to_draw[index]
		drawWeekday(date, index)
	}
}

function drawForecastInColumn(f, column_index) {
	let top = 0 * HOUR_HEIGHT
	let height = 24 * HOUR_HEIGHT
	let text = SHOW_WEATHER_TEXT? f['text']: ''
	let background_color = 'black'
	let color = 'white'
	if (f['text'] in forecast_text_to_colors) {
		background_color = forecast_text_to_colors[f['text']][0]
		color = forecast_text_to_colors[f['text']][1]
	} else {
		alert('Missing weather swatch.  Please report this error to Matt.')
	}
	// add to HTML
	let insertion_id = 'weekday-' + column_index
	let $f = $('<div/>', {class: 'event', text: text})
	$('#' + insertion_id).append($f)
	$f.css({
		'top': '' + top + 'px',
		'height': '' + height + 'px',
		'background-color': background_color,
		'color': color,
		'opacity': '0.24',
	})
}

function drawEventInColumn(event, column_index) {
	let top = event['start_hour_decimal'] * HOUR_HEIGHT
	let height = event['hour_duration'] * HOUR_HEIGHT
	let text = PRIVACY? 'busy': event['text']
	// add to HTML
	let insertion_id = 'weekday-' + column_index
	let $event = $('<div/>', {class: 'event', text: text})
	$('#' + insertion_id).append($event)
	$event.css({
		'top': '' + top + 'px',
		'height': '' + height + 'px',
	})
}

function drawBlock(block, dayshift) {
	// verify that block falls in the correct timeframe!
	let weekdates_to_draw = getWeekdatesToDraw(dayshift)
	let block_date = Date.parse(block['date'])
	// IF the events are in order, THEN we can do this MORE EFFICIENTLY than we are doing it now:
	for (let column_index in weekdates_to_draw) {
		let weekdate = weekdates_to_draw[column_index]
		if (weekdate.equals(block_date)) {
			if (block['class'] === 'calendar-event') {
				drawEventInColumn(block, column_index)
			}
			else if (block['class'] === 'forecast') {
				drawForecastInColumn(block, column_index)
			}
			else {
				alert('Bad block.')
			}
			break
		}
	}
}

function drawBlocks(blocks, dayshift=0) {
	// erase events already on calendar
	$('.content-of-weekday').html('')
	// draw each event on the calendar
	for (block of blocks) {
		drawBlock(block, dayshift)
	}
}

function drawStatus(events, datetime_updated_string) {
	if (events.length > 0 && is.not.null(datetime_updated_string)) {
		// make status message
		let datetime_updated = Date.parse(datetime_updated_string)
		//{shortDate:"M/d/yyyy",longDate:"dddd, MMMM dd, yyyy",shortTime:"h:mm tt",longTime:"h:mm:ss tt",fullDateTime:"dddd, MMMM dd, yyyy h:mm:ss tt",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"MMMM dd",yearMonth:"MMMM, yyyy"}
		let friendly_string = datetime_updated.toString("MMMM d, h:mm tt")
		let status_message = 'Last updated ' + friendly_string
		// update status icon
		$status_message = $('.status-message')
		$status_message.css({
			'border-color': 'green',
			'background-color': 'green',
		})
		$status_message.html(status_message)
	}
}

function drawCalendar(events, dayshift=0, updated_string=null) {
	drawMonthAndYear(dayshift)
	drawWeekdays(dayshift)
	let blocks = events.concat(forecasts)
	drawBlocks(blocks, dayshift)
	drawStatus(events, updated_string)
}


/////////////////// OTHER FUNCTIONS ///////////////////
function onmessage(dic) {
	// defaults/fallback values
	let datetime_updated_string = null
	// get new values
	command	= dic['command']
	if (command === 'populate-weather') {
		forecasts = dic['data']
	}
	else if (command === 'populate-events') {
		events = dic['events']
		datetime_updated_string = dic['updated']
	}
	else {
		alert('Bad command.')
	}
	// draw calendar
	drawCalendar(events, dayshift, datetime_updated_string)
}

function onshift(direction) {
	dayshift += direction * NUM_DAYS_TO_SHIFT
	drawCalendar(events, dayshift)
}

function onleftshift() {
	let direction = -1
	onshift(direction)
}

function onrightshift() {
	let direction = 1
	onshift(direction)
}

function initTriggers() {
	$('#shift-left').click(onleftshift)
	$('#shift-right').click(onrightshift)
}

function initGlobals() {
	socket = new Socket(onmessage)
}

$(document).ready(function(){
	initGlobals()
	// preliminary calendar drawing (without events)
	drawCalendar(events)
	initTriggers()
})
