var config = require('../config')
if(!config.tasks.liveness) return

var path            = require('path')
var pathToUrl       = require('./pathToUrl')
var webpack         = require('webpack')
var LivenessSourcePlugin = require('./webpack-liveness-source-plugin');

module.exports = function(options = {}) {
  var jsSrc = path.resolve(config.root.src, config.tasks.js.src)
  var jsDest = config.root.livenessDest;
  var publicPath = pathToUrl(config.tasks.js.dest, '/')
  var uncompressed = options.uncompressed;

  var extensions = config.tasks.js.extensions.map(function(extension) {
    return '.' + extension
  })

  var filenamePattern = uncompressed ? '[name].js' : '[name].min.js'

  var webpackConfig = {
    context: jsSrc,
    plugins: [],
    resolve: {
      root: jsSrc,
      extensions: [''].concat(extensions)
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: config.tasks.js.babel
        }
      ]
    }
  }

  // Karma doesn't need entry points or output settings
  webpackConfig.entry = config.tasks.liveness.js.entries
  webpackConfig.output= {
    path: path.normalize(jsDest),
    filename: filenamePattern,
    publicPath: publicPath
  }
  
  webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new LivenessSourcePlugin(),
      new webpack.optimize.DedupePlugin()
  );

  if (!uncompressed) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
  }

  webpackConfig.plugins.push(new webpack.NoErrorsPlugin())

  return webpackConfig
}
