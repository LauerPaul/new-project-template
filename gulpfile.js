var gulp = require('gulp'),
    watch = require("gulp-watch"),
    if_ = require('gulp-if'),

    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    gzip= require('gulp-gzip'),

    concat = require('gulp-concat'),
    order = require('gulp-order'),
    rename = require('gulp-rename'),

    include = require("gulp-include"),
    data = require('gulp-data'),
    fs = require('fs'),

    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),

    pug = require('gulp-pug'),
    gulpPugBeautify = require('gulp-pug-beautify'),

    uglify = require('gulp-uglify'),

    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),

    cnf = JSON.parse(fs.readFileSync('./config.json'));


/**
 * [Tasks]
*/

/** default task */
gulp.task('default',
    [   
        'browser-sync',
        'scss',
        'pug', 
        'scripts',
        'scripts_libs',
        'images',
        'fonts',
        'awesome'
    ],
function () {
    if(cnf.prop.css.min){
        gulp.watch(cnf.path.app + cnf.path.watch.scss, ['scss_min']);
    } else {
        gulp.watch(cnf.path.app + cnf.path.watch.scss, ['scss']);
    }
    gulp.watch(cnf.path.app + cnf.path.watch.pug, ['pug']);
    if(cnf.prop.js.min){
        gulp.watch(cnf.path.app + cnf.path.watch.js, ['scripts_min']);
    } else {
        gulp.watch(cnf.path.app + cnf.path.watch.js, ['scripts']);
    }
    gulp.watch(cnf.path.app + cnf.path.watch.images, ['images']);
    gulp.watch(cnf.path.app + cnf.path.watch.font, ['fonts']);
    console.log("watch task init success...");
});

/** _init_ task */
gulp.task('_init_', ['default'], function () {
    console.log("task init success...");
});

/** public task */
gulp.task('public',
    [
        'scss',
        'scss_gzip',
        'scss_source',
        'pug', 
        'scripts',
        'scripts_libs',
        'js_source',
        'js_source_libs',
        'images',
        'awesome',
        'fonts'
    ],
function () {
    console.log("public task init success...");
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: cnf.path.dst
        },
        notify: false
    });
});

/**
 * [Task scss]
*/

/** SCSS */
gulp.task('scss', ['scss_min'], function () {
    return gulp.src(cnf.path.app + cnf.path.css.in)
                .pipe(plumber())
                .pipe(if_(cnf.prop.css.sourcemap, sourcemaps.init()))
                    .pipe(sass({
                        outputStyle: 'nested',
                        precison: 3,
                        errLogToConsole: true
                    }).on('error', sass.logError))
                    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
                    .pipe(if_(cnf.prop.css.concat, concat('styles.сss').on('error', console.log)))
                .pipe(if_(cnf.prop.css.sourcemap, sourcemaps.write(cnf.path.css.sourcemap)))
                .pipe(gulp.dest(cnf.path.dst + cnf.path.css.out))
                .pipe(if_(!cnf.prop.css.min, browserSync.reload({stream: true})));
});

/** SCSS min */
gulp.task('scss_min', function () {
    if(cnf.prop.css.min){
        return gulp.src(cnf.path.app + cnf.path.css.in)
                    .pipe(plumber())
                    .pipe(if_(cnf.prop.css.sourcemap, sourcemaps.init()))
                        .pipe(sass({
                            outputStyle: 'compressed',
                            precison: 3,
                            errLogToConsole: true
                        }).on('error', sass.logError))
                        .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
                        .pipe(if_(cnf.prop.css.concat, concat('styles.min.сss').on('error', console.log)))
                    .pipe(if_(cnf.prop.css.sourcemap, sourcemaps.write(cnf.path.css.sourcemap)))
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.css.out))
                    .pipe(browserSync.reload({stream: true}));
    }
});

/** SCSS copy source */
gulp.task('scss_source', function () {
    if(cnf.prop.css.scss_source_copy){
        return gulp.src(cnf.path.app + cnf.path.css.scss_source_in)
                    .pipe(plumber())
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.css.scss_source_copy).on('error', console.log));
    }
});

/** SCSS min gzip */
gulp.task('scss_min_gzip', function () {
    if(cnf.prop.css.gzip){
        return gulp.src(cnf.path.app + cnf.path.css.in)
                    .pipe(plumber())
                        .pipe(sass({
                            outputStyle: 'compressed',
                            precison: 3,
                            errLogToConsole: true
                        }).on('error', sass.logError))
                        .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
                    .pipe(if_(cnf.prop.css.concat, concat('styles.min.сss').on('error', console.log)))
                    .pipe(gzip().on('error', console.log))
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.css.gzip).on('error', console.log));
    }
});
/** SCSS gzip */
gulp.task('scss_gzip', ['scss_min_gzip'], function () {
    if(cnf.prop.css.gzip){
        return gulp.src(cnf.path.app + cnf.path.css.in)
                    .pipe(plumber())
                        .pipe(sass({
                            outputStyle: 'nested',
                            precison: 3,
                            errLogToConsole: true
                        }).on('error', sass.logError))
                        .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
                    .pipe(if_(cnf.prop.css.concat, concat('styles.сss').on('error', console.log)))
                    .pipe(gzip().on('error', console.log))
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.css.gzip).on('error', console.log));
    }
});


/**
 * [Task pug]
*/

/** PUG */
gulp.task('pug', function () {
    return gulp.src(cnf.path.app + cnf.path.pug.in)
                .pipe(plumber())
                    .pipe(if_(cnf.prop.pug.dataJson,
                            data(function(file) {
                            return JSON.parse(
                                fs.readFileSync(cnf.path.pug.json)
                            );
                    }).on('error', console.log)))
                .pipe(gulpPugBeautify({omit_empty: true}).on('error', console.log))
                .pipe(pug({pretty: true}).on('error', console.log))
                .pipe(gulp.dest(cnf.path.dst + cnf.path.pug.out))
                .pipe(browserSync.reload({stream: true}));
});


/**
 * [Scripts JS]
*/

/** Scripts JS */
gulp.task("scripts", ['scripts_min'], function() {
    return gulp.src(cnf.path.app + cnf.path.js.in)
                .pipe(plumber())
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.init()))
                    .pipe(if_(cnf.prop.js.concat, concat('script.js').on('error', console.log)))
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.write(cnf.path.js.sourcemap)))
                .pipe(gulp.dest(cnf.path.dst + cnf.path.js.out))
                .pipe(if_(!cnf.prop.js.min, browserSync.reload({stream: true})));
});

/** Scripts min JS */
gulp.task("scripts_min", function() {
    return gulp.src(cnf.path.app + cnf.path.js.in)
                .pipe(plumber())
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.init()))
                    .pipe(if_(cnf.prop.js.concat, concat('script.min.js').on('error', console.log)))
                    .pipe(uglify({'ie8':true}).on('error', console.log))
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.write(cnf.path.js.sourcemap)))
                .pipe(gulp.dest(cnf.path.dst + cnf.path.js.out))
                .pipe(browserSync.reload({stream: true}));
});

/** JS libs */
gulp.task("scripts_libs", function() {
    var obj = cnf.path.app + cnf.path.js.libs,
        arr = obj.split(',');

    return gulp.src(arr)
                .pipe(plumber())
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.init()))
                    .pipe(concat('libs.js'))
                    .pipe(uglify())
                    .pipe(rename('libs.min.js'))
                .pipe(if_(cnf.prop.js.sourcemap, sourcemaps.write(cnf.path.js.sourcemap)))
                .pipe(gulp.dest(cnf.path.dst + cnf.path.js.out).on('error', console.log));
});

/** JS libs source*/
gulp.task("js_source_libs", function() {
    var obj = cnf.path.app + cnf.path.js.libs,
        arr = obj.split(',');

    if(cnf.prop.js.source_copy){
        return gulp.src(arr)
                    .pipe(plumber())
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.js.js_source_copy + 'libs/').on('error', console.log));
    }
});

/** JS copy source */
gulp.task('js_source', function () {
    if(cnf.prop.js.source_copy){
        return gulp.src(cnf.path.app + cnf.path.js.js_source_in)
                    .pipe(plumber())
                    .pipe(gulp.dest(cnf.path.dst + cnf.path.js.js_source_copy).on('error', console.log));
    }
});


/**
 * [Task images]
*/

/** Images */
gulp.task('images', function () {
    gulp.src(cnf.path.app + cnf.path.images.in)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(cnf.path.dst + cnf.path.images.out))
        .pipe(browserSync.reload({stream: true}));
});


/**
 * [Task fonts]
*/

/** fonts */
gulp.task('fonts', function() {
    gulp.src(cnf.path.app + cnf.path.fonts.in)
        .pipe(gulp.dest(cnf.path.dst + cnf.path.fonts.out));
});

gulp.task('awesome', function() {
    if(cnf.prop.fonts.awesome){
        gulp.src(cnf.path.app + cnf.path.fonts.awesome)
            .pipe(gulp.dest(cnf.path.dst + cnf.path.fonts.out + 'awesome/'));
    }
});