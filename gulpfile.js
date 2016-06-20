var gulp = require('gulp');
var del = require('del');
var es = require('event-stream');
var bower_files = require('main-bower-files');
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var plugins = require('gulp-load-plugins')();
var argv = require('yargs').argv;

// == PATH STRINGS ========
var src = {
  components:['bower.json'],
  scripts: ['./src/scripts/**/*.js'],
  scss: ['./src/sass/**/*.scss'],
  img: ['./src/images/**/*'],
  index: ['./src/*.html']
};

var dist = {
  components: 'dist/libs/',
  scripts: 'dist/scripts/',
  css: 'dist/styles/',
  img: 'dist/images/',
  index: 'dist/'
};

var filter = {
  js: plugins.filter('*.js'),
  scss: plugins.filter('*.css'),
  css: plugins.filter('*.css'),
  fonts: plugins.filter(['*.eot', '*.woff', '*.svg', '*.ttf'])
};

var libraries = [
  './bower_components/jquery/dist/jquery.min.js',
  './bower_components/jquery/dist/jquery.min.js.map',
  './bower_components/jquery.steps/build/jquery.steps.min.js',
  './bower_components/jquery.steps/demo/css/jquery.steps.css'
];


// == Tasks ========

// Clean task
gulp.task('clean', function(callback){
  del(['dist'], callback);
});

// Lint Task
gulp.task('lint', function() {
  return gulp.src(src.scripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});

gulp.task('libs', function(){
  return gulp.src(libraries)
    // .pipe(filter.js)
    .pipe(gulp.dest(dist.components));
    // .pipe(filter.js.restore())
    // .pipe(filter.css)
    // .pipe(gulp.dest(dist.components))
    // .pipe(filter.js.restore())
});

// Compile Sass
gulp.task('sass', function(){
  return gulp.src(src.scss)
    .pipe(plugins.sass())
    .on('error', plugins.util.log)
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(dist.css));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src(src.scripts)
    .pipe(plugins.concat('main.js'))
    .pipe(gulp.dest(dist.scripts));
});

gulp.task('images', function() {
  return gulp.src(src.img)
    .pipe(plugins.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dist.img));
});

gulp.task('index', function(){
  return gulp.src(src.index)
    // Inject application js and css
    .pipe(plugins.inject(
      gulp.src(dist.css + '*.css', {read: false}),{
        ignorePath: 'dist/',
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<link inline rel="stylesheet" href="' + filePath + '"/>'
        }
      }))
    .pipe(plugins.inject(
      gulp.src(dist.scripts + '*.js', {read: false}), {
        ignorePath: 'dist/',
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<script inline src="' + filePath + '"></script>';
        }
      }))
    // Inject vendor js and css
    .pipe(plugins.inject(
      gulp.src(dist.components + '*.css', {read: false}), {
        name: 'bower',
        ignorePath: 'dist/',
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<link inline rel="stylesheet" href="' + filePath + '"/>'
        }
      }))
    .pipe(plugins.inject(
      gulp.src(dist.components + '*.js', {read: false}), {
        name: 'bower',
        ignorePath: 'dist/',
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<script inline src="' + filePath + '"></script>';
        }
      }))
    // Convert to inline css and scripts (This step is very slow!!)
    .pipe(plugins.if(argv.inline, plugins.inlineSource({rootpath: dist.index})))
    .pipe(gulp.dest(dist.index));
});

// Build Task
gulp.task('build',function(callback){
  runSequence('clean', [ 'libs', 'lint', 'sass', 'scripts', 'images'], 'index', callback);
});

// Serve Task
gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist/'
    }
  });

  gulp.watch(src.scripts, ['lint','scripts']);
  gulp.watch(src.scss, ['sass']);
  gulp.watch(src.index,['index']);

  gulp.watch('dist/**/*').on("change", browserSync.reload);

});

// Default Task
gulp.task('default', ['serve']);
