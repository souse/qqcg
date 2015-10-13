var fs = require('fs'),
    gulp = require("gulp"),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();
var serverPath = './src/';//服务器资源路径
var connect = plugins.connect;
gulp.task('localhost', function() {
    connect.server({
        root: serverPath,
        port: 2222,
        livereload: true
    });
});

gulp.task("default",[ 'localhost']);