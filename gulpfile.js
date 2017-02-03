var gulp = require('gulp');
var shell = require('gulp-shell');
var argv = require('yargs')
	.option('t', {
		alias: 'tag',
		demand: false,
		type: 'string'
	})
	.argv;
var runSequence = require('run-sequence');
var chug = require('gulp-chug');

// --tag vX.X.X
gulp.task('minifiedRelease', cb => {
	runSequence(
			'update-submodule',
			'clean',
			'npm-install',
			'cesium-minifyRelease',
			'move',
			'stage-all',
			'commit-minified',
			'push',
			'tag-minified',
			'push-tags',
			cb
		);
});

// --tag vX.X.X
gulp.task('release', cb => {
	runSequence(
			'update-submodule',
			'clean',
			'npm-install',
			'cesium-release',
			'move',
			'stage-all',
			'commit',
			'push',
			'tag',
			'push-tags',
			cb
		);
});

// general
gulp.task('update-submodule', shell.task(['echo Updating cesium with tag ' + argv.tag + '; cd cesium; git checkout tags/' + argv.tag]));
gulp.task('clean', shell.task(['rm -rf cesium/Build; rm -rf dist']));
gulp.task('npm-install', shell.task(['npm install']));
gulp.task('move', shell.task(['mv -v cesium/Build dist/']));
gulp.task('stage-all', shell.task(['git add -A']));
gulp.task('push', shell.task(['git push origin master']));
gulp.task('push-tags', shell.task(['git push --tags']));

// min
gulp.task('cesium-minifyRelease', function (cb) {
	return gulp.src('cesium/gulpfile.js')
		.pipe(chug({tasks:['minifyRelease']}));
});
gulp.task('commit-minified', shell.task(['git commit -m "Updating to support Cesium version ' + argv.tag + '."']));
gulp.task('tag-minified', shell.task(['git tag ' + argv.tag]));

// un-min
gulp.task('cesium-release', function (cb) {
	return gulp.src('cesium/gulpfile.js')
		.pipe(chug({tasks:['release']}));
});
gulp.task('commit', shell.task(['git commit -m "Updating to support Cesium version ' + argv.tag + ' (un-minified)."']));
gulp.task('tag', shell.task(['git tag ' + argv.tag + '-dev']));
