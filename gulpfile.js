import gulp from 'gulp'
import del from 'del'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import concat from 'gulp-concat'
import imagemin from 'gulp-imagemin'
import replace from 'gulp-replace'
import terser from 'gulp-terser'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

gulp.task('clean', function () {
  return del('public/dist/*')
})

gulp.task('html', function () {
  return gulp
    .src(['src/components/features/tibia-map/index.html'])
    .pipe(replace(/\.\.\/dist\//g, ''))
    .pipe(gulp.dest('public/dist/'))
})

gulp.task('css', function () {
  return gulp
    .src([
      require.resolve('leaflet/dist/leaflet.css'),
      'src/components/features/tibia-map/_css/leaflet.coordinates.css',
      'src/components/features/tibia-map/_css/leaflet.buttons.css',
      'src/components/features/tibia-map/_css/map.css',
    ])
    .pipe(concat('map.css'))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('public/dist/'))
})

gulp.task('js', function () {
  return gulp
    .src([
      require.resolve('leaflet'),
      'src/components/features/tibia-map/_js/leaflet.coordinates.js',
      'src/components/features/tibia-map/_js/leaflet.crosshairs.js',
      'src/components/features/tibia-map/_js/leaflet.levelbuttons.js',
      'src/components/features/tibia-map/_js/leaflet.exivabutton.js',
      'src/components/features/tibia-map/_js/map.js',
    ])
    .pipe(concat('map.js'))
    .pipe(terser())
    .pipe(gulp.dest('public/dist/'))
})

gulp.task('images', function () {
  return gulp
    .src(['src/components/features/tibia-map/_css/*.png', 'src/components/features/tibia-map/_img/*.png'])
    .pipe(
      imagemin({
        optimizationLevel: 7,
      }),
    )
    .pipe(gulp.dest('public/dist/_img'))
})

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'images')))
gulp.task('default', gulp.series('build'))
