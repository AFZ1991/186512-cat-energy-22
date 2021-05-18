const gulp = require("gulp");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const svgstore = require("gulp-svgstore");
const svgmin = require('gulp-svgmin');
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const webp = require("gulp-webp");
const del = require("del");
const newer = require('gulp-newer');
const terser = require("gulp-terser");


// Styles

const styles = (done) => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
  done();
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

//Scripts

const scripts = (done) => {
  return gulp.src("source/js/script.js")
    .pipe(gulp.dest('build/js'))
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
  done();
}

exports.scripts = scripts;

// Images

const optimizeImages = () => {
  return gulp.src(["source/img/**/*.{png,jpg,svg,ico}", "!source/img/sprite/*.svg"])
    .pipe(newer("build/img"))
    .pipe(imagemin([
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest("build/img"));
}

exports.optimizeImages = optimizeImages;

const copyImages = () => {
  return gulp.src(["source/img/**/*.{png,jpg,svg,ico}", "!source/img/sprite/*.svg"])
    .pipe(gulp.dest("build/img"));
}

exports.copyImages = copyImages;

//SVG Sprite

const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
}

exports.sprite = sprite;

//Webp Images

const createWebp = (done) => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({
      quality: 50
    }))
    .pipe(gulp.dest("build/img"));
  done();
}

exports.createWebp = createWebp;

// Copy

const copy = (done) => {
  gulp.src([
      "source/fonts/*.{woff2,woff}",
      "source/*.ico",
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/script.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

// Build

const build = gulp.series(
  clean,
  sprite,
  optimizeImages,
  gulp.parallel(
    copy,
    styles,
    html,
    scripts,
    createWebp
  )
);

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  sprite,
  copyImages,
  gulp.parallel(
    copy,
    styles,
    html,
    scripts,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
