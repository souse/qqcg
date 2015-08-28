var fs = require('fs'),
    gulp = require("gulp"),
    autoprefixer = require('gulp-autoprefixer'),
    //压缩css文件
    minifycss = require("gulp-minify-css"),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

    var serverPath = './src/',//服务器资源路径
    staticDir = 'src/static/',//静态资源根目录
    // staticDir = 'src/hbec-trade-h5/',//静态资源根目录
    lessFiles = staticDir + '**/*.less',//less文件路径
    cssFiles = staticDir + "**/*.css";//css文件路径
//定制路径
var hbecJS = [
    "src/hbec/h5/scripts/pwd.js",
    "src/hbec/h5/scripts/utils-h5.js",
    "src/hbec-trade-h5/js/constants-trade-h5.js"
    ];

gulp.task('look', function () {
    // gulp.watch(hbecJS, ['js-min']);
    gulp.watch([lessFiles], ['less-min']);
});
gulp.task('less-min',function(){
  return gulp.src([lessFiles,"!"+staticDir+"bower_components/**/*.less"])
        .pipe(plugins.less({
            relativeUrls: true
        }))
        .pipe(autoprefixer({
          browsers: ['last 20 versions'],
          cascade: true
         }))
        .pipe(minifycss())
        .pipe(gulp.dest( staticDir ));
});
gulp.task("js-min",function(){
   return gulp.src(hbecJS)
        .pipe(plugins.plumber())
        .pipe(plugins.concat("trade-main.js"))
        .pipe(gulp.dest("src/hbec-trade-h5/js/"))
        .pipe(plugins.uglify())
        .pipe(gulp.dest("src/hbec-trade-h5/js/"));
});


var connect = plugins.connect;
gulp.task('localhost', function() {
    connect.server({
        root: serverPath,
        port: 2222,
        livereload: true
    });
});

gulp.task("default",[ 'localhost','look']);





/**************************************************************************************/
//seajs模块 transport
var transport = require("gulp-seajs-transport");
gulp.task("seajs",function(){
    gulp.src( staticDir + 'qqcg/build_o/**/*.js' )
        .pipe( transport() )
        .pipe( gulp.dest( 'src/dist/' ) )
});

/*图片压缩*/
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
gulp.task('min-image', function () {
    return gulp.src('src/images/*.*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        // .pipe(pngquant({quality: '65-80', speed: 4})())
        .pipe(gulp.dest('src/images'));
});

//iconfont npm
var iconfont = require('gulp-iconfont');
var runTimestamp = Math.round(Date.now()/1000);
var consolidate = require('gulp-consolidate');

gulp.task('iconfont', function(){
  return gulp.src(['src/static/icons/*.svg'])
    .pipe(iconfont({
      fontName: 'fxiaokefont' // required 
      //appendUnicode: true, // recommended option 
      //formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available 
      //timestamp: runTimestamp // recommended to get consistent builds when watching files 
    }))
      .on('glyphs', function(glyphs, options) {
            gulp.src('src/static/icons/fxiaokefont.css')
            .pipe(consolidate('lodash', {
              glyphs: glyphs,
              fontName: 'fxiaokefont',
              fontPath: '../',
              className: 'fxiaoke'
            }))
            .pipe(gulp.dest('src/static/fonts/css/'));
      })
    .pipe(gulp.dest('src/static/fonts/'));
});