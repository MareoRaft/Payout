// extend the Date object MORE than Date.js does

let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
Date.prototype.getWeekdayName = function() {
    return weekdays[ this.getDay() ]
}
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
Date.prototype.getMonthName = function() {
    return months[ this.getMonth() ]
}
