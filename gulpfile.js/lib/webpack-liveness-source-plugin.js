var shell = require('shelljs')
var path = require('path')
var config = require('../config')

var jsSrc = path.join(__dirname, '../..', config.root.src, config.tasks.js.src);

function LivenessSourcePlugin() {

}

LivenessSourcePlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    compilation.fileDependencies.forEach(fileSrc => {
      if (fileSrc.indexOf('src/javascripts') !== -1) {
        var dest = path.join(config.root.livenessDest, './src', path.relative(jsSrc, path.dirname(fileSrc)));
        if (!shell.test('-e', dest)) {
          shell.mkdir('-p', dest);
        }
        shell.cp(fileSrc, dest);
      }
    });
    callback();
  })
}

module.exports = LivenessSourcePlugin;