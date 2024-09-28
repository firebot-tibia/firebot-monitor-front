const del = require('del');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const terser = require('gulp-terser');

gulp.task('clean', function() {
  return del('public/dist/*');
});

gulp.task('html', function() {
  return gulp.src([
    'src/components/global/maps/index.html',
  ])
    .pipe(replace(/\.\.\/dist\//g, ''))
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('css', function() {
  return gulp.src([
    require.resolve('leaflet/dist/leaflet.css'),
    'src/components/global/maps/_css/leaflet.coordinates.css',
    'src/components/global/maps/_css/leaflet.buttons.css',
    'src/components/global/maps/_css/map.css'
  ])
    .pipe(concat('map.css'))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('js', function() {
  return gulp.src([
    require.resolve('leaflet'),
    'src/components/global/maps/_js/leaflet.coordinates.js',
    'src/components/global/maps/_js/leaflet.crosshairs.js',
    'src/components/global/maps/_js/leaflet.levelbuttons.js',
    'src/components/global/maps/_js/leaflet.exivabutton.js',
    'src/components/global/maps/_js/map.js',
  ])
    .pipe(concat('map.js'))
    .pipe(terser())
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('images', function() {
  return gulp.src([
    'src/components/global/maps/_css/*.png',
    'src/components/global/maps/_img/*.png'
  ])
    .pipe(imagemin({
      optimizationLevel: 7
    }))
    .pipe(gulp.dest('public/dist/_img'));
});

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'images')));

gulp.task('default', gulp.series('build'));
