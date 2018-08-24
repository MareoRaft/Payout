/*
More info: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
syncronous running: http://stackoverflow.com/questions/26715230/gulp-callback-how-to-tell-gulp-to-run-a-task-first-before-another/26715351
*/
/////////////////// IMPORTS ///////////////////
const gulp = require('gulp')

const compass = require('gulp-for-compass')
const autoprefixer = require('gulp-autoprefixer')
// const exec = require('child_process').exec


/////////////////// GLOBALS ///////////////////
const src_assets = 'source/assets'
const src_assets_targeted = src_assets + '/**/*'
const bld_assets = 'build/assets'
const src_scss = 'source/stylesheets'
const src_scss_targeted = src_scss + '/**/*.scss'
const bld_scss = 'build/stylesheets'
const src_js = 'source/scripts'
const src_js_targeted = [src_js + '/**/*.js', 'source/index.js']
const bld_js = 'build/scripts'
const src_html_targeted = 'source/**/*.html'
const src_img = 'source/images/**/*'
const bld_img = 'build/images'

const log_standard = function(event) {
	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
}


///////////////////// MAIN /////////////////////
gulp.task('css', function() {
	gulp.src(src_scss_targeted)
		.pipe(compass({
			sassDir: src_scss,
			cssDir: bld_scss,
			force: true,
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 Chrome versions'], // see https://github.com/browserslist/browserslist#queries
			cascade: false,
		}))
		.pipe(gulp.dest(bld_scss))
})

gulp.task('js', function() {
	gulp.src(src_js_targeted)
		.pipe(gulp.dest(bld_js))
	gulp.src('source/index.js')
		.pipe(gulp.dest('build'))
})

gulp.task('html', function() {
	gulp.src('source/index.html')
		.pipe(gulp.dest('build'))
})

gulp.task('img', function() {
	gulp.src(src_img)
		.pipe(gulp.dest(bld_img))
})

gulp.task('assets', function() {
	gulp.src(src_assets_targeted)
		.pipe(gulp.dest(bld_assets))
})



gulp.task('watch', function() {
	// css watcher
	var watch_css = gulp.watch(src_scss_targeted, ['css'])
	watch_css.on('change', log_standard)
	// js watcher
	var watch_js = gulp.watch(src_js_targeted, ['js'])
	watch_js.on('change', log_standard)
	// html watcher
	var watch_html = gulp.watch(src_html_targeted, ['html'])
	watch_html.on('change', log_standard)
	// image watcher
	var watch_img = gulp.watch(src_img, ['img'])
	watch_img.on('change', log_standard)
	// assets watcher
	var watch_assets = gulp.watch(src_assets_targeted, ['assets'])
	watch_assets.on('change', log_standard)
})

gulp.task('default', ['js', 'html', 'css', 'img', 'assets', 'watch'])
