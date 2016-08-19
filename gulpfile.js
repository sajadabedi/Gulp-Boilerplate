const gulp       = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat     = require('gulp-concat');
const uglify     = require('gulp-uglifyjs');
const rename     = require('gulp-rename');
const cssnano    = require('gulp-cssnano');
const plumber    = require('gulp-plumber');
const svgmin     = require('gulp-svgmin');
const svgstore   = require('gulp-svgstore');
const notify     = require('gulp-notify');
const sass       = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const njRender        = require('gulp-nunjucks-render');
const nj              = njRender.nunjucks;
const browserSync     = require('browser-sync');
const reload          = browserSync.reload;

const paths = {
  dist      : 'dist',
  js        : 'src/scripts',
  distJs    : 'dist/assets/js',
  distStyles: 'dist/assets/css',
  scss       : 'src/styles',
  img       : 'dist/assets/img',
  svg       : 'src/svg',
  html      : 'src/templates'
};

const onError = notify.onError({
    message:  '<%= error.message %> :('
});

gulp.task('styles', () => {
  return gulp.src(paths.scss + '/master.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distStyles))
    .pipe(reload({stream:true}));
});


gulp.task('scripts', () => {
  return gulp.src([paths.js + '/**/!(app)*.js', paths.js + '/app.js'])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat("bundle.js"))
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest(paths.distJs))
    .pipe(reload({stream:true}));
});


gulp.task('markup', () => {
  nj.configure([paths.html + '/layout'], {watch: false});
  return gulp.src([paths.html + '/**/*.html', '!src/templates/layout/*.html'])
    .pipe(plumber({errorHandler: onError}))
    .pipe(njRender())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('svgSprite', () => {
  return gulp.src(paths.svg + '/*.svg')
    .pipe(plumber({errorHandler: onError}))
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(rename({basename: 'sprites'}))
    .pipe(gulp.dest(paths.img))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch('src/templates/**/*.html', ['markup', reload]);
  gulp.watch('src/styles/**/*.scss',     ['styles', reload]);
  gulp.watch(['src/scripts/**/*.js'],   ['scripts', reload]);
  gulp.watch(['src/svg/*.svg'],         ['svgSprite', reload]);
  gulp.watch("*.html",                  reload);
});

gulp.task('sync', function() {
  browserSync({
    ui: false,
    ghostMode: false,
    notify: false,
    // proxy: "local.dev",
    server: {
      baseDir: "./dist/"
    }
  });
});

gulp.task('default', ['markup', 'styles', 'svgSprite', 'sync', 'scripts', 'watch']);
gulp.task('build', ['markup', 'styles', 'svg', 'scripts']);
