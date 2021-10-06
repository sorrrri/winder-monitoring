const gulp = require("gulp");
const nodemon = require("gulp-nodemon");
const browserSync = require("browser-sync");
const babel = require("gulp-babel");
const scss = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const ghPages = require("gulp-gh-pages");
const nunjucks = require("gulp-nunjucks-render");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const browserify = require("gulp-browserify");
const imagemin = require("gulp-imagemin");

const PATH = {
  HTML: "./src",
  ASSETS: {
    FONTS: "./src/assets/fonts",
    STYLE: "./src/assets/scss",
    IMAGES: "./src/assets/images",
    SCRIPT: "./src/assets/js",
    LIB: "./src/assets/lib",
  },
};

const DEST_PATH = {
  HTML: "./dist",
  ASSETS: {
    FONTS: "./dist/assets/fonts",
    STYLE: "./dist/assets",
    IMAGES: "./dist/assets/images",
    SCRIPT: "./dist/assets",
    LIB: "./dist/assets/lib",
  },
};

gulp.task("library", () => {
  return gulp
    .src(PATH.ASSETS.LIB + "/*.js")
    .pipe(gulp.dest(DEST_PATH.ASSETS.LIB));
});

gulp.task("fonts", () => {
  return gulp
    .src(PATH.ASSETS.FONTS + "/*.*")
    .pipe(gulp.dest(DEST_PATH.ASSETS.FONTS));
});

gulp.task("video", () => {
  return gulp
    .src("src/assets/video" + "/**/*.*")
    .pipe(gulp.dest("dist/assets/video"))
})

gulp.task("images", () => {
  return gulp
    .src(PATH.ASSETS.IMAGES + "/**/*.*")
    .pipe(imagemin())
    .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("favicon", () => {
  return gulp
    .src("src/assets/favicon" + "/**/*.*")
    .pipe(gulp.dest("dist/assets/favicon"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("scss", () => {
  const options = {
    outputStyle: "nested",
    indentType: "space",
    indentWidth: 4,
    precision: 8,
    sourceComments: true,
  };

  return gulp
    .src("src/assets/scss" + "/**/*.*")
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(concat("main.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_PATH.ASSETS.STYLE))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("script", () => {
  return gulp
    .src(PATH.ASSETS.SCRIPT + "/*.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("main.js"))
    .pipe(browserify())
    .pipe(
      uglify({
        mangle: false,
      })
    )
    .pipe(gulp.dest(DEST_PATH.ASSETS.SCRIPT))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("html", () => {
  return gulp
    .src(PATH.HTML + "/**/*.html")
    .pipe(
      nunjucks({
        path: ["./src/templates"],
      })
    )
    .pipe(gulp.dest(DEST_PATH.HTML))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("clean", () => {
  return del(DEST_PATH.HTML);
});

gulp.task("nodemon", (cb) => {
  let started = false;
  return nodemon({
    script: "server.js",
  }).on("start", () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task(
  "browser-sync",
  gulp.series("nodemon", () => {
    browserSync.init(null, {
      proxy: "http://localhost:8005",
      port: 8006,
    });
  })
);

gulp.task("watch", () => {
  gulp.watch(PATH.HTML + "/**/*.html", gulp.series(["html"]));
  gulp.watch(PATH.ASSETS.STYLE + "/**/*.scss", gulp.series(["scss"]));
  gulp.watch(PATH.ASSETS.SCRIPT + "/**/*.js", gulp.series(["script"]));
  gulp.watch(PATH.ASSETS.SCRIPT + "/**/*.*", gulp.series(["images"]));
  gulp.watch(PATH.ASSETS.SCRIPT + "/**/*.*", gulp.series(["video"]));
});

gulp.task("deploy", () => {
  return gulp.src("./dist/**/*").pipe(ghPages());
});

const series = gulp.series([
  "clean",
  "favicon",
  "library",
  "video",
  "images",
  "scss",
  "fonts",
  "script",
  "html",
  gulp.parallel("browser-sync", "watch"),
]);

gulp.task("default", series);
